import { Worker } from 'worker_threads';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';

import { CrawlerConfig } from '../../config/crawler.config';
import { PlaywrightConfig } from '../../config/playwright.config';
import { LoggingConfig, createLogger } from '../../config/logging.config';
import { NormalizedWebsite } from '../types/Website';
import { CrawlResult, CrawlSummary } from '../types/CrawlResult';
import { WebsiteLoader } from './WebsiteLoader';
import { HttpCrawler } from './HttpCrawler';
import { PlaywrightCrawler } from './PlaywrightCrawler';
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
  private browserPool: BrowserPool;
  private fileManager: FileManager;
  private failedDomainManager: FailedDomainManager;
  private progressMonitor: ProgressMonitor;
  private logger: ReturnType<typeof createLogger>;
  private lastReportedProgress?: { completed: number };
  
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
    this.fileManager = new FileManager(config.outputDir);
    this.failedDomainManager = new FailedDomainManager();
    this.progressMonitor = new ProgressMonitor();
    
    // Event-Listener für den Fortschritt
    this.progressMonitor.on(ProgressEvent.PROGRESS, (progress) => {
      this.logger.info('Fortschritt', { progress });
      
      // Fortschritt in der Konsole ausgeben, aber nur bei signifikanten Änderungen
      // Ausgabe nur bei 0%, 10%, 20%, ..., 100% oder alle 50 verarbeiteten Websites
      const percent = progress.percentComplete;
      const percentRounded = Math.floor(percent / 10) * 10;
      const isSignificantProgress = 
        (progress.completed % 50 === 0) || // Alle 50 Websites
        (Math.floor(percent) === percentRounded && // Volle 10% erreicht
         (this.lastReportedProgress === undefined || progress.completed > this.lastReportedProgress.completed));
      
      if (isSignificantProgress || progress.completed === progress.total) {
        this.lastReportedProgress = { ...progress };
        const percentFormatted = percent.toFixed(2);
        const remaining = progress.estimatedTimeRemaining 
          ? Math.round(progress.estimatedTimeRemaining)
          : 'unbekannt';
        
        console.log(`Fortschritt: ${percentFormatted}% (${progress.completed}/${progress.total}) - Verbleibend: ${remaining}s`);
      }
    });
    
    this.progressMonitor.on(ProgressEvent.COMPLETE, (progress, results) => {
      this.logger.info('Crawling abgeschlossen', { progress });
      console.log(`Crawling abgeschlossen: ${progress.successful} erfolgreich, ${progress.failed} fehlgeschlagen, ${progress.skipped} übersprungen`);
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
    this.logger.info('Initialisiere Services');
    
    await this.fileManager.initialize();
    await this.failedDomainManager.initialize();
    
    if (this.config.browserFallback) {
      await this.browserPool.initialize();
    }
  }
  
  /**
   * Führt das Crawling für alle Websites durch
   */
  async crawlAllSites(): Promise<CrawlSummary> {
    const startTime = new Date();
    const crawlId = uuidv4();
    
    this.logger.info('Starte Crawling', { crawlId, startTime });
    
    try {
      // Websites laden und normalisieren
      const websites = await this.websiteLoader.loadNormalizedWebsites();
      
      // Fortschrittsmonitor starten
      this.progressMonitor.start(websites.length);
      
      // Websites in Batches aufteilen
      const batches = this.websiteLoader.splitIntoBatches(websites, this.config.batchSize);
      
      this.logger.info('Websites geladen', { 
        totalWebsites: websites.length,
        batches: batches.length,
        batchSize: this.config.batchSize
      });
      
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
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        totalDuration: (endTime.getTime() - startTime.getTime()) / 1000,
        avgResponseTime: results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length,
        config: {
          parallelWorkers: this.config.parallelWorkers,
          batchSize: this.config.batchSize,
          browserFallback: this.config.browserFallback
        }
      };
      
      // Ergebnisse speichern
      await this.fileManager.saveCrawlResults(results);
      await this.fileManager.saveCrawlSummary(summary);
      
      this.logger.info('Crawling abgeschlossen', { summary });
      
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
      }
    }
  }
  
  /**
   * Verarbeitet einen Batch von Websites
   */
  private async processBatch(batch: NormalizedWebsite[], batchIndex: number): Promise<CrawlResult[]> {
    this.logger.info(`Verarbeite Batch ${batchIndex + 1}`, { batchSize: batch.length });
    
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
            } catch (browserError) {
              // Beide Methoden fehlgeschlagen
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
