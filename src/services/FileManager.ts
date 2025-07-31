import fs from 'fs-extra';
import path from 'path';
import { CrawlResult, CrawlSummary } from '../types/CrawlResult';
import { NormalizedWebsite } from '../types/Website';

export class FileManager {
  private outputDir: string;
  private robotsFilesDir: string;
  private logsDir: string;
  private reportsDir: string;
  
  constructor(outputDir: string = './output') {
    this.outputDir = outputDir;
    this.robotsFilesDir = path.join(outputDir, 'robots-files');
    this.logsDir = path.join(outputDir, 'logs');
    this.reportsDir = path.join(outputDir, 'reports');
  }
  
  /**
   * Initialisiert die Verzeichnisstruktur
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(this.outputDir);
    await fs.ensureDir(this.robotsFilesDir);
    await fs.ensureDir(this.logsDir);
    await fs.ensureDir(this.reportsDir);
  }
  
  /**
   * Speichert eine robots.txt-Datei
   */
  async saveRobotsTxt(website: NormalizedWebsite, content: string): Promise<string> {
    const fileName = `${website.normalizedDomain}-robots.txt`;
    const filePath = path.join(this.robotsFilesDir, fileName);
    
    await fs.writeFile(filePath, content, 'utf-8');
    return fileName;
  }
  
  /**
   * Speichert eine Zusammenfassung des Crawlings
   */
  async saveCrawlSummary(summary: CrawlSummary): Promise<string> {
    const fileName = `crawl-summary-${summary.id}.json`;
    const filePath = path.join(this.reportsDir, fileName);
    
    await fs.writeFile(filePath, JSON.stringify(summary, null, 2), 'utf-8');
    return fileName;
  }
  
  /**
   * Speichert die Ergebnisse des Crawlings
   */
  async saveCrawlResults(results: CrawlResult[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `crawl-results-${timestamp}.json`;
    const filePath = path.join(this.reportsDir, fileName);
    
    await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8');
    return fileName;
  }
  
  /**
   * Prüft, ob eine robots.txt-Datei bereits existiert
   */
  async robotsTxtExists(website: NormalizedWebsite): Promise<boolean> {
    const fileName = `${website.normalizedDomain}-robots.txt`;
    const filePath = path.join(this.robotsFilesDir, fileName);
    
    return fs.pathExists(filePath);
  }
  
  /**
   * Prüft, ob eine robots.txt-Datei aktualisiert werden sollte
   */
  async shouldUpdateRobotsTxt(website: NormalizedWebsite, forceUpdate: boolean, updateAfterDays: number): Promise<boolean> {
    // Wenn forceUpdate aktiviert ist, immer aktualisieren
    if (forceUpdate) {
      return true;
    }
    
    const fileName = `${website.normalizedDomain}-robots.txt`;
    const filePath = path.join(this.robotsFilesDir, fileName);
    
    // Wenn Datei nicht existiert, sollte sie erstellt werden
    if (!(await fs.pathExists(filePath))) {
      return true;
    }
    
    // Prüfen, ob die Datei älter als updateAfterDays ist oder Monatsende-Regel greift
    try {
      const stats = await fs.stat(filePath);
      const now = new Date();
      const fileDate = new Date(stats.mtime);
      
      // Standard-Alterscheck
      const fileAge = now.getTime() - fileDate.getTime();
      const maxAge = updateAfterDays * 24 * 60 * 60 * 1000; // Tage in Millisekunden
      
      if (fileAge > maxAge) {
        return true;
      }
      
      // Monatsende-Regel: Aktualisieren wenn Datei aus vorherigem Monat stammt 
      // und aktueller Monat maximal noch einen Tag dauert
      const fileMonth = fileDate.getMonth();
      const fileYear = fileDate.getFullYear();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Prüfen, ob Datei aus einem vorherigen Monat stammt
      const isFromPreviousMonth = (fileYear < currentYear) || 
                                  (fileYear === currentYear && fileMonth < currentMonth);
      
      if (isFromPreviousMonth) {
        // Prüfen, ob aktueller Monat maximal noch einen Tag dauert
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemainingInMonth = lastDayOfMonth - currentDay;
        
        if (daysRemainingInMonth <= 1) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      // Bei Fehlern beim Lesen der Datei-Stats, sicherheitshalber aktualisieren
      return true;
    }
  }
  
  /**
   * Liest eine robots.txt-Datei
   */
  async readRobotsTxt(website: NormalizedWebsite): Promise<string | null> {
    const fileName = `${website.normalizedDomain}-robots.txt`;
    const filePath = path.join(this.robotsFilesDir, fileName);
    
    if (await fs.pathExists(filePath)) {
      return fs.readFile(filePath, 'utf-8');
    }
    
    return null;
  }
  
  /**
   * Löscht eine robots.txt-Datei
   */
  async deleteRobotsTxt(website: NormalizedWebsite): Promise<boolean> {
    const fileName = `${website.normalizedDomain}-robots.txt`;
    const filePath = path.join(this.robotsFilesDir, fileName);
    
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    
    return false;
  }
}
