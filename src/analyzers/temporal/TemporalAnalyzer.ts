import fs from 'fs-extra';
import path from 'path';
import { BotStatistics } from '../../types/Analysis';
import { AnalysisConfig } from '../../types/Analysis';

interface MonthlyTrend {
  month: string;
  totalBots: number;
  totalWebsites: number;
  botCategories: {
    searchEngine: number;
    seo: number;
    aiScraper: number;
    other: number;
  };
  topBots: {
    name: string;
    websites: number;
    allowed: number;
    disallowed: number;
  }[];
}

export class TemporalAnalyzer {
  private config: AnalysisConfig;
  
  constructor(config: AnalysisConfig) {
    this.config = config;
  }
  
  /**
   * Initialisiert den TemporalAnalyzer
   */
  async initialize(): Promise<void> {
    // Verzeichnisse sicherstellen
    await fs.ensureDir(this.config.paths.analysisOutput);
    await fs.ensureDir(path.join(this.config.paths.analysisOutput, 'trends'));
  }
  
  /**
   * Analysiert die zeitlichen Trends basierend auf den Bot-Statistiken
   */
  async analyzeTrends(botStats: BotStatistics): Promise<MonthlyTrend[]> {
    console.log('Analysiere zeitliche Trends...');
    
    const trends: MonthlyTrend[] = [];
    const months = new Set<string>();
    
    // Alle vorhandenen Monate sammeln
    for (const botName in botStats.bots) {
      const bot = botStats.bots[botName];
      for (const month in bot.monthlyStats) {
        months.add(month);
      }
    }
    
    // Monate sortieren
    const sortedMonths = Array.from(months).sort();
    
    // Für jeden Monat einen Trend erstellen
    for (const month of sortedMonths) {
      const trend: MonthlyTrend = {
        month,
        totalBots: 0,
        totalWebsites: 0,
        botCategories: {
          searchEngine: 0,
          seo: 0,
          aiScraper: 0,
          other: 0
        },
        topBots: []
      };
      
      // Bots für diesen Monat zählen
      const botsInMonth: {
        [botName: string]: {
          name: string;
          category: string;
          websites: number;
          allowed: number;
          disallowed: number;
        }
      } = {};
      
      // Websites für diesen Monat sammeln
      const websitesInMonth = new Set<string>();
      
      // Durch alle Bots iterieren
      for (const botName in botStats.bots) {
        const bot = botStats.bots[botName];
        const monthlyStats = bot.monthlyStats[month];
        
        if (monthlyStats) {
          // Bot für diesen Monat zählen
          if (!botsInMonth[botName]) {
            botsInMonth[botName] = {
              name: botName,
              category: bot.category,
              websites: 0,
              allowed: 0,
              disallowed: 0
            };
          }
          
          // Statistiken aktualisieren
          botsInMonth[botName].websites += monthlyStats.totalWebsites;
          botsInMonth[botName].allowed += monthlyStats.allowedWebsites;
          botsInMonth[botName].disallowed += monthlyStats.disallowedWebsites;
          
          // Kategorie-Zähler erhöhen
          trend.botCategories[bot.category]++;
          
          // Websites sammeln
          for (const domain of monthlyStats.websites.allowed) {
            websitesInMonth.add(domain);
          }
          for (const domain of monthlyStats.websites.disallowed) {
            websitesInMonth.add(domain);
          }
        }
      }
      
      // Gesamtzahlen aktualisieren
      trend.totalBots = Object.keys(botsInMonth).length;
      trend.totalWebsites = websitesInMonth.size;
      
      // Top-Bots ermitteln (nach Anzahl der Websites sortiert)
      trend.topBots = Object.values(botsInMonth)
        .sort((a, b) => b.websites - a.websites)
        .slice(0, 10)
        .map(bot => ({
          name: bot.name,
          websites: bot.websites,
          allowed: bot.allowed,
          disallowed: bot.disallowed
        }));
      
      // Trend zur Liste hinzufügen
      trends.push(trend);
    }
    
    // Trends speichern
    await this.saveTrends(trends);
    
    console.log(`Trendanalyse abgeschlossen. ${trends.length} Monate analysiert.`);
    
    return trends;
  }
  
  /**
   * Speichert die Trend-Analyse
   */
  private async saveTrends(trends: MonthlyTrend[]): Promise<void> {
    const filePath = path.join(this.config.paths.analysisOutput, 'trends', 'monthly-trends.json');
    
    try {
      await fs.writeFile(filePath, JSON.stringify(trends, null, 2), 'utf-8');
      console.log(`Trends gespeichert in ${filePath}`);
    } catch (error) {
      console.error('Fehler beim Speichern der Trends:', error);
    }
  }
}
