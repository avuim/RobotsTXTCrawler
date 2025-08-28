import fs from 'fs-extra';
import path from 'path';
import { WebsiteAnalysis } from '../../types/Analysis';
import { AnalysisConfig } from '../../types/Analysis';
import { NormalizedWebsite } from '../../types/Website';

export class WebsiteAnalyzer {
  private config: AnalysisConfig;
  
  constructor(config: AnalysisConfig) {
    this.config = config;
  }
  
  /**
   * Initialisiert den WebsiteAnalyzer
   */
  async initialize(): Promise<void> {
    // Verzeichnisse sicherstellen
    await fs.ensureDir(this.config.paths.analysisOutput);
    await fs.ensureDir(path.join(this.config.paths.analysisOutput, 'websites'));
  }
  
  /**
   * Analysiert eine robots.txt-Datei für eine bestimmte Website gemäß RFC 9309
   */
  async analyzeWebsite(website: NormalizedWebsite): Promise<WebsiteAnalysis | null> {
    const robotsFilePath = path.join(this.config.paths.crawlResults, `${website.normalizedDomain}-robots.txt`);
    
    // Prüfen, ob die robots.txt-Datei existiert
    if (!await fs.pathExists(robotsFilePath)) {
      console.warn(`robots.txt-Datei nicht gefunden für ${website.domain}: ${robotsFilePath}`);
      return null;
    }
    
    try {
      // Datei lesen
      const content = await fs.readFile(robotsFilePath, 'utf-8');
      
      // Parse robots.txt gemäß RFC 9309
      const groups = this.parseRobotsTxt(content);
      
      // Extrahiere globale Regeln (User-agent: *)
      const wildcardGroup = groups.find(group => group.userAgents.includes('*'));
      const globalPaths = this.extractPaths(wildcardGroup?.rules || []);
      const hasGlobalAllow = wildcardGroup ? this.evaluateBotAccess(wildcardGroup.rules) : true;
      
      // Extrahiere bot-spezifische Regeln (alle außer *)
      const specificBots = groups
        .filter(group => !group.userAgents.includes('*'))
        .flatMap(group => 
          group.userAgents.map(userAgent => ({
            name: userAgent,
            allowed: this.evaluateBotAccess(group.rules),
            paths: this.extractPaths(group.rules)
          }))
        );
      
      // Berechne Statistiken
      const allowedBots = specificBots.filter(bot => bot.allowed).length;
      const disallowedBots = specificBots.filter(bot => !bot.allowed).length;
      
      // Analyse-Ergebnis initialisieren
      const analysis: WebsiteAnalysis = {
        domain: website.domain,
        normalizedDomain: website.normalizedDomain,
        robotsTxt: content,
        globalRules: {
          paths: globalPaths
        },
        specificBots,
        stats: {
          totalSpecificBots: specificBots.length,
          allowedBots,
          disallowedBots,
          hasGlobalAllow
        },
        // Legacy-Felder für Rückwärtskompatibilität
        bots: [
          ...(wildcardGroup ? [{ name: '*', allowed: hasGlobalAllow }] : []),
          ...specificBots.map(bot => ({ name: bot.name, allowed: bot.allowed }))
        ],
        paths: globalPaths
      };
      
      // Analyse-Ergebnis speichern
      await this.saveWebsiteAnalysis(analysis);
      
      return analysis;
    } catch (error) {
      console.error(`Fehler beim Analysieren der Website ${website.domain}:`, error);
      return null;
    }
  }
  
  /**
   * Parst robots.txt-Inhalt in Gruppen gemäß RFC 9309
   */
  private parseRobotsTxt(content: string): Array<{userAgents: string[], rules: Array<{allow: boolean, path: string}>}> {
    const lines = content.split('\n').map(line => line.trim());
    const groups: Array<{userAgents: string[], rules: Array<{allow: boolean, path: string}>}> = [];
    
    let currentGroup: {userAgents: string[], rules: Array<{allow: boolean, path: string}>} | null = null;
    
    for (const line of lines) {
      // Ignoriere Kommentare und leere Zeilen
      if (!line || line.startsWith('#')) {
        continue;
      }
      
      // User-Agent-Zeile
      if (line.toLowerCase().startsWith('user-agent:')) {
        const userAgent = line.substring('user-agent:'.length).trim();
        
        if (currentGroup && currentGroup.userAgents.length > 0) {
          // Wenn bereits eine Gruppe existiert, starte eine neue
          if (currentGroup.userAgents.length > 0) {
            groups.push(currentGroup);
          }
        }
        
        // Neue Gruppe starten oder User-Agent zur aktuellen Gruppe hinzufügen
        if (!currentGroup || currentGroup.rules.length > 0) {
          currentGroup = { userAgents: [userAgent], rules: [] };
        } else {
          currentGroup.userAgents.push(userAgent);
        }
      }
      // Allow/Disallow-Zeile
      else if (currentGroup && (line.toLowerCase().startsWith('allow:') || line.toLowerCase().startsWith('disallow:'))) {
        const isAllow = line.toLowerCase().startsWith('allow:');
        const directive = isAllow ? 'allow:' : 'disallow:';
        const path = line.substring(directive.length).trim();
        
        currentGroup.rules.push({
          allow: isAllow,
          path: path
        });
      }
      // Andere Zeilen (z.B. Sitemap) ignorieren, aber Gruppe nicht beenden
    }
    
    // Letzte Gruppe hinzufügen
    if (currentGroup && currentGroup.userAgents.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }
  
  /**
   * Extrahiert Pfade aus den Regeln einer Gruppe
   */
  private extractPaths(rules: Array<{allow: boolean, path: string}>): {allowed: string[], disallowed: string[]} {
    const paths = {
      allowed: [] as string[],
      disallowed: [] as string[]
    };
    
    for (const rule of rules) {
      if (rule.path && rule.path !== '/' && rule.path !== '') {
        if (rule.allow) {
          if (!paths.allowed.includes(rule.path)) {
            paths.allowed.push(rule.path);
          }
        } else {
          if (!paths.disallowed.includes(rule.path)) {
            paths.disallowed.push(rule.path);
          }
        }
      }
    }
    
    return paths;
  }
  
  /**
   * Evaluiert ob ein Bot basierend auf den Regeln seiner Gruppe erlaubt ist
   * Gemäß RFC 9309: Wenn keine Regeln vorhanden sind oder keine Regel zutrifft, ist der Bot erlaubt
   */
  private evaluateBotAccess(rules: Array<{allow: boolean, path: string}>): boolean {
    // Wenn keine Regeln vorhanden sind, ist der Bot erlaubt
    if (rules.length === 0) {
      return true;
    }
    
    // Prüfe auf globale Disallow-Regel (Disallow: / oder Disallow: "")
    const hasGlobalDisallow = rules.some(rule => 
      !rule.allow && (rule.path === '/' || rule.path === '')
    );
    
    // Prüfe auf globale Allow-Regel (Allow: / oder Allow: "")
    const hasGlobalAllow = rules.some(rule => 
      rule.allow && (rule.path === '/' || rule.path === '')
    );
    
    // Globale Allow-Regel überschreibt globale Disallow-Regel
    if (hasGlobalAllow) {
      return true;
    }
    
    // Globale Disallow-Regel bedeutet Bot ist nicht erlaubt
    if (hasGlobalDisallow) {
      return false;
    }
    
    // Wenn nur verzeichnisspezifische Regeln vorhanden sind, ist der Bot grundsätzlich erlaubt
    return true;
  }
  
  /**
   * Analysiert alle robots.txt-Dateien
   */
  async analyzeAllWebsites(): Promise<WebsiteAnalysis[]> {
    console.log('Analysiere alle Websites...');
    
    // Prüfen, ob das Verzeichnis existiert
    if (!await fs.pathExists(this.config.paths.crawlResults)) {
      throw new Error(`Robots-Files-Verzeichnis nicht gefunden: ${this.config.paths.crawlResults}`);
    }
    
    // Alle robots.txt-Dateien auflisten
    const files = await fs.readdir(this.config.paths.crawlResults);
    const robotsFiles = files.filter(file => file.endsWith('-robots.txt') || file.endsWith('.txt'));
    
    console.log(`${robotsFiles.length} robots.txt-Dateien gefunden.`);
    
    const results: WebsiteAnalysis[] = [];
    
    // Jede robots.txt-Datei analysieren
    for (const file of robotsFiles) {
      try {
        // Domain aus Dateinamen extrahieren
        const normalizedDomain = file.replace('-robots.txt', '').replace('.txt', '');
        
        // Website-Objekt erstellen
        const website: NormalizedWebsite = {
          domain: normalizedDomain, // Vereinfachung: Wir verwenden den normalisierten Domainnamen als Domain
          normalizedDomain,
          originalSite: normalizedDomain,
          robotsTxtUrl: `https://${normalizedDomain}/robots.txt`
        };
        
        // Website analysieren
        const analysis = await this.analyzeWebsite(website);
        
        if (analysis) {
          results.push(analysis);
        }
      } catch (error) {
        console.error(`Fehler beim Analysieren von ${file}:`, error);
      }
    }
    
    console.log(`Analyse abgeschlossen. ${results.length} Websites analysiert.`);
    
    return results;
  }
  
  /**
   * Speichert die Analyse-Ergebnisse für eine Website
   */
  private async saveWebsiteAnalysis(analysis: WebsiteAnalysis): Promise<void> {
    const filePath = path.join(this.config.paths.analysisOutput, 'websites', `${analysis.normalizedDomain}.json`);
    
    try {
      await fs.writeFile(filePath, JSON.stringify(analysis, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Fehler beim Speichern der Analyse für ${analysis.domain}:`, error);
    }
  }
}
