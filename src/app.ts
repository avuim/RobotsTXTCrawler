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
  --outputDir=<Pfad>           Ausgabeverzeichnis (Standard: ./output)
  --logLevel=<Level>           Log-Level (debug, info, warn, error) (Standard: info)
  --crawlOnly=<bool>           Nur Crawling durchführen, keine Analyse oder API (Standard: false)
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
    
    console.log('Robots.txt Crawler wird gestartet...');
    
    // Konfiguration laden
    const config = loadConfig({
      parallelWorkers: args.parallelWorkers,
      batchSize: args.batchSize,
      browserFallback: args.browserFallback,
      outputDir: args.outputDir,
      logLevel: args.logLevel
    });
    
    // Konfiguration anzeigen
    console.log('Konfiguration:');
    console.log(`- Parallele Worker: ${config.parallelWorkers}`);
    console.log(`- Batch-Größe: ${config.batchSize}`);
    console.log(`- Browser-Fallback: ${config.browserFallback ? 'Aktiviert' : 'Deaktiviert'}`);
    console.log(`- Ausgabeverzeichnis: ${config.outputDir}`);
    console.log(`- Log-Level: ${config.logLevel}`);
    
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
    
    // Bei Crawling-only-Modus: Prozess beenden
    if (args.crawlOnly) {
      console.log('Crawling-only-Modus: Prozess wird beendet.');
      process.exit(0);
    }
    
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
