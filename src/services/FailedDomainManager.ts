import fs from 'fs-extra';
import path from 'path';
import { FailedDomain, FailedDomainsStorage } from '../types/CrawlResult';

export class FailedDomainManager {
  private storagePath: string;
  private failedDomains: Record<string, FailedDomain> = {};
  
  constructor(dataDir: string = './data') {
    this.storagePath = path.join(dataDir, 'failed-domains.json');
  }
  
  /**
   * Initialisiert den Manager
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(path.dirname(this.storagePath));
    
    if (await fs.pathExists(this.storagePath)) {
      try {
        const data = await fs.readFile(this.storagePath, 'utf-8');
        const storage = JSON.parse(data) as FailedDomainsStorage;
        
        if (storage && storage.failedDomains) {
          this.failedDomains = storage.failedDomains;
        }
      } catch (error) {
        console.error('Fehler beim Laden der fehlgeschlagenen Domains:', error);
        this.failedDomains = {};
        
        // Bei JSON-Parsing-Fehlern die Datei zurücksetzen
        if (error instanceof SyntaxError) {
          console.log('Beschädigte JSON-Datei erkannt. Datei wird zurückgesetzt...');
          await this.save();
          console.log('Datei wurde zurückgesetzt.');
        }
      }
    } else {
      // Leere Datei erstellen
      await this.save();
    }
  }
  
  /**
   * Speichert die fehlgeschlagenen Domains
   */
  async save(): Promise<void> {
    const storage: FailedDomainsStorage = {
      failedDomains: this.failedDomains
    };
    
    await fs.writeFile(this.storagePath, JSON.stringify(storage, null, 2), 'utf-8');
  }
  
  /**
   * Fügt eine fehlgeschlagene Domain hinzu
   */
  async addFailedDomain(domain: string, error: string): Promise<void> {
    const now = new Date().toISOString();
    
    if (this.failedDomains[domain]) {
      // Domain existiert bereits, Versuche inkrementieren
      this.failedDomains[domain].attempts += 1;
      this.failedDomains[domain].lastAttempt = now;
      this.failedDomains[domain].lastError = error;
      
      // Nächsten Retry-Zeitpunkt basierend auf dem Fehlertyp berechnen
      const nextRetryDate = new Date();
      
      if (error.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        // Bei ERR_CERT_COMMON_NAME_INVALID - Verzögerung um einen ganzen Tag
        nextRetryDate.setDate(nextRetryDate.getDate() + 1);
      } else if (error.includes('HTTP 404')) {
        // Bei HTTP 404 - Verzögerung um einen Monat
        nextRetryDate.setMonth(nextRetryDate.getMonth() + 1);
      } else if (error.includes('ERR_NAME_NOT_RESOLVED')) {
        // Bei ERR_NAME_NOT_RESOLVED - Verzögerung um ein Jahr
        nextRetryDate.setFullYear(nextRetryDate.getFullYear() + 1);
      } else {
        // Bei anderen Fehlern - exponentielles Backoff (wie bisher)
        const nextRetryMinutes = Math.min(Math.pow(2, this.failedDomains[domain].attempts), 1440); // Max 24h
        nextRetryDate.setMinutes(nextRetryDate.getMinutes() + nextRetryMinutes);
      }
      
      this.failedDomains[domain].nextRetry = nextRetryDate.toISOString();
    } else {
      // Neue fehlgeschlagene Domain
      const nextRetryDate = new Date();
      
      if (error.includes('ERR_CERT_COMMON_NAME_INVALID')) {
        // Bei ERR_CERT_COMMON_NAME_INVALID - Verzögerung um einen ganzen Tag
        nextRetryDate.setDate(nextRetryDate.getDate() + 1);
      } else if (error.includes('HTTP 404')) {
        // Bei HTTP 404 - Verzögerung um einen Monat
        nextRetryDate.setMonth(nextRetryDate.getMonth() + 1);
      } else if (error.includes('ERR_NAME_NOT_RESOLVED')) {
        // Bei ERR_NAME_NOT_RESOLVED - Verzögerung um ein Jahr
        nextRetryDate.setFullYear(nextRetryDate.getFullYear() + 1);
      } else {
        // Bei anderen Fehlern - Standard-Verzögerung von 5 Minuten (wie bisher)
        nextRetryDate.setMinutes(nextRetryDate.getMinutes() + 5);
      }
      
      this.failedDomains[domain] = {
        domain,
        lastAttempt: now,
        attempts: 1,
        lastError: error,
        nextRetry: nextRetryDate.toISOString()
      };
    }
    
    await this.save();
  }
  
  /**
   * Entfernt eine fehlgeschlagene Domain
   */
  async removeFailedDomain(domain: string): Promise<boolean> {
    if (this.failedDomains[domain]) {
      delete this.failedDomains[domain];
      await this.save();
      return true;
    }
    
    return false;
  }
  
  /**
   * Prüft, ob eine Domain fehlgeschlagen ist
   */
  isFailedDomain(domain: string): boolean {
    return !!this.failedDomains[domain];
  }
  
  /**
   * Prüft, ob eine Domain erneut versucht werden sollte
   */
  shouldRetry(domain: string): boolean {
    if (!this.failedDomains[domain]) {
      return true; // Keine fehlgeschlagene Domain, also versuchen
    }
    
    const failedDomain = this.failedDomains[domain];
    
    // Prüfen, ob die maximale Anzahl an Versuchen erreicht ist
    if (failedDomain.attempts >= 5) {
      return false;
    }
    
    // Prüfen, ob der nächste Retry-Zeitpunkt erreicht ist
    if (failedDomain.nextRetry) {
      const nextRetry = new Date(failedDomain.nextRetry);
      return new Date() >= nextRetry;
    }
    
    return true;
  }
  
  /**
   * Gibt alle fehlgeschlagenen Domains zurück
   */
  getAllFailedDomains(): FailedDomain[] {
    return Object.values(this.failedDomains);
  }
  
  /**
   * Gibt alle fehlgeschlagenen Domains zurück, die erneut versucht werden sollten
   */
  getRetryableDomains(): FailedDomain[] {
    return Object.values(this.failedDomains).filter(domain => this.shouldRetry(domain.domain));
  }
}
