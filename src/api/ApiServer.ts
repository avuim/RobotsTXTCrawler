import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { AnalysisConfig } from '../types/Analysis';
import { analysisConfig } from '../../config/analysis.config';

export class ApiServer {
  private app: express.Application;
  private port: number;
  private config: AnalysisConfig;
  
  constructor(port: number = 3001, configOverrides?: Partial<AnalysisConfig>) {
    this.port = port;
    this.config = { ...analysisConfig, ...configOverrides };
    this.app = express();
    
    // Middleware
    this.app.use(cors());
    this.app.use(express.json());
    
    // Statische Dateien (Frontend)
    this.app.use(express.static(path.join(__dirname, '../../src/frontend/build')));
    
    // API-Routen registrieren
    this.registerRoutes();
  }
  
  /**
   * Registriert die API-Routen
   */
  private registerRoutes(): void {
    // Zusammenfassung
    this.app.get('/api/summary', async (req: Request, res: Response) => {
      try {
        const filePath = path.join(this.config.paths.analysisOutput, 'summary.json');
        if (await fs.pathExists(filePath)) {
          const data = await fs.readFile(filePath, 'utf-8');
          res.json(JSON.parse(data));
        } else {
          res.status(404).json({ error: 'Zusammenfassung nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Zusammenfassung:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Bot-Statistiken
    this.app.get('/api/bots', async (req: Request, res: Response) => {
      try {
        const filePath = this.config.paths.botStatistics;
        if (await fs.pathExists(filePath)) {
          const data = await fs.readFile(filePath, 'utf-8');
          const botStats = JSON.parse(data);
          
          // Transformiere die Bots in das erwartete Format für die Frontend-Komponente
          const botList = Object.entries(botStats.bots).map(([name, botInfo]: [string, any]) => {
            // Berechne die Gesamtzahlen über alle Monate
            const totalWebsites = Object.values(botInfo.monthlyStats).reduce(
              (sum: number, stats: any) => sum + stats.totalWebsites, 0
            );
            const allowedWebsites = Object.values(botInfo.monthlyStats).reduce(
              (sum: number, stats: any) => sum + stats.allowedWebsites, 0
            );
            const disallowedWebsites = Object.values(botInfo.monthlyStats).reduce(
              (sum: number, stats: any) => sum + stats.disallowedWebsites, 0
            );
            
            return {
              name,
              category: botInfo.category,
              totalWebsites,
              allowedWebsites,
              disallowedWebsites
            };
          });
          
          res.json(botList);
        } else {
          res.status(404).json({ error: 'Bot-Statistiken nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Bot-Statistiken:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Einzelner Bot
    this.app.get('/api/bots/:botName', async (req: Request, res: Response) => {
      try {
        const botName = req.params.botName;
        const filePath = this.config.paths.botStatistics;
        
        if (await fs.pathExists(filePath)) {
          const data = await fs.readFile(filePath, 'utf-8');
          const botStats = JSON.parse(data);
          
          if (botStats.bots && botStats.bots[botName]) {
            const botData = botStats.bots[botName];
            
            // Lade Bot-Kategorien-Informationen
            const categoriesPath = path.join(__dirname, '../../data/analysis/bot-categories.json');
            let botDetails = null;
            
            if (await fs.pathExists(categoriesPath)) {
              try {
                const categoriesData = await fs.readFile(categoriesPath, 'utf-8');
                const categories = JSON.parse(categoriesData);
                
                // Suche nach dem Bot in allen Kategorien
                for (const [categoryKey, categoryData] of Object.entries(categories.categories)) {
                  const categoryBots = (categoryData as any).bots;
                  if (categoryBots && categoryBots[botName]) {
                    botDetails = categoryBots[botName];
                    break;
                  }
                }
              } catch (err) {
                console.warn('Fehler beim Laden der Bot-Kategorien:', err);
              }
            }
            
            // Kombiniere Bot-Statistiken mit Detail-Informationen
            const response = {
              ...botData,
              details: botDetails
            };
            
            res.json(response);
          } else {
            res.status(404).json({ error: `Bot "${botName}" nicht gefunden` });
          }
        } else {
          res.status(404).json({ error: 'Bot-Statistiken nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Bot-Informationen:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Websites
    this.app.get('/api/websites', async (req: Request, res: Response) => {
      try {
        const websitesDir = path.join(this.config.paths.analysisOutput, 'websites');
        
        if (await fs.pathExists(websitesDir)) {
          const files = await fs.readdir(websitesDir);
          const jsonFiles = files.filter(file => file.endsWith('.json'));
          
          // Detaillierte Informationen für jede Website laden
          const websiteList = await Promise.all(
            jsonFiles.map(async (file) => {
              const domain = file.replace('.json', '');
              const filePath = path.join(websitesDir, file);
              try {
                const data = await fs.readFile(filePath, 'utf-8');
                const websiteData = JSON.parse(data);
                
                // Berechne Bot-Statistiken aus dem bots Array
                const bots = websiteData.bots || [];
                const totalBots = bots.length;
                const allowedBots = bots.filter((bot: any) => bot.allowed === true).length;
                const disallowedBots = bots.filter((bot: any) => bot.allowed === false).length;
                
                return {
                  domain: websiteData.domain || domain,
                  totalBots,
                  allowedBots,
                  disallowedBots
                };
              } catch (err) {
                console.error(`Fehler beim Laden der Website ${domain}:`, err);
                return {
                  domain,
                  totalBots: 0,
                  allowedBots: 0,
                  disallowedBots: 0,
                  lastUpdated: null
                };
              }
            })
          );
          
          res.json(websiteList);
        } else {
          res.status(404).json({ error: 'Website-Verzeichnis nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Websites:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Einzelne Website
    this.app.get('/api/websites/:domain', async (req: Request, res: Response) => {
      try {
        const domain = req.params.domain;
        const filePath = path.join(this.config.paths.analysisOutput, 'websites', `${domain}.json`);
        
        if (await fs.pathExists(filePath)) {
          const data = await fs.readFile(filePath, 'utf-8');
          const websiteData = JSON.parse(data);
          
          // Berechne Bot-Statistiken aus dem bots Array
          const bots = websiteData.bots || [];
          const totalBots = bots.length;
          const allowedBots = bots.filter((bot: any) => bot.allowed === true).length;
          const disallowedBots = bots.filter((bot: any) => bot.allowed === false).length;
          
          // Erstelle separate Arrays für erlaubte und verbotene Bots
          const allowedBotNames = bots
            .filter((bot: any) => bot.allowed === true)
            .map((bot: any) => bot.name);
          const disallowedBotNames = bots
            .filter((bot: any) => bot.allowed === false)
            .map((bot: any) => bot.name);
          
          // Transformiere in das erwartete Frontend-Format
          const response = {
            domain: websiteData.domain || domain,
            robotsTxt: websiteData.robotsTxt || '',
            totalBots,
            allowedBots,
            disallowedBots,
            bots: {
              allowed: allowedBotNames,
              disallowed: disallowedBotNames
            },
            paths: {
              allowed: [],
              disallowed: []
            }
          };
          
          res.json(response);
        } else {
          res.status(404).json({ error: `Website "${domain}" nicht gefunden` });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Website-Informationen:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Trends
    this.app.get('/api/trends', async (req: Request, res: Response) => {
      try {
        const filePath = path.join(this.config.paths.analysisOutput, 'trends', 'monthly-trends.json');
        
        if (await fs.pathExists(filePath)) {
          const data = await fs.readFile(filePath, 'utf-8');
          res.json(JSON.parse(data));
        } else {
          res.status(404).json({ error: 'Trends nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler beim Laden der Trends:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Suche nach Bots
    this.app.get('/api/search/bots', async (req: Request, res: Response) => {
      try {
        const query = req.query.q as string;
        
        if (!query) {
          return res.status(400).json({ error: 'Suchbegriff erforderlich' });
        }
        
        const filePath = this.config.paths.botStatistics;
        
        if (await fs.pathExists(filePath)) {
          const data = await fs.readFile(filePath, 'utf-8');
          const botStats = JSON.parse(data);
          
          // Nach Bots suchen, die den Suchbegriff enthalten
          const matchingBots = Object.entries(botStats.bots)
            .filter(([name, _]) => name.toLowerCase().includes(query.toLowerCase()))
            .map(([name, bot]) => ({ name, ...(bot as object) }));
          
          res.json(matchingBots);
        } else {
          res.status(404).json({ error: 'Bot-Statistiken nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler bei der Bot-Suche:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // Suche nach Websites
    this.app.get('/api/search/websites', async (req: Request, res: Response) => {
      try {
        const query = req.query.q as string;
        
        if (!query) {
          return res.status(400).json({ error: 'Suchbegriff erforderlich' });
        }
        
        const websitesDir = path.join(this.config.paths.analysisOutput, 'websites');
        
        if (await fs.pathExists(websitesDir)) {
          const files = await fs.readdir(websitesDir);
          const jsonFiles = files.filter(file => file.endsWith('.json'));
          
          // Nach Websites suchen, die den Suchbegriff enthalten
          const matchingDomains = jsonFiles
            .map(file => file.replace('.json', ''))
            .filter(domain => domain.toLowerCase().includes(query.toLowerCase()));
          
          res.json(matchingDomains);
        } else {
          res.status(404).json({ error: 'Website-Verzeichnis nicht gefunden' });
        }
      } catch (error) {
        console.error('Fehler bei der Website-Suche:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
      }
    });
    
    // API-Dokumentation
    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        message: 'Robots.txt Crawler API',
        endpoints: [
          '/api/summary',
          '/api/bots',
          '/api/bots/:botName',
          '/api/websites',
          '/api/websites/:domain',
          '/api/trends',
          '/api/search/bots?q=<suchbegriff>',
          '/api/search/websites?q=<suchbegriff>'
        ]
      });
    });
  }
  
  /**
   * Startet den API-Server
   */
  start(): void {
    this.app.listen(this.port, () => {
      console.log(`API-Server läuft auf Port ${this.port}`);
    });
  }
}
