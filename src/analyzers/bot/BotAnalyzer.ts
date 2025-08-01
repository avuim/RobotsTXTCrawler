import fs from 'fs-extra';
import path from 'path';
import { BotCategory, BotInfo, BotStatistics, BotCategories } from '../../types/Analysis';
import { AnalysisConfig } from '../../types/Analysis';

interface BotCategoriesFile {
  categories: {
    [category: string]: {
      name: string;
      description: string;
      bots: {
        [botName: string]: {
          name: string;
          owner: string;
          description: string;
          website: string;
        }
      }
    }
  }
}

export class BotAnalyzer {
  private config: AnalysisConfig;
  private botCategories: BotCategoriesFile | null = null;
  
  constructor(config: AnalysisConfig) {
    this.config = config;
  }
  
  /**
   * Initialisiert den BotAnalyzer
   */
  async initialize(): Promise<void> {
    // Verzeichnisse sicherstellen
    await fs.ensureDir(this.config.paths.analysisOutput);
    
    // Bot-Kategorien laden
    try {
      const botCategoriesFile = path.join(this.config.paths.analysisOutput, 'bot-categories.json');
      if (await fs.pathExists(botCategoriesFile)) {
        const content = await fs.readFile(botCategoriesFile, 'utf-8');
        this.botCategories = JSON.parse(content) as BotCategoriesFile;
      } else {
        console.warn(`Bot-Kategorien-Datei nicht gefunden: ${botCategoriesFile}`);
        this.botCategories = { categories: {} };
      }
    } catch (error) {
      console.error('Fehler beim Laden der Bot-Kategorien:', error);
      this.botCategories = { categories: {} };
    }
  }
  
  /**
   * Analysiert alle robots.txt-Dateien und extrahiert Informationen zu Bots
   */
  async analyzeBots(): Promise<BotStatistics> {
    console.log('Analysiere Bots in robots.txt-Dateien...');
    
    // Prüfen, ob das Verzeichnis existiert
    if (!await fs.pathExists(this.config.paths.crawlResults)) {
      throw new Error(`Robots-Files-Verzeichnis nicht gefunden: ${this.config.paths.crawlResults}`);
    }
    
    // Alle robots.txt-Dateien auflisten
    const files = await fs.readdir(this.config.paths.crawlResults);
    const robotsFiles = files.filter(file => file.endsWith('-robots.txt') || file.endsWith('.txt'));
    
    console.log(`${robotsFiles.length} robots.txt-Dateien gefunden.`);
    
    // Kategorien aus der Kategorien-Datei extrahieren
    const botCategories: BotCategories = {};
    
    // Wenn Bot-Kategorien geladen wurden, diese verwenden
    if (this.botCategories && this.botCategories.categories) {
      Object.keys(this.botCategories.categories).forEach(category => {
        botCategories[category] = 0;
      });
    } else {
      // Fallback: Nur die Default-Kategorie aus der Konfiguration verwenden
      botCategories[this.config.botCategories.defaultCategory] = 0;
    }
    
    // Statistiken initialisieren
    const botStats: BotStatistics = {
      lastUpdated: new Date().toISOString(),
      totalWebsites: robotsFiles.length,
      totalBots: 0,
      botCategories,
      bots: {}
    };
    
    // Aktueller Monat für die Statistiken
    const currentMonth = new Date().toISOString().substring(0, 7); // Format: YYYY-MM
    
    // Jede robots.txt-Datei analysieren
    for (const file of robotsFiles) {
      const filePath = path.join(this.config.paths.crawlResults, file);
      
      try {
        // Domain aus Dateinamen extrahieren
        const domain = file.replace('-robots.txt', '').replace('.txt', '');
        
        // Datei lesen
        const content = await fs.readFile(filePath, 'utf-8');
        
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
            
            // Bot in Statistiken aufnehmen, wenn noch nicht vorhanden
            if (!botStats.bots[currentUserAgent]) {
              // Bot-Kategorie bestimmen
              const category = this.determineBotCategory(currentUserAgent);
              
              // Bot-Info erstellen
              botStats.bots[currentUserAgent] = {
                name: currentUserAgent,
                category,
                monthlyStats: {}
              };
              
              // Bot-Informationen aus Kategorien-Datei hinzufügen, falls vorhanden
              this.addBotInfoFromCategories(botStats.bots[currentUserAgent]);
              
              // Kategorie-Zähler erhöhen
              botStats.botCategories[category]++;
            }
            
            // Monatliche Statistiken initialisieren, falls noch nicht vorhanden
            if (!botStats.bots[currentUserAgent].monthlyStats[currentMonth]) {
              botStats.bots[currentUserAgent].monthlyStats[currentMonth] = {
                totalWebsites: 0,
                allowedWebsites: 0,
                disallowedWebsites: 0,
                websites: {
                  allowed: [],
                  disallowed: []
                }
              };
            }
            
            const monthlyStats = botStats.bots[currentUserAgent].monthlyStats[currentMonth];
            
            // Website zu den entsprechenden Listen hinzufügen, falls noch nicht vorhanden
            if (isAllowed) {
              if (!monthlyStats.websites.allowed.includes(domain)) {
                monthlyStats.websites.allowed.push(domain);
                monthlyStats.allowedWebsites++;
              }
            } else {
              if (!monthlyStats.websites.disallowed.includes(domain)) {
                monthlyStats.websites.disallowed.push(domain);
                monthlyStats.disallowedWebsites++;
              }
            }
            
            // Gesamtzahl der Websites aktualisieren
            monthlyStats.totalWebsites = monthlyStats.allowedWebsites + monthlyStats.disallowedWebsites;
          }
        }
      } catch (error) {
        console.error(`Fehler beim Analysieren von ${file}:`, error);
      }
    }
    
    // Gesamtzahl der Bots aktualisieren
    botStats.totalBots = Object.keys(botStats.bots).length;
    
    // Statistiken speichern
    await this.saveBotStatistics(botStats);
    
    // Bot-Kategorien aktualisieren
    await this.updateBotCategories(botStats);
    
    console.log(`Analyse abgeschlossen. ${botStats.totalBots} Bots in ${botStats.totalWebsites} Websites gefunden.`);
    
    return botStats;
  }
  
  /**
   * Bestimmt die Kategorie eines Bots anhand seines Namens
   */
  private determineBotCategory(userAgent: string): BotCategory {
    if (!this.botCategories) {
      return this.config.botCategories.defaultCategory as BotCategory;
    }
    
    const userAgentLower = userAgent.toLowerCase();
    
    // Durch alle Kategorien iterieren
    for (const [category, data] of Object.entries(this.botCategories.categories)) {
      // Prüfen, ob der Bot in dieser Kategorie definiert ist
      if (data.bots && data.bots[userAgent]) {
        return category as BotCategory;
      }
      
      // Prüfen, ob der Bot-Name in einem der definierten Bots enthalten ist
      for (const botName of Object.keys(data.bots || {})) {
        if (userAgentLower.includes(botName.toLowerCase()) || 
            botName.toLowerCase().includes(userAgentLower)) {
          return category as BotCategory;
        }
      }
    }
    
    // Wenn keine Kategorie gefunden wurde, Standardkategorie verwenden
    return this.config.botCategories.defaultCategory as BotCategory;
  }
  
  /**
   * Fügt Bot-Informationen aus der Kategorien-Datei hinzu
   */
  private addBotInfoFromCategories(botInfo: BotInfo): void {
    if (!this.botCategories) {
      return;
    }
    
    // Durch alle Kategorien iterieren
    for (const [category, data] of Object.entries(this.botCategories.categories)) {
      // Prüfen, ob der Bot in dieser Kategorie definiert ist
      if (data.bots && data.bots[botInfo.name]) {
        const bot = data.bots[botInfo.name];
        botInfo.owner = bot.owner;
        botInfo.description = bot.description;
        botInfo.website = bot.website;
        return;
      }
      
      // Prüfen, ob der Bot-Name in einem der definierten Bots enthalten ist
      for (const [botName, bot] of Object.entries(data.bots || {})) {
        if (botInfo.name.includes(botName) || botName.includes(botInfo.name)) {
          botInfo.owner = bot.owner;
          botInfo.description = bot.description;
          botInfo.website = bot.website;
          return;
        }
      }
    }
  }
  
  /**
   * Speichert die Bot-Statistiken
   */
  private async saveBotStatistics(botStats: BotStatistics): Promise<void> {
    const filePath = this.config.paths.botStatistics;
    
    try {
      // Bestehende Statistiken laden, falls vorhanden
      let existingStats: BotStatistics | null = null;
      
      if (await fs.pathExists(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        existingStats = JSON.parse(content) as BotStatistics;
      }
      
      // Wenn bestehende Statistiken vorhanden sind, historische Daten beibehalten
      if (existingStats) {
        const currentMonth = new Date().toISOString().substring(0, 7); // Format: YYYY-MM
        
        // Durch alle Bots in den neuen Statistiken iterieren
        for (const [botName, botInfo] of Object.entries(botStats.bots)) {
          // Wenn der Bot in den bestehenden Statistiken existiert
          if (existingStats.bots[botName]) {
            // Historische monatliche Statistiken beibehalten
            for (const [month, stats] of Object.entries(existingStats.bots[botName].monthlyStats)) {
              // Nur historische Daten (nicht den aktuellen Monat) übernehmen
              if (month !== currentMonth) {
                botInfo.monthlyStats[month] = stats;
              }
            }
            
            // Andere Informationen beibehalten, falls in den neuen Statistiken nicht vorhanden
            if (!botInfo.owner && existingStats.bots[botName].owner) {
              botInfo.owner = existingStats.bots[botName].owner;
            }
            
            if (!botInfo.description && existingStats.bots[botName].description) {
              botInfo.description = existingStats.bots[botName].description;
            }
            
            if (!botInfo.website && existingStats.bots[botName].website) {
              botInfo.website = existingStats.bots[botName].website;
            }
          }
        }
        
        // Bots aus den bestehenden Statistiken übernehmen, die in den neuen Statistiken nicht vorhanden sind
        for (const [botName, botInfo] of Object.entries(existingStats.bots)) {
          if (!botStats.bots[botName]) {
            botStats.bots[botName] = botInfo;
            
            // Kategorie-Zähler aktualisieren
            botStats.botCategories[botInfo.category]++;
            
            // Gesamtzahl der Bots aktualisieren
            botStats.totalBots++;
          }
        }
      }
      
      // Statistiken speichern
      await fs.writeFile(filePath, JSON.stringify(botStats, null, 2), 'utf-8');
      
      console.log(`Bot-Statistiken gespeichert in ${filePath}`);
    } catch (error) {
      console.error('Fehler beim Speichern der Bot-Statistiken:', error);
    }
  }
  
  /**
   * Aktualisiert die Bot-Kategorien-Datei mit neuen Bots
   */
  private async updateBotCategories(botStats: BotStatistics): Promise<void> {
    // Prüfen, ob botCategories geladen wurde
    if (!this.botCategories) {
      console.warn('Bot-Kategorien nicht geladen, keine Aktualisierung möglich');
      return;
    }
    
    let categoriesUpdated = false;
    const MIN_WEBSITES_THRESHOLD = 10; // Schwellenwert: Bot muss in mehr als 10 Websites gefunden werden
    
    // Alle Bots aus den Statistiken durchgehen
    for (const [botName, botInfo] of Object.entries(botStats.bots)) {
      // Prüfen, ob der Bot bereits in einer Kategorie existiert
      let botExists = false;
      
      for (const category of Object.values(this.botCategories.categories)) {
        if (category.bots && category.bots[botName]) {
          botExists = true;
          break;
        }
      }
      
      // Wenn der Bot nicht existiert, zur entsprechenden Kategorie hinzufügen
      if (!botExists) {
        // Gesamtzahl der Websites berechnen, in denen der Bot gefunden wurde
        let totalWebsites = 0;
        for (const monthStats of Object.values(botInfo.monthlyStats)) {
          totalWebsites += monthStats.totalWebsites;
        }
        
        // Nur hinzufügen, wenn der Bot in mehr als der Mindestzahl von Websites gefunden wurde
        if (totalWebsites > MIN_WEBSITES_THRESHOLD) {
          const categoryName = botInfo.category;
          
          // Sicherstellen, dass die Kategorie existiert
          if (!this.botCategories.categories[categoryName]) {
            this.botCategories.categories[categoryName] = {
              name: this.getCategoryDisplayName(categoryName),
              description: "",
              bots: {}
            };
          }
          
          // Bot zur Kategorie hinzufügen
          this.botCategories.categories[categoryName].bots[botName] = {
            name: botName,
            owner: "",
            description: "",
            website: ""
          };
          
          categoriesUpdated = true;
        }
      }
    }
    
    // Wenn Änderungen vorgenommen wurden, die aktualisierte Datei speichern
    if (categoriesUpdated) {
      const filePath = path.join(this.config.paths.analysisOutput, 'bot-categories.json');
      try {
        await fs.writeFile(filePath, JSON.stringify(this.botCategories, null, 2), 'utf-8');
        console.log(`Bot-Kategorien aktualisiert und in ${filePath} gespeichert`);
      } catch (error) {
        console.error('Fehler beim Speichern der Bot-Kategorien:', error);
      }
    }
  }
  
  /**
   * Hilfsmethode zum Ermitteln des Anzeigenamens einer Kategorie
   */
  private getCategoryDisplayName(categoryName: string): string {
    switch (categoryName) {
      case 'searchEngine': return 'Suchmaschinen';
      case 'seo': return 'SEO-Tools';
      case 'aiScraper': return 'KI/LLM-Scraper';
      case 'other': return 'Andere';
      default: return categoryName;
    }
  }
}
