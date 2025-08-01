import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
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

// Interface für Redirect-Informationen
interface RedirectInfo {
  originalUrl: string;
  finalUrl: string;
  redirectCount: number;
  redirectChain: string[];
}

export class HttpCrawlerWithRedirectValidation {
  private axiosInstance: AxiosInstance;
  private config: CrawlerConfig;
  private domainTimestamps: Map<string, number> = new Map();
  
  constructor(config: CrawlerConfig) {
    this.config = config;
    
    // Axios-Instanz konfigurieren
    this.axiosInstance = axios.create({
      timeout: config.httpTimeout,
      maxRedirects: 0, // Redirects manuell verfolgen für bessere Kontrolle
      validateStatus: (status) => status < 400 || (status >= 300 && status < 400), // Erfolg und Redirects akzeptieren
      headers: {
        'Accept': 'text/plain,*/*',
        'Accept-Language': 'de,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }
  
  /**
   * Crawlt die robots.txt einer Website mit Redirect-Validierung
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
      
      // HTTP-Request mit Redirect-Verfolgung durchführen
      const { response, redirectInfo } = await this.followRedirectsWithValidation(
        website.robotsTxtUrl, 
        requestConfig
      );
      
      // Redirect-Validierung durchführen
      const validationResult = this.validateRedirects(website.robotsTxtUrl, redirectInfo);
      
      if (!validationResult.isValid) {
        throw new HttpCrawlError(
          `Ungültiger Redirect: ${validationResult.reason}. ` +
          `Original: ${redirectInfo.originalUrl}, Final: ${redirectInfo.finalUrl}`
        );
      }
      
      // Content-Validierung
      const content = response.data;
      const contentValidation = this.validateRobotsTxtContent(content);
      
      if (!contentValidation.isValid) {
        throw new HttpCrawlError(
          `Ungültiger robots.txt Content: ${contentValidation.reason}. ` +
          `Möglicherweise wurde zu einer anderen Seite weitergeleitet.`
        );
      }
      
      // Erfolgreiche Antwort
      const responseTime = Date.now() - startTime;
      
      return {
        domain: website.domain,
        status: 'success',
        method: 'http_validated',
        content: typeof content === 'string' ? content : JSON.stringify(content),
        responseTime,
        fileSize: typeof content === 'string' ? content.length : JSON.stringify(content).length,
        timestamp: new Date().toISOString(),
        // Zusätzliche Informationen über Redirects
        metadata: {
          redirectCount: redirectInfo.redirectCount,
          finalUrl: redirectInfo.finalUrl,
          redirectChain: redirectInfo.redirectChain
        }
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
   * Verfolgt Redirects manuell und sammelt Informationen
   */
  private async followRedirectsWithValidation(
    url: string, 
    config: AxiosRequestConfig
  ): Promise<{ response: AxiosResponse; redirectInfo: RedirectInfo }> {
    const maxRedirects = 5;
    let currentUrl = url;
    const redirectChain: string[] = [url];
    let redirectCount = 0;
    
    for (let i = 0; i < maxRedirects; i++) {
      const response = await this.axiosInstance.get(currentUrl, config);
      
      // Wenn es kein Redirect ist, sind wir fertig
      if (response.status < 300 || response.status >= 400) {
        return {
          response,
          redirectInfo: {
            originalUrl: url,
            finalUrl: currentUrl,
            redirectCount,
            redirectChain
          }
        };
      }
      
      // Redirect-URL extrahieren
      const location = response.headers.location;
      if (!location) {
        throw new HttpCrawlError(`Redirect ohne Location-Header bei ${currentUrl}`);
      }
      
      // Absolute URL erstellen, falls relative URL
      const nextUrl = new URL(location, currentUrl).toString();
      redirectChain.push(nextUrl);
      currentUrl = nextUrl;
      redirectCount++;
    }
    
    throw new HttpCrawlError(`Zu viele Redirects (>${maxRedirects}) von ${url}`);
  }
  
  /**
   * Validiert Redirects für robots.txt
   */
  private validateRedirects(originalUrl: string, redirectInfo: RedirectInfo): { isValid: boolean; reason?: string } {
    // Keine Redirects sind immer OK
    if (redirectInfo.redirectCount === 0) {
      return { isValid: true };
    }
    
    // Prüfe, ob die finale URL noch eine robots.txt ist
    if (!redirectInfo.finalUrl.endsWith('/robots.txt')) {
      return { 
        isValid: false, 
        reason: 'Finale URL ist keine robots.txt-Datei' 
      };
    }
    
    // Prüfe, ob wir zur gleichen Domain weitergeleitet wurden
    const originalDomain = new URL(originalUrl).hostname;
    const finalDomain = new URL(redirectInfo.finalUrl).hostname;
    
    // Erlaube Redirects innerhalb der gleichen Domain oder zu verwandten Domains
    if (originalDomain !== finalDomain) {
      // Prüfe auf verwandte Domains (z.B. www.example.com -> example.com)
      const originalBaseDomain = this.extractBaseDomain(originalDomain);
      const finalBaseDomain = this.extractBaseDomain(finalDomain);
      
      if (originalBaseDomain !== finalBaseDomain) {
        return { 
          isValid: false, 
          reason: `Domain-Wechsel von ${originalDomain} zu ${finalDomain}` 
        };
      }
    }
    
    // Prüfe auf verdächtige Redirect-Ketten
    if (redirectInfo.redirectCount > 3) {
      return { 
        isValid: false, 
        reason: `Zu viele Redirects (${redirectInfo.redirectCount})` 
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Validiert den Content als robots.txt
   */
  private validateRobotsTxtContent(content: any): { isValid: boolean; reason?: string } {
    // Content muss ein String sein
    if (typeof content !== 'string') {
      return { 
        isValid: false, 
        reason: 'Content ist kein Text' 
      };
    }
    
    // Prüfe auf HTML-Content (deutet auf falsche Seite hin)
    if (content.trim().toLowerCase().startsWith('<!doctype html') || 
        content.trim().toLowerCase().startsWith('<html')) {
      return { 
        isValid: false, 
        reason: 'Content ist HTML statt robots.txt' 
      };
    }
    
    // Prüfe auf JSON-Content
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return { 
        isValid: false, 
        reason: 'Content ist JSON statt robots.txt' 
      };
    }
    
    // Prüfe auf typische robots.txt-Direktiven (falls Content nicht leer)
    if (content.trim().length > 0) {
      const robotsKeywords = [
        'user-agent', 'disallow', 'allow', 'crawl-delay', 
        'sitemap', 'host', 'clean-param'
      ];
      
      const contentLower = content.toLowerCase();
      const hasRobotsKeywords = robotsKeywords.some(keyword => 
        contentLower.includes(keyword)
      );
      
      // Wenn der Content lang ist aber keine robots.txt-Keywords enthält, ist es verdächtig
      if (content.length > 500 && !hasRobotsKeywords) {
        return { 
          isValid: false, 
          reason: 'Content zu lang ohne robots.txt-Direktiven' 
        };
      }
    }
    
    return { isValid: true };
  }
  
  /**
   * Extrahiert die Basis-Domain (z.B. example.com aus www.example.com)
   */
  private extractBaseDomain(hostname: string): string {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
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
