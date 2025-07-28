import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CrawlResult } from '../types/CrawlResult';
import { NormalizedWebsite } from '../types/Website';
import { CrawlerConfig } from '../../config/crawler.config';
import { getRandomUserAgent } from '../../config/playwright.config';

// Klasse für HTTP-Fehler
export class HttpCrawlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HttpCrawlError';
  }
}

export class HttpCrawler {
  private axiosInstance: AxiosInstance;
  private config: CrawlerConfig;
  private domainTimestamps: Map<string, number> = new Map();
  
  constructor(config: CrawlerConfig) {
    this.config = config;
    
    // Axios-Instanz konfigurieren
    this.axiosInstance = axios.create({
      timeout: config.httpTimeout,
      maxRedirects: 5,
      validateStatus: (status) => status < 400, // Nur Erfolgs-Status akzeptieren
      headers: {
        'Accept': 'text/plain,*/*',
        'Accept-Language': 'de,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }
  
  /**
   * Crawlt die robots.txt einer Website
   */
  async crawlRobotsTxt(website: NormalizedWebsite): Promise<CrawlResult> {
    const startTime = Date.now();
    
    try {
      // Rate-Limiting für die Domain
      await this.applyRateLimiting(website.domain);
      
      // User-Agent rotieren, wenn aktiviert
      const headers: Record<string, string> = {};
      if (this.config.userAgentRotation) {
        headers['User-Agent'] = getRandomUserAgent();
      }
      
      // Request-Konfiguration
      const requestConfig: AxiosRequestConfig = {
        headers
      };
      
      // HTTP-Request durchführen
      const response = await this.axiosInstance.get(website.robotsTxtUrl, requestConfig);
      
      // Erfolgreiche Antwort
      const responseTime = Date.now() - startTime;
      const content = response.data;
      
      return {
        domain: website.domain,
        status: 'success',
        method: 'http',
        content: typeof content === 'string' ? content : JSON.stringify(content),
        responseTime,
        fileSize: typeof content === 'string' ? content.length : JSON.stringify(content).length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      // Fehler protokollieren
      let errorMessage = 'Unbekannter Fehler';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = `Keine Antwort erhalten: ${error.message}`;
        } else {
          errorMessage = `Request-Fehler: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new HttpCrawlError(errorMessage);
    }
  }
  
  /**
   * Wendet Rate-Limiting für eine Domain an
   */
  private async applyRateLimiting(domain: string): Promise<void> {
    // Basis-Domain extrahieren (z.B. example.com aus sub.example.com)
    const baseDomain = domain.split('.').slice(-2).join('.');
    
    // Letzten Zeitstempel für die Domain abrufen
    const lastTimestamp = this.domainTimestamps.get(baseDomain) || 0;
    const now = Date.now();
    
    // Prüfen, ob die Cooldown-Zeit eingehalten werden muss
    if (now - lastTimestamp < this.config.domainCooldown) {
      const waitTime = this.config.domainCooldown - (now - lastTimestamp);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Zeitstempel aktualisieren
    this.domainTimestamps.set(baseDomain, Date.now());
    
    // Zufällige Verzögerung hinzufügen, wenn aktiviert
    if (this.config.randomDelay) {
      const randomDelay = Math.floor(Math.random() * this.config.requestDelay);
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }
  }
}
