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
          res.json(JSON.parse(data));
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
            res.json(botStats.bots[botName]);
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
          
          // Nur die Domainnamen zurückgeben
          const domains = jsonFiles.map(file => file.replace('.json', ''));
          res.json(domains);
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
          res.json(JSON.parse(data));
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
