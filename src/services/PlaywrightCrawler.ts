import { Browser, BrowserContext, chromium, Page } from 'playwright';
import { CrawlResult } from '../types/CrawlResult';
import { NormalizedWebsite } from '../types/Website';
import { PlaywrightConfig, getRandomUserAgent } from '../../config/playwright.config';
import { CrawlerConfig } from '../../config/crawler.config';

// Klasse für Playwright-Fehler
export class PlaywrightCrawlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlaywrightCrawlError';
  }
}

export class PlaywrightCrawler {
  private browser: Browser | null = null;
  private config: CrawlerConfig;
  private playwrightConfig: PlaywrightConfig;
  
  constructor(config: CrawlerConfig, playwrightConfig: PlaywrightConfig) {
    this.config = config;
    this.playwrightConfig = playwrightConfig;
  }
  
  /**
   * Initialisiert den Browser
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch(this.playwrightConfig.launchOptions);
    }
  }
  
  /**
   * Schließt den Browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Crawlt die robots.txt einer Website mit Playwright
   */
  async crawlRobotsTxt(website: NormalizedWebsite): Promise<CrawlResult> {
    const startTime = Date.now();
    
    // Sicherstellen, dass der Browser initialisiert ist
    if (!this.browser) {
      await this.initialize();
    }
    
    if (!this.browser) {
      throw new PlaywrightCrawlError('Browser konnte nicht initialisiert werden');
    }
    
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    
    try {
      // Neuen Browser-Kontext erstellen
      context = await this.browser.newContext({
        userAgent: getRandomUserAgent(this.playwrightConfig),
        viewport: { width: 1920, height: 1080 }
      });
      
      // Neue Seite erstellen
      page = await context.newPage();
      
      // Timeout für die Navigation setzen
      page.setDefaultTimeout(this.playwrightConfig.navigationTimeout);
      
      // Zu robots.txt navigieren
      const response = await page.goto(website.robotsTxtUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.browserTimeout
      });
      
      // Antwort prüfen
      if (!response) {
        throw new PlaywrightCrawlError('Keine Antwort erhalten');
      }
      
      if (!response.ok()) {
        throw new PlaywrightCrawlError(`HTTP ${response.status()}: ${response.statusText()}`);
      }
      
      // Inhalt extrahieren
      const content = await page.content();
      const bodyText = await page.textContent('body') || '';
      
      // Erfolgreiche Antwort
      const responseTime = Date.now() - startTime;
      
      return {
        domain: website.domain,
        status: 'success',
        method: 'playwright',
        content: bodyText,
        responseTime,
        fileSize: bodyText.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Fehler protokollieren
      let errorMessage = 'Unbekannter Fehler';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new PlaywrightCrawlError(errorMessage);
    } finally {
      // Ressourcen freigeben
      if (page) {
        await page.close().catch(() => {});
      }
      
      if (context) {
        await context.close().catch(() => {});
      }
    }
  }
}
