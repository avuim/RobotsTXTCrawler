import { Browser, BrowserContext, chromium, Page, Cookie, Request, Response } from 'playwright';
import { CrawlResult } from '../types/CrawlResult';
import { NormalizedWebsite } from '../types/Website';
import { PlaywrightConfig, getRandomUserAgent } from '../../config/playwright.config';
import { CrawlerConfig } from '../../config/crawler.config';

// Klasse für EnhancedPlaywright-Fehler
export class EnhancedPlaywrightCrawlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnhancedPlaywrightCrawlError';
  }
}

// Erweiterte Konfiguration für den EnhancedPlaywrightCrawler
export interface EnhancedPlaywrightConfig extends PlaywrightConfig {
  // Erweiterte User-Agent-Rotation
  enhancedUserAgents: Record<string, string[]>;
  
  // Cookie-Handling
  enableCookieHandling: boolean;
  cookieStorage: Record<string, Cookie[]>;
  
  // Verzögertes Crawling
  minDelay: number;
  maxDelay: number;
  
  // Header-Anpassung
  commonHeaders: Record<string, string>;
  
  // Referrer-Handling
  referrers: string[];
}

// Standard-Konfiguration für den EnhancedPlaywrightCrawler
export const defaultEnhancedConfig: Partial<EnhancedPlaywrightConfig> = {
  // Erweiterte User-Agent-Rotation nach Browsertyp
  enhancedUserAgents: {
    chrome: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ],
    firefox: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (X11; Linux i686; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0'
    ],
    safari: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
      'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    ],
    edge: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
    ]
  },
  
  // Cookie-Handling
  enableCookieHandling: true,
  cookieStorage: {},
  
  // Verzögertes Crawling
  minDelay: 1000,  // 1 Sekunde
  maxDelay: 5000,  // 5 Sekunden
  
  // Header-Anpassung
  commonHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Sec-GPC': '1'
  },
  
  // Referrer-Handling
  referrers: [
    'https://www.google.com/',
    'https://www.google.de/',
    'https://www.bing.com/',
    'https://duckduckgo.com/',
    'https://www.ecosia.org/',
    'https://www.startpage.com/'
  ]
};

export class EnhancedPlaywrightCrawler {
  private browser: Browser | null = null;
  private config: CrawlerConfig;
  private playwrightConfig: PlaywrightConfig & Partial<EnhancedPlaywrightConfig>;
  private domainCookies: Record<string, Cookie[]> = {};
  
  constructor(config: CrawlerConfig, playwrightConfig: PlaywrightConfig) {
    this.config = config;
    
    // Erweiterte Konfiguration mit Standardwerten kombinieren
    this.playwrightConfig = {
      ...playwrightConfig,
      ...defaultEnhancedConfig
    };
  }
  
  /**
   * Initialisiert den Browser
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        ...this.playwrightConfig.launchOptions,
        // Zusätzliche Argumente für verbesserte Verschleierung
        args: [
          ...(this.playwrightConfig.launchOptions.args || []),
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });
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
   * Wählt einen zufälligen User-Agent aus
   */
  private getRandomEnhancedUserAgent(): string {
    const enhancedUserAgents = (this.playwrightConfig as EnhancedPlaywrightConfig).enhancedUserAgents;
    
    if (!enhancedUserAgents) {
      return getRandomUserAgent(this.playwrightConfig);
    }
    
    // Zufälligen Browser-Typ auswählen
    const browserTypes = Object.keys(enhancedUserAgents);
    const browserType = browserTypes[Math.floor(Math.random() * browserTypes.length)];
    
    // Zufälligen User-Agent für den Browser-Typ auswählen
    const userAgents = enhancedUserAgents[browserType];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
  
  /**
   * Wählt einen zufälligen Referrer aus
   */
  private getRandomReferrer(): string {
    const referrers = (this.playwrightConfig as EnhancedPlaywrightConfig).referrers;
    
    if (!referrers || referrers.length === 0) {
      return '';
    }
    
    return referrers[Math.floor(Math.random() * referrers.length)];
  }
  
  /**
   * Erzeugt eine zufällige Verzögerung
   */
  private async randomDelay(): Promise<void> {
    const enhancedConfig = this.playwrightConfig as EnhancedPlaywrightConfig;
    const minDelay = enhancedConfig.minDelay || 1000;
    const maxDelay = enhancedConfig.maxDelay || 5000;
    
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Speichert Cookies für eine Domain
   */
  private saveCookies(domain: string, cookies: Cookie[]): void {
    if ((this.playwrightConfig as EnhancedPlaywrightConfig).enableCookieHandling) {
      this.domainCookies[domain] = cookies;
    }
  }
  
  /**
   * Lädt Cookies für eine Domain
   */
  private getCookies(domain: string): Cookie[] {
    if ((this.playwrightConfig as EnhancedPlaywrightConfig).enableCookieHandling) {
      return this.domainCookies[domain] || [];
    }
    return [];
  }
  
  /**
   * Konfiguriert den Browser-Kontext mit erweiterten Einstellungen
   */
  private async createEnhancedContext(website: NormalizedWebsite): Promise<BrowserContext> {
    if (!this.browser) {
      throw new EnhancedPlaywrightCrawlError('Browser nicht initialisiert');
    }
    
    const userAgent = this.getRandomEnhancedUserAgent();
    const referrer = this.getRandomReferrer();
    
    // Browser-Kontext mit erweiterten Einstellungen erstellen
    const context = await this.browser.newContext({
      userAgent,
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      locale: 'de-DE',
      timezoneId: 'Europe/Berlin',
      geolocation: { longitude: 13.4050, latitude: 52.5200 }, // Berlin
      permissions: ['geolocation'],
      extraHTTPHeaders: {
        ...(this.playwrightConfig as EnhancedPlaywrightConfig).commonHeaders,
        'Referer': referrer
      }
    });
    
    // JavaScript-Evaluierung, um Fingerprinting zu erschweren
    await context.addInitScript(() => {
      // Navigator-Eigenschaften überschreiben
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });
      
      // Plugins und Mimetypes simulieren
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          return [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
            { name: 'Native Client', filename: 'internal-nacl-plugin' }
          ];
        }
      });
      
      // Canvas-Fingerprinting erschweren
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
        if (type === 'image/png' && this.width === 16 && this.height === 16) {
          // Kleine Änderung bei Canvas-Fingerprinting
          return originalToDataURL.apply(this, [type]);
        }
        return originalToDataURL.apply(this, [type, quality]);
      };
    });
    
    // Gespeicherte Cookies laden
    const cookies = this.getCookies(website.domain);
    if (cookies.length > 0) {
      await context.addCookies(cookies);
    }
    
    return context;
  }
  
  /**
   * Crawlt die robots.txt einer Website mit erweitertem Playwright
   */
  async crawlRobotsTxt(website: NormalizedWebsite): Promise<CrawlResult> {
    const startTime = Date.now();
    
    // Sicherstellen, dass der Browser initialisiert ist
    if (!this.browser) {
      await this.initialize();
    }
    
    if (!this.browser) {
      throw new EnhancedPlaywrightCrawlError('Browser konnte nicht initialisiert werden');
    }
    
    // Zufällige Verzögerung vor dem Crawling
    await this.randomDelay();
    
    let context: BrowserContext | null = null;
    let page: Page | null = null;
    
    try {
      // Erweiterten Browser-Kontext erstellen
      context = await this.createEnhancedContext(website);
      
      // Neue Seite erstellen
      page = await context.newPage();
      
      // Timeout für die Navigation setzen
      page.setDefaultTimeout(this.playwrightConfig.navigationTimeout);
      
      // Event-Listener für Requests hinzufügen
      await page.route('**/*', async (route, request) => {
        // Bestimmte Ressourcen blockieren, die für robots.txt nicht benötigt werden
        const resourceType = request.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          await route.abort();
          return;
        }
        
        // Andere Requests durchlassen
        await route.continue();
      });
      
      // Zu robots.txt navigieren
      const response = await page.goto(website.robotsTxtUrl, {
        waitUntil: 'networkidle',
        timeout: this.config.browserTimeout
      });
      
      // Antwort prüfen
      if (!response) {
        throw new EnhancedPlaywrightCrawlError('Keine Antwort erhalten');
      }
      
      if (!response.ok()) {
        throw new EnhancedPlaywrightCrawlError(`HTTP ${response.status()}: ${response.statusText()}`);
      }
      
      // Cookies speichern
      if ((this.playwrightConfig as EnhancedPlaywrightConfig).enableCookieHandling) {
        const cookies = await context.cookies();
        this.saveCookies(website.domain, cookies);
      }
      
      // Inhalt extrahieren
      const content = await page.content();
      const bodyText = await page.textContent('body') || '';
      
      // Erfolgreiche Antwort
      const responseTime = Date.now() - startTime;
      
      return {
        domain: website.domain,
        status: 'success',
        method: 'enhanced_playwright',
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
      
      throw new EnhancedPlaywrightCrawlError(errorMessage);
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
