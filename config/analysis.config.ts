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
  
  // Bot-Kategorien Konfiguration
  botCategories: {
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
