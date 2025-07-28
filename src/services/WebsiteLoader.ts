import fs from 'fs-extra';
import path from 'path';
import { Website, normalizeWebsite, NormalizedWebsite } from '../types/Website';

export class WebsiteLoader {
  private websitesPath: string;
  
  constructor(websitesPath: string = path.join(process.cwd(), 'data', 'websites.json')) {
    this.websitesPath = websitesPath;
  }
  
  /**
   * Lädt die Websites aus der JSON-Datei
   */
  async loadWebsites(): Promise<Website[]> {
    try {
      // Prüfen, ob die Datei existiert
      if (!await fs.pathExists(this.websitesPath)) {
        throw new Error(`Die Datei ${this.websitesPath} existiert nicht.`);
      }
      
      // Datei einlesen und parsen
      const data = await fs.readFile(this.websitesPath, 'utf-8');
      const websites = JSON.parse(data) as Website[];
      
      // Validieren
      if (!Array.isArray(websites)) {
        throw new Error('Die Datei enthält kein gültiges Array von Websites.');
      }
      
      // Filtern, um sicherzustellen, dass jedes Element ein site-Feld hat
      const validWebsites = websites.filter(website => 
        website && typeof website === 'object' && typeof website.site === 'string'
      );
      
      return validWebsites;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Fehler beim Laden der Websites: ${error.message}`);
      }
      throw new Error('Unbekannter Fehler beim Laden der Websites');
    }
  }
  
  /**
   * Lädt und normalisiert die Websites
   */
  async loadNormalizedWebsites(): Promise<NormalizedWebsite[]> {
    const websites = await this.loadWebsites();
    return websites.map(normalizeWebsite);
  }
  
  /**
   * Teilt die Websites in Batches auf
   */
  splitIntoBatches(websites: NormalizedWebsite[], batchSize: number): NormalizedWebsite[][] {
    const batches: NormalizedWebsite[][] = [];
    
    for (let i = 0; i < websites.length; i += batchSize) {
      batches.push(websites.slice(i, i + batchSize));
    }
    
    return batches;
  }
}
