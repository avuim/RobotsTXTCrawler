import { Worker } from 'worker_threads';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';
import * as cliProgress from 'cli-progress';

import { CrawlerConfig } from '../../config/crawler.config';
import { PlaywrightConfig } from '../../config/playwright.config';
import { LoggingConfig, createLogger } from '../../config/logging.config';
import { NormalizedWebsite } from '../types/Website';
import { CrawlResult, CrawlSummary } from '../types/CrawlResult';
import { WebsiteLoader } from './WebsiteLoader';
import { HttpCrawler } from './HttpCrawler';
import { PlaywrightCrawler } from './PlaywrightCrawler';
import { EnhancedPlaywrightCrawler } from './EnhancedPlaywrightCrawler';
import { BrowserPool } from './BrowserPool';
import { FileManager } from './FileManager';
import { FailedDomainManager } from './FailedDomainManager';
import { ProgressMonitor, ProgressEvent } from './ProgressMonitor';

export class CrawlOrchestrator {
  private config: CrawlerConfig;
  private playwrightConfig: PlaywrightConfig;
  private loggingConfig: LoggingConfig;
  private websiteLoader: WebsiteLoader;
  private httpCrawler: HttpCrawler;
  private playwrightCrawler: PlaywrightCrawler;
  private enhancedPlaywrightCrawler: EnhancedPlaywrightCrawler;
  private browserPool: BrowserPool;
  private fileManager: FileManager;
  private failedDomainManager: FailedDomainManager;
  private progressMonitor: ProgressMonitor;
  private logger: ReturnType<typeof createLogger>;
  private progressBar!: cliProgress.SingleBar;
  
  constructor(
    config: CrawlerConfig,
    playwrightConfig: PlaywrightConfig,
    loggingConfig: LoggingConfig
  ) {
    this.config = config;
    this.playwrightConfig = playwrightConfig;
    this.loggingConfig = loggingConfig;
    
    // Logger erstellen
    this.logger = createLogger(loggingConfig);
    
    // Services initialisieren
    this.websiteLoader = new WebsiteLoader();
    this.httpCrawler = new HttpCrawler(config);
    this.browserPool = new BrowserPool(playwrightConfig);
    this.playwrightCrawler = new PlaywrightCrawler(config, playwrightConfig);
    this.enhancedPlaywrightCrawler = new EnhancedPlaywrightCrawler(config, playwrightConfig);
    this.fileManager = new FileManager(config.outputDir);
    this.failedDomainManager = new FailedDomainManager();
    this.progressMonitor = new ProgressMonitor();
    
    // Fortschrittsbalken initialisieren (wird später im crawlAllSites erstellt)
    
    // Event-Listener für den Fortschritt
    this.progressMonitor.on(ProgressEvent.PROGRESS, (progress) => {
      // Fortschrittsbalken aktualisieren
      if (this.progressBar) {
        const remaining = progress.estimatedTimeRemaining 
          ? Math.round(progress.estimatedTimeRemaining)
          : 0;
        
        this.progressBar.update(progress.completed, {
          successful: progress.successful,
          failed: progress.failed,
          skipped: progress.skipped,
          remaining: `${remaining}s`
        });
      }
    });
    
    this.progressMonitor.on(ProgressEvent.COMPLETE, (progress, results) => {
      // Logging für Crawling-Abschluss deaktiviert, um die Zusammenfassung nicht zu stören
      
      // Fortschrittsbalken stoppen
      if (this.progressBar) {
        this.progressBar.stop();
      }
      
      // Zusammenfassung anzeigen
      console.log('\nCrawling abgeschlossen!');
      console.log(`- Gesamtdauer: ${progress.elapsedTime.toFixed(2)} Sekunden`);
      console.log(`- Verarbeitete Websites: ${progress.total}`);
      console.log(`- Erfolgreich: ${progress.successful}`);
      console.log(`- Fehlgeschlagen: ${progress.failed}`);
      console.log(`- Übersprungen: ${progress.skipped}`);
      
      // Durchschnittliche Antwortzeit berechnen (wenn verfügbar)
      if (results && results.length > 0) {
        const successfulResults = results.filter((r: CrawlResult) => r.status === 'success');
        if (successfulResults.length > 0) {
          const avgResponseTime = successfulResults.reduce((sum: number, r: CrawlResult) => sum + (r.responseTime || 0), 0) / successfulResults.length;
          console.log(`- Durchschnittliche Antwortzeit: ${avgResponseTime.toFixed(2)} ms`);
        }
      }
      
      console.log('\nErgebnisse wurden in ' + this.config.outputDir + ' gespeichert.');
    });
    
    this.progressMonitor.on(ProgressEvent.ERROR, (error) => {
      this.logger.error('Fehler beim Crawling', { error: error.message });
      console.error('Fehler beim Crawling:', error.message);
    });
  }
  
  /**
   * Initialisiert alle Services
   */
  async initialize(): Promise<void> {
    // Logging für Initialisierung deaktiviert, um die Konsolenausgabe nicht zu stören
    console.log('Initialisiere Services...');
    
    await this.fileManager.initialize();
    await this.failedDomainManager.initialize();
    
    if (this.config.browserFallback) {
      await this.browserPool.initialize();
      await this.enhancedPlaywrightCrawler.initialize();
    }
  }
  
  /**
   * Führt das Crawling für alle Websites durch
   */
  async crawlAllSites(): Promise<CrawlSummary> {
    const startTime = new Date();
    const crawlId = uuidv4();
    
    // Logging für Crawling-Start deaktiviert, um die Konsolenausgabe nicht zu stören
    console.log('Starte Crawling...');
    
    try {
      // Websites laden und normalisieren
      const websites = await this.websiteLoader.loadNormalizedWebsites();
      
      // Fortschrittsbalken initialisieren und starten, wenn er noch nicht existiert
      if (!this.progressBar) {
        this.progressBar = new cliProgress.SingleBar({
          format: 'Crawling [{bar}] {percentage}% | {value}/{total} Websites | Erfolgreich: {successful} | Fehlgeschlagen: {failed} | Übersprungen: {skipped} | Verbleibend: {remaining}',
          barCompleteChar: '\u2588',
          barIncompleteChar: '\u2591',
          hideCursor: true
        });
        
        // Fortschrittsbalken starten
        this.progressBar.start(websites.length, 0, {
          successful: 0,
          failed: 0,
          skipped: 0,
          remaining: 'berechne...'
        });
      }
      
      // Fortschrittsmonitor starten
      this.progressMonitor.start(websites.length);
      
      // Websites in Batches aufteilen
      const batches = this.websiteLoader.splitIntoBatches(websites, this.config.batchSize);
      
      // Parallelisierung mit p-limit
      const limit = pLimit(this.config.parallelWorkers);
      
      // Batches parallel verarbeiten
      const batchPromises = batches.map((batch, index) => 
        limit(() => this.processBatch(batch, index))
      );
      
      // Auf alle Batches warten
      const batchResults = await Promise.all(batchPromises);
      
      // Ergebnisse zusammenführen
      const results = batchResults.flat();
      
      // Zusammenfassung erstellen
      const endTime = new Date();
      const summary: CrawlSummary = {
        id: crawlId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        totalSites: websites.length,
        successful: results.filter((r: CrawlResult) => r.status === 'success').length,
        failed: results.filter((r: CrawlResult) => r.status === 'failed').length,
        skipped: results.filter((r: CrawlResult) => r.status === 'skipped').length,
        totalDuration: (endTime.getTime() - startTime.getTime()) / 1000,
        avgResponseTime: results.reduce((sum: number, r: CrawlResult) => sum + (r.responseTime || 0), 0) / results.length,
        config: {
          parallelWorkers: this.config.parallelWorkers,
          batchSize: this.config.batchSize,
          browserFallback: this.config.browserFallback
        }
      };
      
      // Ergebnisse speichern
      await this.fileManager.saveCrawlResults(results);
      await this.fileManager.saveCrawlSummary(summary);
      
      // Logging für Crawling-Abschluss deaktiviert, um die Zusammenfassung nicht zu stören
      
      return summary;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Fehler beim Crawling', { error: error.message });
        throw error;
      }
      throw new Error('Unbekannter Fehler beim Crawling');
    } finally {
      // Ressourcen freigeben
      if (this.config.browserFallback) {
        await this.browserPool.close();
        await this.enhancedPlaywrightCrawler.close();
      }
    }
  }
  
  /**
   * Verarbeitet einen Batch von Websites
   */
  private async processBatch(batch: NormalizedWebsite[], batchIndex: number): Promise<CrawlResult[]> {
    // Logging für Batch-Verarbeitung deaktiviert, um den Fortschrittsbalken nicht zu stören
    
    const results: CrawlResult[] = [];
    
    for (const website of batch) {
      try {
        // Prüfen, ob die Domain bereits fehlgeschlagen ist und nicht erneut versucht werden sollte
        if (this.failedDomainManager.isFailedDomain(website.domain) && 
            !this.failedDomainManager.shouldRetry(website.domain)) {
          
          const result: CrawlResult = {
            domain: website.domain,
            status: 'skipped',
            method: 'not_attempted',
            error: 'Domain bereits mehrfach fehlgeschlagen',
            timestamp: new Date().toISOString()
          };
          
          results.push(result);
          this.progressMonitor.update(result);
          continue;
        }
        
        // Prüfen, ob die robots.txt bereits existiert
        if (await this.fileManager.robotsTxtExists(website)) {
          const result: CrawlResult = {
            domain: website.domain,
            status: 'skipped',
            method: 'not_attempted',
            timestamp: new Date().toISOString(),
            outputFile: `${website.normalizedDomain}-robots.txt`
          };
          
          results.push(result);
          this.progressMonitor.update(result);
          continue;
        }
        
        // Versuchen, die robots.txt mit HTTP zu crawlen
        try {
          const result = await this.httpCrawler.crawlRobotsTxt(website);
          
          // robots.txt speichern
          if (result.content) {
            const fileName = await this.fileManager.saveRobotsTxt(website, result.content);
            result.outputFile = fileName;
          }
          
          results.push(result);
          this.progressMonitor.update(result);
          
          // Bei fehlgeschlagenen Domains den Eintrag entfernen, wenn erfolgreich
          if (this.failedDomainManager.isFailedDomain(website.domain)) {
            await this.failedDomainManager.removeFailedDomain(website.domain);
          }
        } catch (httpError) {
          // Wenn HTTP fehlschlägt und Browser-Fallback aktiviert ist
          if (this.config.browserFallback) {
            try {
              // Prüfen, ob es sich um einen HTTP 403-Fehler handelt
              const errorMessage = httpError instanceof Error ? httpError.message : 'Unbekannter Fehler';
              const isHttp403 = errorMessage.includes('HTTP 403');
              
              // Bei HTTP 403 den EnhancedPlaywrightCrawler verwenden
              if (isHttp403) {
                try {
                  this.logger.info('HTTP 403 erkannt, verwende EnhancedPlaywrightCrawler', { domain: website.domain });
                  
                  const result = await this.enhancedPlaywrightCrawler.crawlRobotsTxt(website);
                  
                  // robots.txt speichern
                  if (result.content) {
                    const fileName = await this.fileManager.saveRobotsTxt(website, result.content);
                    result.outputFile = fileName;
                  }
                  
                  results.push(result);
                  this.progressMonitor.update(result);
                  
                  // Bei fehlgeschlagenen Domains den Eintrag entfernen, wenn erfolgreich
                  if (this.failedDomainManager.isFailedDomain(website.domain)) {
                    await this.failedDomainManager.removeFailedDomain(website.domain);
                  }
                } catch (enhancedError) {
                  // Auch der EnhancedPlaywrightCrawler ist fehlgeschlagen, Standard-Playwright versuchen
                  this.logger.warn('EnhancedPlaywrightCrawler fehlgeschlagen, versuche Standard-Playwright', { 
                    domain: website.domain,
                    error: enhancedError instanceof Error ? enhancedError.message : 'Unbekannter Fehler'
                  });
                  
                  // Weiter mit dem Standard-Playwright-Crawler
                  const result = await this.playwrightCrawler.crawlRobotsTxt(website);
                  
                  // robots.txt speichern
                  if (result.content) {
                    const fileName = await this.fileManager.saveRobotsTxt(website, result.content);
                    result.outputFile = fileName;
                  }
                  
                  results.push(result);
                  this.progressMonitor.update(result);
                  
                  // Bei fehlgeschlagenen Domains den Eintrag entfernen, wenn erfolgreich
                  if (this.failedDomainManager.isFailedDomain(website.domain)) {
                    await this.failedDomainManager.removeFailedDomain(website.domain);
                  }
                }
              } else {
                // Kein HTTP 403, Standard-Playwright verwenden
                const result = await this.playwrightCrawler.crawlRobotsTxt(website);
                
                // robots.txt speichern
                if (result.content) {
                  const fileName = await this.fileManager.saveRobotsTxt(website, result.content);
                  result.outputFile = fileName;
                }
                
                results.push(result);
                this.progressMonitor.update(result);
                
                // Bei fehlgeschlagenen Domains den Eintrag entfernen, wenn erfolgreich
                if (this.failedDomainManager.isFailedDomain(website.domain)) {
                  await this.failedDomainManager.removeFailedDomain(website.domain);
                }
              }
            } catch (browserError) {
              // Alle Methoden fehlgeschlagen
              const errorMessage = browserError instanceof Error ? browserError.message : 'Unbekannter Fehler';
              
              const result: CrawlResult = {
                domain: website.domain,
                status: 'failed',
                method: 'both_failed',
                error: errorMessage,
                timestamp: new Date().toISOString()
              };
              
              results.push(result);
              this.progressMonitor.update(result);
              
              // Fehlgeschlagene Domain speichern
              await this.failedDomainManager.addFailedDomain(website.domain, errorMessage);
            }
          } else {
            // Kein Browser-Fallback, HTTP-Fehler direkt protokollieren
            const errorMessage = httpError instanceof Error ? httpError.message : 'Unbekannter Fehler';
            
            const result: CrawlResult = {
              domain: website.domain,
              status: 'failed',
              method: 'http',
              error: errorMessage,
              timestamp: new Date().toISOString()
            };
            
            results.push(result);
            this.progressMonitor.update(result);
            
            // Fehlgeschlagene Domain speichern
            await this.failedDomainManager.addFailedDomain(website.domain, errorMessage);
          }
        }
      } catch (error) {
        // Unerwarteter Fehler
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        
        const result: CrawlResult = {
          domain: website.domain,
          status: 'failed',
          error: `Unerwarteter Fehler: ${errorMessage}`,
          timestamp: new Date().toISOString()
        };
        
        results.push(result);
        this.progressMonitor.update(result);
        
        this.logger.error('Unerwarteter Fehler beim Crawling', { 
          domain: website.domain, 
          error: errorMessage 
        });
      }
    }
    
    return results;
  }
}
