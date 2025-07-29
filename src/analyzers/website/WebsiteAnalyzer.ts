import fs from 'fs-extra';
import path from 'path';
import { WebsiteAnalysis } from '../../types/Analysis';
import { AnalysisConfig } from '../../types/Analysis';
import { NormalizedWebsite } from '../../types/Website';

export class WebsiteAnalyzer {
  private config: AnalysisConfig;
  
  constructor(config: AnalysisConfig) {
    this.config = config;
  }
  
  /**
   * Initialisiert den WebsiteAnalyzer
   */
  async initialize(): Promise<void> {
    // Verzeichnisse sicherstellen
    await fs.ensureDir(this.config.paths.analysisOutput);
    await fs.ensureDir(path.join(this.config.paths.analysisOutput, 'websites'));
  }
  
  /**
   * Analysiert eine robots.txt-Datei für eine bestimmte Website
   */
  async analyzeWebsite(website: NormalizedWebsite): Promise<WebsiteAnalysis | null> {
    const robotsFilePath = path.join(this.config.paths.crawlResults, `${website.normalizedDomain}-robots.txt`);
    
    // Prüfen, ob die robots.txt-Datei existiert
    if (!await fs.pathExists(robotsFilePath)) {
      console.warn(`robots.txt-Datei nicht gefunden für ${website.domain}: ${robotsFilePath}`);
      return null;
    }
    
    try {
      // Datei lesen
      const content = await fs.readFile(robotsFilePath, 'utf-8');
      
      // Analyse-Ergebnis initialisieren
      const analysis: WebsiteAnalysis = {
        domain: website.domain,
        normalizedDomain: website.normalizedDomain,
        bots: []
      };
      
      // Zeilen aufteilen
      const lines = content.split('\n');
      
      // Aktueller User-Agent
      let currentUserAgent: string | null = null;
      
      // Durch jede Zeile iterieren
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // User-Agent-Zeile
        if (line.toLowerCase().startsWith('user-agent:')) {
          const userAgent = line.substring('user-agent:'.length).trim();
          currentUserAgent = userAgent;
        }
        // Allow/Disallow-Zeile
        else if (currentUserAgent && (line.toLowerCase().startsWith('allow:') || line.toLowerCase().startsWith('disallow:'))) {
          const isAllowed = line.toLowerCase().startsWith('allow:');
          
          // Prüfen, ob der Bot bereits in der Liste ist
          const existingBot = analysis.bots.find(bot => bot.name === currentUserAgent);
          
          if (!existingBot) {
            // Bot zur Liste hinzufügen
            analysis.bots.push({
              name: currentUserAgent,
              allowed: isAllowed
            });
          } else {
            // Wenn der Bot bereits in der Liste ist, den Allow-Status aktualisieren
            // Wenn es sowohl Allow als auch Disallow gibt, nehmen wir an, dass der Bot erlaubt ist
            if (isAllowed) {
              existingBot.allowed = true;
            }
          }
        }
      }
      
      // Analyse-Ergebnis speichern
      await this.saveWebsiteAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error(`Fehler beim Analysieren der Website ${website.domain}:`, error);
      return null;
    }
  }
  
  /**
   * Analysiert alle robots.txt-Dateien
   */
  async analyzeAllWebsites(): Promise<WebsiteAnalysis[]> {
    console.log('Analysiere alle Websites...');
    
    // Prüfen, ob das Verzeichnis existiert
    if (!await fs.pathExists(this.config.paths.crawlResults)) {
      throw new Error(`Robots-Files-Verzeichnis nicht gefunden: ${this.config.paths.crawlResults}`);
    }
    
    // Alle robots.txt-Dateien auflisten
    const files = await fs.readdir(this.config.paths.crawlResults);
    const robotsFiles = files.filter(file => file.endsWith('-robots.txt') || file.endsWith('.txt'));
    
    console.log(`${robotsFiles.length} robots.txt-Dateien gefunden.`);
    
    const results: WebsiteAnalysis[] = [];
    
    // Jede robots.txt-Datei analysieren
    for (const file of robotsFiles) {
      try {
        // Domain aus Dateinamen extrahieren
        const normalizedDomain = file.replace('-robots.txt', '').replace('.txt', '');
        
        // Website-Objekt erstellen
        const website: NormalizedWebsite = {
          domain: normalizedDomain, // Vereinfachung: Wir verwenden den normalisierten Domainnamen als Domain
          normalizedDomain,
          originalSite: normalizedDomain,
          robotsTxtUrl: `https://${normalizedDomain}/robots.txt`
        };
        
        // Website analysieren
        const analysis = await this.analyzeWebsite(website);
        
        if (analysis) {
          results.push(analysis);
        }
      } catch (error) {
        console.error(`Fehler beim Analysieren von ${file}:`, error);
      }
    }
    
    console.log(`Analyse abgeschlossen. ${results.length} Websites analysiert.`);
    
    return results;
  }
  
  /**
   * Speichert die Analyse-Ergebnisse für eine Website
   */
  private async saveWebsiteAnalysis(analysis: WebsiteAnalysis): Promise<void> {
    const filePath = path.join(this.config.paths.analysisOutput, 'websites', `${analysis.normalizedDomain}.json`);
    
    try {
      await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Fehler beim Speichern der Analyse für ${analysis.domain}:`, error);
    }
  }
}
