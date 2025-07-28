# Robots.txt Crawler

Ein moderner Webcrawler zum Extrahieren von robots.txt-Dateien von Websites.

## Übersicht

Der Robots.txt Crawler ist eine leistungsstarke TypeScript-Anwendung, die entwickelt wurde, um robots.txt-Dateien von einer Liste von Websites zu extrahieren. Die Anwendung verwendet einen zweistufigen Ansatz: Zuerst wird versucht, die robots.txt-Datei über einfache HTTP-Anfragen abzurufen, und falls dies fehlschlägt, wird optional ein Browser-basierter Ansatz mit Playwright als Fallback verwendet.

## Funktionen

- **Effizientes Crawling**: Extrahiert robots.txt-Dateien von Websites mit optimierter Leistung
- **Parallele Verarbeitung**: Verarbeitet mehrere Websites gleichzeitig für höhere Geschwindigkeit
- **Batch-Verarbeitung**: Teilt die zu verarbeitenden Websites in Batches auf
- **Browser-Fallback**: Verwendet Playwright als Fallback, wenn HTTP-Anfragen fehlschlagen
- **Anti-Blocking-Maßnahmen**: Implementiert User-Agent-Rotation und zufällige Verzögerungen
- **Fortschrittsüberwachung**: Zeigt Echtzeit-Fortschrittsinformationen während des Crawlings
- **Umfangreiche Protokollierung**: Detaillierte Logs für Debugging und Analyse
- **Fehlerbehandlung**: Robuste Fehlerbehandlung mit automatischen Wiederholungsversuchen
- **Konfigurierbarkeit**: Umfangreiche Konfigurationsmöglichkeiten über Kommandozeilenargumente

## Architektur

Die Anwendung ist modular aufgebaut und folgt dem Prinzip der Trennung von Zuständigkeiten:

### Hauptkomponenten

- **CrawlOrchestrator**: Koordiniert den gesamten Crawling-Prozess
- **WebsiteLoader**: Lädt und normalisiert die Website-Daten
- **HttpCrawler**: Führt HTTP-Anfragen für robots.txt-Dateien durch
- **PlaywrightCrawler**: Verwendet Playwright für Browser-basiertes Crawling
- **BrowserPool**: Verwaltet Browser-Instanzen für Playwright
- **FileManager**: Speichert und verwaltet die extrahierten robots.txt-Dateien
- **FailedDomainManager**: Verwaltet fehlgeschlagene Domains und Wiederholungsversuche
- **ProgressMonitor**: Überwacht und berichtet über den Fortschritt des Crawlings

### Datenfluss

1. Der WebsiteLoader lädt die Websites aus der websites.json-Datei
2. Die Websites werden normalisiert und in Batches aufgeteilt
3. Der CrawlOrchestrator verarbeitet die Batches parallel
4. Für jede Website wird zuerst der HttpCrawler verwendet
5. Bei Fehlern wird optional der PlaywrightCrawler als Fallback verwendet
6. Die Ergebnisse werden vom FileManager gespeichert
7. Der ProgressMonitor aktualisiert den Fortschritt
8. Fehlgeschlagene Domains werden vom FailedDomainManager verwaltet

## Installation

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm oder yarn

### Schritte

1. Repository klonen oder Quellcode herunterladen
2. Abhängigkeiten installieren:

```bash
npm install
```

3. Anwendung bauen:

```bash
npm run build
```

## Konfiguration

Die Anwendung kann über verschiedene Methoden konfiguriert werden:

### 1. Kommandozeilenargumente

```bash
npm start -- --parallelWorkers=20 --batchSize=50 --browserFallback=true
```

### 2. Konfigurationsdateien

Die Konfiguration ist in mehrere Dateien aufgeteilt:

- **crawler.config.ts**: Hauptkonfiguration für den Crawler
- **playwright.config.ts**: Konfiguration für Playwright
- **logging.config.ts**: Konfiguration für die Protokollierung

### Konfigurationsoptionen

#### Parallelisierung
- **parallelWorkers**: Anzahl der parallelen Worker (Standard: 15)
- **batchSize**: Anzahl der Websites pro Batch (Standard: 100)

#### HTTP-Crawler
- **httpTimeout**: Timeout für HTTP-Anfragen in ms (Standard: 5000)
- **requestDelay**: Verzögerung zwischen Anfragen in ms (Standard: 100)
- **domainCooldown**: Cooldown-Zeit für Domains in ms (Standard: 2000)
- **maxRetries**: Maximale Anzahl von Wiederholungsversuchen (Standard: 3)

#### Playwright-Fallback
- **browserFallback**: Browser-Fallback aktivieren (Standard: true)
- **browserTimeout**: Timeout für Browser-Anfragen in ms (Standard: 15000)
- **maxBrowserInstances**: Maximale Anzahl von Browser-Instanzen (Standard: 3)
- **headless**: Browser im Headless-Modus ausführen (Standard: true)

#### Anti-Blocking
- **userAgentRotation**: User-Agent-Rotation aktivieren (Standard: true)
- **randomDelay**: Zufällige Verzögerung aktivieren (Standard: true)
- **respectRobotsTxt**: robots.txt-Regeln respektieren (Standard: false)

#### Ausgabe
- **outputDir**: Ausgabeverzeichnis (Standard: ./output)
- **logLevel**: Log-Level (debug, info, warn, error) (Standard: info)

#### Performance
- **maxConcurrentRequests**: Maximale Anzahl gleichzeitiger Anfragen (Standard: 50)
- **connectionPoolSize**: Größe des Verbindungspools (Standard: 20)

## Verwendung

### Websites definieren

Standardmäßig erwartet die Anwendung die `websites.json`-Datei im Verzeichnis `./data/websites.json` relativ zum aktuellen Arbeitsverzeichnis. Sie können jedoch auch einen benutzerdefinierten Pfad über die Umgebungsvariable `ROBOTS_CRAWLER_WEBSITES_PATH` oder beim Starten der Anwendung angeben.

Die Datei sollte eine Liste von Websites im folgenden Format enthalten:

```json
[
  {
    "site": "https://www.example.com"
  },
  {
    "site": "https://www.example.org"
  }
]
```

Wenn Sie die Datei im Hauptverzeichnis des Projekts platzieren möchten, können Sie die Anwendung wie folgt starten:

```bash
npm start -- --websitesPath=./websites.json
```

### Anwendung starten

```bash
npm start
```

### Kommandozeilenoptionen

```
Robots.txt Crawler - Ein moderner Webcrawler zum Extrahieren von robots.txt-Dateien

Verwendung:
  npm start -- [Optionen]

Optionen:
  --parallelWorkers=<Anzahl>   Anzahl der parallelen Worker (Standard: 15)
  --batchSize=<Anzahl>         Anzahl der Websites pro Batch (Standard: 100)
  --browserFallback=<bool>     Browser-Fallback aktivieren (Standard: true)
  --outputDir=<Pfad>           Ausgabeverzeichnis (Standard: ./output)
  --logLevel=<Level>           Log-Level (debug, info, warn, error) (Standard: info)
  --help                       Diese Hilfe anzeigen
```

## Ausgabe

Die Anwendung erstellt folgende Ausgabeverzeichnisse:

- **output/robots-files/**: Enthält die extrahierten robots.txt-Dateien
- **output/reports/**: Enthält Berichte über das Crawling
- **output/logs/**: Enthält Protokolldateien

### Robots.txt-Dateien

Die extrahierten robots.txt-Dateien werden im Verzeichnis `output/robots-files/` gespeichert. Der Dateiname folgt dem Format `[normalisierte-domain]-robots.txt`.

### Berichte

Nach jedem Crawling-Durchlauf werden zwei Arten von Berichten erstellt:

1. **Crawl-Ergebnisse**: Detaillierte Informationen zu jedem Crawling-Versuch
2. **Crawl-Zusammenfassung**: Zusammenfassung des gesamten Crawling-Durchlaufs

## Fehlerbehebung

### Häufige Probleme

#### Die Anwendung kann keine Verbindung zu Websites herstellen
- Überprüfen Sie Ihre Internetverbindung
- Erhöhen Sie den Timeout-Wert mit `--httpTimeout=10000`
- Aktivieren Sie den Browser-Fallback mit `--browserFallback=true`

#### Die Anwendung wird von Websites blockiert
- Aktivieren Sie die User-Agent-Rotation mit `--userAgentRotation=true`
- Erhöhen Sie die Verzögerung zwischen Anfragen mit `--requestDelay=500`
- Erhöhen Sie die Cooldown-Zeit für Domains mit `--domainCooldown=5000`

#### Die Anwendung verbraucht zu viele Ressourcen
- Reduzieren Sie die Anzahl der parallelen Worker mit `--parallelWorkers=5`
- Reduzieren Sie die Batch-Größe mit `--batchSize=50`
- Reduzieren Sie die maximale Anzahl von Browser-Instanzen in der Konfiguration

## Entwicklung

### Projektstruktur

```
robots-txt-crawler/
├── config/                  # Konfigurationsdateien
│   ├── crawler.config.ts    # Hauptkonfiguration
│   ├── logging.config.ts    # Logging-Konfiguration
│   └── playwright.config.ts # Playwright-Konfiguration
├── src/                     # Quellcode
│   ├── services/            # Dienste
│   │   ├── BrowserPool.ts
│   │   ├── CrawlOrchestrator.ts
│   │   ├── FailedDomainManager.ts
│   │   ├── FileManager.ts
│   │   ├── HttpCrawler.ts
│   │   ├── PlaywrightCrawler.ts
│   │   ├── ProgressMonitor.ts
│   │   └── WebsiteLoader.ts
│   ├── types/               # Typdefinitionen
│   │   ├── Config.ts
│   │   ├── CrawlResult.ts
│   │   └── Website.ts
│   ├── utils/               # Hilfsfunktionen
│   ├── workers/             # Worker-Threads
│   └── app.ts               # Hauptanwendung
├── tests/                   # Tests
│   ├── integration/
│   └── unit/
├── output/                  # Ausgabeverzeichnis
│   ├── logs/
│   ├── reports/
│   └── robots-files/
├── package.json
├── tsconfig.json
└── websites.json            # Liste der zu crawlenden Websites
```

### Entwicklungsbefehle

- **Build**: `npm run build`
- **Entwicklungsmodus**: `npm run dev`
- **Tests**: `npm test`
- **Linting**: `npm run lint`

### Erweiterung

Die Anwendung ist modular aufgebaut und kann leicht erweitert werden:

1. **Neue Crawler-Methode hinzufügen**: Erstellen Sie eine neue Klasse, die das Crawling durchführt, und integrieren Sie sie in den CrawlOrchestrator
2. **Neue Ausgabeformate hinzufügen**: Erweitern Sie den FileManager, um zusätzliche Ausgabeformate zu unterstützen
3. **Neue Anti-Blocking-Maßnahmen hinzufügen**: Implementieren Sie zusätzliche Maßnahmen in den Crawler-Klassen
