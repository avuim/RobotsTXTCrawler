import { Browser, chromium } from 'playwright';
import { PlaywrightConfig } from '../../config/playwright.config';

export class BrowserPool {
  private browsers: Browser[] = [];
  private maxBrowsers: number;
  private currentIndex = 0;
  private playwrightConfig: PlaywrightConfig;
  
  constructor(playwrightConfig: PlaywrightConfig) {
    this.maxBrowsers = playwrightConfig.maxBrowserInstances;
    this.playwrightConfig = playwrightConfig;
  }
  
  /**
   * Initialisiert den Browser-Pool
   */
  async initialize(): Promise<void> {
    // Browser-Instanzen vorab erstellen
    for (let i = 0; i < this.maxBrowsers; i++) {
      try {
        const browser = await chromium.launch(this.playwrightConfig.launchOptions);
        this.browsers.push(browser);
      } catch (error) {
        console.error(`Fehler beim Starten des Browsers ${i}:`, error);
      }
    }
    
    if (this.browsers.length === 0) {
      throw new Error('Konnte keine Browser-Instanzen starten');
    }
  }
  
  /**
   * Gibt einen Browser aus dem Pool zurück
   */
  getBrowser(): Browser {
    if (this.browsers.length === 0) {
      throw new Error('Keine Browser-Instanzen verfügbar');
    }
    
    // Round-robin Browser-Zuteilung
    const browser = this.browsers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.browsers.length;
    return browser;
  }
  
  /**
   * Schließt alle Browser-Instanzen
   */
  async close(): Promise<void> {
    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        console.error('Fehler beim Schließen des Browsers:', error);
      }
    }
    
    this.browsers = [];
    this.currentIndex = 0;
  }
  
  /**
   * Gibt die Anzahl der aktiven Browser-Instanzen zurück
   */
  get activeBrowsers(): number {
    return this.browsers.length;
  }
}
