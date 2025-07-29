import { BotAnalyzer } from './bot/BotAnalyzer';
import { WebsiteAnalyzer } from './website/WebsiteAnalyzer';
import { TemporalAnalyzer } from './temporal/TemporalAnalyzer';
import { AnalysisConfig } from '../types/Analysis';
import { analysisConfig } from '../../config/analysis.config';
import fs from 'fs-extra';
import path from 'path';

/**
 * Koordiniert die verschiedenen Analyzer und führt die Analyse durch
 */
export class AnalysisOrchestrator {
  private config: AnalysisConfig;
  private botAnalyzer: BotAnalyzer;
  private websiteAnalyzer: WebsiteAnalyzer;
  private temporalAnalyzer: TemporalAnalyzer;
  
  constructor(configOverrides?: Partial<AnalysisConfig>) {
    // Konfiguration laden
    this.config = { ...analysisConfig, ...configOverrides };
    
    // Analyzer initialisieren
    this.botAnalyzer = new BotAnalyzer(this.config);
    this.websiteAnalyzer = new WebsiteAnalyzer(this.config);
    this.temporalAnalyzer = new TemporalAnalyzer(this.config);
  }
  
  /**
   * Initialisiert den AnalysisOrchestrator und alle Analyzer
   */
  async initialize(): Promise<void> {
    console.log('Initialisiere Analyzer...');
    
    // Verzeichnisse sicherstellen
    await fs.ensureDir(this.config.paths.analysisOutput);
    
    // Analyzer initialisieren
    await this.botAnalyzer.initialize();
    await this.websiteAnalyzer.initialize();
    await this.temporalAnalyzer.initialize();
    
    console.log('Analyzer initialisiert.');
  }
  
  /**
   * Führt die vollständige Analyse durch
   */
  async runAnalysis(): Promise<void> {
    console.log('Starte Analyse...');
    
    // Prüfen, ob das Robots-Files-Verzeichnis existiert
    if (!await fs.pathExists(this.config.paths.crawlResults)) {
      throw new Error(`Robots-Files-Verzeichnis nicht gefunden: ${this.config.paths.crawlResults}`);
    }
    
    // Bot-Analyse durchführen
    console.log('Führe Bot-Analyse durch...');
    const botStats = await this.botAnalyzer.analyzeBots();
    
    // Website-Analyse durchführen
    console.log('Führe Website-Analyse durch...');
    await this.websiteAnalyzer.analyzeAllWebsites();
    
    // Zeitliche Analyse durchführen
    console.log('Führe zeitliche Analyse durch...');
    await this.temporalAnalyzer.analyzeTrends(botStats);
    
    // Zusammenfassung erstellen
    await this.createSummary(botStats);
    
    console.log('Analyse abgeschlossen.');
  }
  
  /**
   * Erstellt eine Zusammenfassung der Analyse
   */
  private async createSummary(botStats: any): Promise<void> {
    const summary = {
      lastUpdated: new Date().toISOString(),
      totalBots: botStats.totalBots,
      totalWebsites: botStats.totalWebsites,
      botCategories: botStats.botCategories,
      topBots: Object.entries(botStats.bots)
        .map(([name, bot]: [string, any]) => ({
          name,
          category: bot.category,
          totalWebsites: Object.values(bot.monthlyStats).reduce((sum: number, stats: any) => sum + stats.totalWebsites, 0),
          allowedWebsites: Object.values(bot.monthlyStats).reduce((sum: number, stats: any) => sum + stats.allowedWebsites, 0),
          disallowedWebsites: Object.values(bot.monthlyStats).reduce((sum: number, stats: any) => sum + stats.disallowedWebsites, 0)
        }))
        .sort((a: any, b: any) => b.totalWebsites - a.totalWebsites)
        .slice(0, 20)
    };
    
    const filePath = path.join(this.config.paths.analysisOutput, 'summary.json');
    
    try {
      await fs.writeFile(filePath, JSON.stringify(summary, null, 2), 'utf-8');
      console.log(`Zusammenfassung gespeichert in ${filePath}`);
    } catch (error) {
      console.error('Fehler beim Speichern der Zusammenfassung:', error);
    }
  }
  
  /**
   * Gibt die Konfiguration zurück
   */
  getConfig(): AnalysisConfig {
    return this.config;
  }
}
