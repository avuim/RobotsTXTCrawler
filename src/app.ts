import { loadConfig } from '../config/crawler.config';
import { defaultPlaywrightConfig } from '../config/playwright.config';
import { defaultLoggingConfig } from '../config/logging.config';
import { CrawlOrchestrator } from './services/CrawlOrchestrator';
import { AnalysisOrchestrator } from './analyzers/AnalysisOrchestrator';
import { startApiServer } from './api';

// Funktion zum Parsen der Kommandozeilenargumente
function parseArgs(): Record<string, any> {
  const args: Record<string, any> = {};
  
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      
      if (value === undefined) {
        args[key] = true;
      } else if (value === 'true') {
        args[key] = true;
      } else if (value === 'false') {
        args[key] = false;
      } else if (!isNaN(Number(value))) {
        args[key] = Number(value);
      } else {
        args[key] = value;
      }
    }
  });
  
  return args;
}

// Hilfsfunktion zum Anzeigen der Hilfe
function showHelp(): void {
  console.log(`
Robots.txt Crawler - Ein moderner Webcrawler zum Extrahieren von robots.txt-Dateien

Verwendung:
  npm start -- [Optionen]

Optionen:
  --parallelWorkers=<Anzahl>   Anzahl der parallelen Worker (Standard: 15)
  --batchSize=<Anzahl>         Anzahl der Websites pro Batch (Standard: 100)
  --browserFallback=<bool>     Browser-Fallback aktivieren (Standard: true)
  --forceUpdate=<bool>         Alle robots.txt Dateien aktualisieren (Standard: false)
  --updateAfterDays=<Anzahl>   Tage bis robots.txt als veraltet gilt (Standard: 30)
  --outputDir=<Pfad>           Ausgabeverzeichnis (Standard: ./output)
  --logLevel=<Level>           Log-Level (debug, info, warn, error) (Standard: info)
  --crawlOnly=<bool>           Nur Crawling durchführen, keine Analyse oder API (Standard: false)
  --analyzeOnly=<bool>         Nur Analyse durchführen, kein Crawling (Standard: false)
  --apiOnly=<bool>             Nur API-Server starten, kein Crawling oder Analyse (Standard: false)
  --skipCrawl=<bool>           Analyse und API starten, ohne Crawling durchzuführen (Standard: false)
  --help                       Diese Hilfe anzeigen
  `);
}

// Hauptfunktion
async function main(): Promise<void> {
  try {
    // Kommandozeilenargumente parsen
    const args = parseArgs();
    
    // Hilfe anzeigen, wenn angefordert
    if (args.help) {
      showHelp();
      return;
    }
    
    // Prüfen, ob nur die API gestartet werden soll
    if (args.apiOnly) {
      console.log('API-Server wird gestartet...');
      startApiServer();
      console.log('API-Server gestartet auf Port 3001.');
      // Kein return, damit der Prozess nicht beendet wird
      // Der API-Server hält den Prozess am Laufen
      return new Promise(() => {}); // Verhindert, dass die Funktion beendet wird
    }
    
    // Prüfen, ob nur die Analyse durchgeführt werden soll
    if (args.analyzeOnly) {
      console.log('Robots.txt-Analyse wird gestartet...');
      const analysisOrchestrator = new AnalysisOrchestrator();
      await analysisOrchestrator.initialize();
      await analysisOrchestrator.runAnalysis();
      console.log('Analyse abgeschlossen.');
      process.exit(0);
    }
    
    // Prüfen, ob das Crawling übersprungen werden soll
    if (args.skipCrawl) {
      console.log('Robots.txt-Analyse und API-Server werden gestartet...');
      
      // Analyse der robots.txt-Daten durchführen
      console.log('Starte Analyse der robots.txt-Daten...');
      const analysisOrchestrator = new AnalysisOrchestrator();
      await analysisOrchestrator.initialize();
      await analysisOrchestrator.runAnalysis();
      console.log('Analyse abgeschlossen.');
      
      // API-Server starten
      console.log('Starte API-Server...');
      startApiServer();
      console.log('API-Server gestartet auf Port 3001.');
      // Kein return, damit der Prozess nicht beendet wird
      // Der API-Server hält den Prozess am Laufen
      return new Promise(() => {}); // Verhindert, dass die Funktion beendet wird
    }
    
    // Wenn wir hier ankommen, wird ein Crawling durchgeführt
    console.log('Robots.txt Crawler wird gestartet...');
    
    // Konfiguration laden (nur für Crawling-Modi)
    const config = loadConfig({
      parallelWorkers: args.parallelWorkers,
      batchSize: args.batchSize,
      browserFallback: args.browserFallback,
      outputDir: args.outputDir,
      logLevel: args.logLevel,
      forceUpdate: args.forceUpdate,
      updateAfterDays: args.updateAfterDays
    });
    
    // Konfiguration anzeigen
    console.log('Crawling-Konfiguration:');
    console.log(`- Parallele Worker: ${config.parallelWorkers}`);
    console.log(`- Batch-Größe: ${config.batchSize}`);
    console.log(`- Browser-Fallback: ${config.browserFallback ? 'Aktiviert' : 'Deaktiviert'}`);
    console.log(`- Force Update: ${config.forceUpdate ? 'Aktiviert' : 'Deaktiviert'}`);
    console.log(`- Update nach Tagen: ${config.updateAfterDays}`);
    console.log(`- Ausgabeverzeichnis: ${config.outputDir}`);
    console.log(`- Log-Level: ${config.logLevel}`);
    
    // Standardmodus: Crawling, Analyse und API
    // Orchestrator erstellen
    const orchestrator = new CrawlOrchestrator(
      config,
      defaultPlaywrightConfig,
      {
        ...defaultLoggingConfig,
        logLevel: config.logLevel
      }
    );
    
    // Services initialisieren (Meldung wird vom Orchestrator ausgegeben)
    await orchestrator.initialize();
    
    // Crawling starten (Meldung wird vom Orchestrator ausgegeben)
    const summary = await orchestrator.crawlAllSites();
    
    // Bei Crawling-only-Modus: Prozess beenden
    if (args.crawlOnly) {
      console.log('Crawling-only-Modus: Prozess wird beendet.');
      process.exit(0);
    }
    
    // Analyse der robots.txt-Daten durchführen
    console.log('Starte Analyse der robots.txt-Daten...');
    const analysisOrchestrator = new AnalysisOrchestrator();
    await analysisOrchestrator.initialize();
    await analysisOrchestrator.runAnalysis();
    console.log('Analyse abgeschlossen.');
    
    // API-Server starten
    console.log('Starte API-Server...');
    startApiServer();
    console.log('API-Server gestartet auf Port 3001.');
    
    // Prozess am Laufen halten
    return new Promise(() => {}); // Verhindert, dass die Funktion beendet wird
    
  } catch (error) {
    console.error('Fehler in der Hauptanwendung:', error);
    process.exit(1);
  }
}

// Anwendung starten
main().catch(error => {
  console.error('Unbehandelter Fehler:', error);
  process.exit(1);
});
