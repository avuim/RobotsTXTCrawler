/**
 * Konfiguration für die Analyse der robots.txt-Daten
 */

import path from 'path';

export const analysisConfig = {
  // Pfade für Eingabe- und Ausgabedaten
  paths: {
    // Eingabedaten aus dem Crawler
    crawlResults: path.resolve(process.cwd(), 'output'),
    
    // Ausgabedaten für die Analyse
    analysisOutput: path.resolve(process.cwd(), 'data/analysis'),
    
    // Bot-Statistiken
    botStatistics: path.resolve(process.cwd(), 'data/bot-statistics.json'),
  },
  
  // Bot-Kategorien und ihre Zuordnungen
  botCategories: {
    // Suchmaschinen-Bots
    searchEngine: [
      'googlebot',
      'bingbot',
      'yandexbot',
      'duckduckbot',
      'baiduspider',
      'petalbot',
      'slurp',
      'applebot',
      'sogou'
    ],
    
    // SEO-Tool-Bots
    seo: [
      'ahrefsbot',
      'mj12bot',
      'semrushbot',
      'screaming frog',
      'seokicks',
      'sistrix',
      'seobility'
    ],
    
    // KI/LLM-Scraper-Bots
    aiScraper: [
      'gptbot',
      'ccbot',
      'claudebot',
      'anthropic-ai',
      'cohere-ai',
      'omgilibot',
      'perplexitybot',
      'bard'
    ],
    
    // Standardkategorie für unbekannte Bots
    defaultCategory: 'other'
  },
  
  // Analyse-Einstellungen
  settings: {
    // Minimale Anzahl an Websites, die einen Bot erwähnen müssen, damit er in die Analyse aufgenommen wird
    minWebsitesForBot: 5,
    
    // Maximale Anzahl an Top-Bots, die in der Dashboard-Zusammenfassung angezeigt werden
    maxTopBots: 10,
    
    // Anzahl der Monate, die für Trend-Analysen berücksichtigt werden
    trendMonths: 6
  }
};
