# Robots.txt Crawler und Analyzer

Ein moderner Webcrawler zum Extrahieren von robots.txt-Dateien von Websites mit Analyse- und Visualisierungsfunktionen.

## Übersicht

Der Robots.txt Crawler ist eine leistungsstarke TypeScript-Anwendung, die entwickelt wurde, um robots.txt-Dateien von einer Liste von Websites zu extrahieren. Die Anwendung verwendet einen zweistufigen Ansatz: Zuerst wird versucht, die robots.txt-Datei über einfache HTTP-Anfragen abzurufen, und falls dies fehlschlägt, wird optional ein Browser-basierter Ansatz mit Playwright als Fallback verwendet.

## Funktionen

- **Effizientes Crawling**: Extrahiert robots.txt-Dateien von Websites mit optimierter Leistung
- **Parallele Verarbeitung**: Verarbeitet mehrere Websites gleichzeitig für höhere Geschwindigkeit
- **Batch-Verarbeitung**: Teilt die zu verarbeitenden Websites in Batches auf
- **Browser-Fallback**: Verwendet Playwright als Fallback, wenn HTTP-Anfragen fehlschlagen
- **Anti-Blocking-Maßnahmen**: Implementiert User-Agent-Rotation und zufällige Verzögerungen
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
9. Nach dem Crawling werden die Daten vom AnalysisOrchestrator analysiert
10. Die Analyseergebnisse werden in JSON-Dateien gespeichert
11. Der API-Server stellt die Daten für das Frontend bereit

## Analyse und Visualisierung

Die Anwendung bietet umfangreiche Funktionen zur Analyse und Visualisierung der gecrawlten robots.txt-Daten:

### Analyse-Komponenten

- **AnalysisOrchestrator**: Koordiniert die verschiedenen Analyzer und führt die Analyse durch
- **BotAnalyzer**: Analysiert alle robots.txt-Dateien und extrahiert Informationen zu Bots
- **WebsiteAnalyzer**: Analysiert die robots.txt-Dateien für jede Website
- **TemporalAnalyzer**: Analysiert die zeitlichen Trends basierend auf den Bot-Statistiken

### Visualisierungs-Komponenten

- **API-Server**: Stellt die Analysedaten über eine REST-API bereit
- **Frontend**: Modernes Web-Frontend zur Visualisierung der Analysedaten
  - **Dashboard**: Übersicht der wichtigsten Statistiken und Diagramme
  - **BotList**: Liste aller Bots mit Filtermöglichkeiten
  - **BotDetail**: Detaillierte Informationen zu einem einzelnen Bot
  - **WebsiteList**: Liste aller Websites mit Suchfunktion
  - **WebsiteDetail**: Detaillierte Informationen zu einer einzelnen Website

### Analysierte Daten

- **Bot-Kategorisierung**: Bots werden in Kategorien wie Suchmaschinen-Bots, SEO-Bots und KI/LLM-Scraper-Bots eingeteilt
- **Bot-Statistiken**: Häufigkeit der Listung in robots.txt-Dateien, Allow/Disallow-Verhältnis
- **Website-Statistiken**: Welche Bots sind in der robots.txt einer Website konfiguriert
- **Zeitliche Trends**: Entwicklung der Bot-Nutzung über die Zeit

### Datenmodell

Die Analysedaten werden in JSON-Dateien gespeichert:

- **bot-statistics.json**: Enthält Kerninformationen zu den Bots, wie Grundinformationen, Anzahl der Websites und Allow/Disallow-Konfigurationen
- **summary.json**: Enthält eine Zusammenfassung der Analyse
- **websites/*.json**: Enthält Informationen zu jeder Website
- **trends/monthly-trends.json**: Enthält zeitliche Trends

### Modulare Architektur

Die Analyse- und Visualisierungskomponenten sind modular aufgebaut, sodass weitere Analysen und Visualisierungen einfach hinzugefügt werden können:

- **Analyzer-Module**: Neue Analyzer können hinzugefügt werden, um weitere Aspekte der robots.txt-Daten zu analysieren
- **API-Endpunkte**: Neue API-Endpunkte können hinzugefügt werden, um weitere Daten bereitzustellen
- **Frontend-Komponenten**: Neue Seiten und Komponenten können hinzugefügt werden, um weitere Visualisierungen zu erstellen

## Installation

### Voraussetzungen

- Node.js (Version 16 oder höher)
- npm oder yarn

### Schritte

1. Repository klonen:

```bash
git clone https://github.com/avuim/RobotsTXTCrawler.git
cd RobotsTXTCrawler
```

2. Abhängigkeiten installieren:

```bash
npm install
```

3. Playwright-Browser (zwecks alternativer Crawlmethode) installieren:

```bash
npx playwright install
```

4. Anwendung bauen:

```bash
npm run build
```

## Konfiguration & Ausführung der Applikation (Crawler, Analyse, API)

Die Anwendung kann über verschiedene Methoden konfiguriert werden:

### Kommandozeilenargumente

Die Standardausführung:

```bash
npm start -- --parallelWorkers=20 --batchSize=50 --browserFallback=true
```

#### Verfügbare Optionen

- **--parallelWorkers=<Anzahl>**: Anzahl der parallelen Worker (Standard: 15)
- **--batchSize=<Anzahl>**: Anzahl der Websites pro Batch (Standard: 100)
- **--browserFallback=<bool>**: Browser-Fallback aktivieren (Standard: true)
- **--forceUpdate=<bool>**: Alle robots.txt Dateien aktualisieren (Standard: false)
- **--updateAfterDays=<Anzahl>**: Tage bis robots.txt als veraltet gilt (Standard: 30)
- **--outputDir=<Pfad>**: Ausgabeverzeichnis (Standard: ./output)
- **--logLevel=<Level>**: Log-Level (debug, info, warn, error) (Standard: info)
- **--help**: Diese Hilfe anzeigen

#### Ausführungsmodus
Die Teil-Anwendungskomponenten können in verschiedenen Modi gestartet werden, die über npm-Skripte aufgerufen werden:

```bash
npm run start:crawl-only # Nur Crawling durchführen
npm run start:analyze    # Nur Analyse durchführen
npm run start:api        # Nur API-Server starten
npm run start:skip-crawl # Analyse und API starten, ohne Crawling

```

Für CI/CD-Umgebungen wie GitHub Actions kann der entsprechende Modus direkt aufgerufen werden:

```yaml
# Beispiel für GitHub Actions
jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run start:crawl-only  # Nur Crawling durchführen
```

### Konfigurationsdateien

Die Konfiguration ist in mehrere Dateien aufgeteilt:

- **crawler.config.ts**: Hauptkonfiguration für den Crawler
- **playwright.config.ts**: Konfiguration für Playwright
- **logging.config.ts**: Konfiguration für die Protokollierung

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

#### Update-Verhalten
- **forceUpdate**: Alle robots.txt Dateien bei jedem Crawl aktualisieren (Standard: false)
- **updateAfterDays**: Anzahl der Tage, nach denen eine robots.txt Datei als veraltet gilt (Standard: 30)

#### Performance
- **maxConcurrentRequests**: Maximale Anzahl gleichzeitiger Anfragen (Standard: 50)
- **connectionPoolSize**: Größe des Verbindungspools (Standard: 20)

### Frontend starten

Das Frontend befindet sich im Verzeichnis `src/frontend` und kann sowohl für lokale Entwicklung als auch für GitHub Pages konfiguriert werden.

#### Einheitliche Konfiguration

Das Frontend verwendet eine einheitliche Konfiguration für sowohl lokale Entwicklung als auch GitHub Pages Deployment:

```bash
cd src/frontend
npm install
npm start
```

Das Frontend ist dann unter `http://localhost:3000/RobotsTXTCrawler` erreichbar und funktioniert mit dem gleichen Routing wie auf GitHub Pages (z.B. `https://avuim.github.io/RobotsTXTCrawler/websites/example.com`).

#### GitHub Pages Deployment

Das Deployment auf GitHub Pages verwendet die gleiche Konfiguration:

```bash
cd src/frontend
npm run build  # Verwendet die gleiche Konfiguration wie lokale Entwicklung
```

#### API-Konfiguration

Das Frontend erkennt automatisch die API-Umgebung:

- **Lokale Entwicklung**: Live-API auf `http://localhost:3001/api`
- **GitHub Pages**: Statische API-Daten aus `/RobotsTXTCrawler/api`

#### Verfügbare Scripts

- `npm start`: Startet das Frontend mit `/RobotsTXTCrawler` Routing
- `npm run build`: Produktions-Build für GitHub Pages
- `npm test`: Führt Tests aus

### API verwenden

Die API wird automatisch gestartet, wenn die Hauptanwendung ohne die Option `--crawlOnly` gestartet wird. Die API ist dann unter `http://localhost:3001` erreichbar und bietet folgende Endpunkte:

- `GET /api/summary`: Liefert eine Zusammenfassung der Analyse
- `GET /api/bots`: Liefert Informationen zu allen Bots
- `GET /api/bots/:botName`: Liefert detaillierte Informationen zu einem bestimmten Bot
- `GET /api/websites`: Liefert eine Liste aller analysierten Websites
- `GET /api/websites/:domain`: Liefert detaillierte Informationen zu einer bestimmten Website

## Ausgabe

Die Anwendung erstellt folgende Ausgabeverzeichnisse:

- **output/robots-files/**: Enthält die extrahierten robots.txt-Dateien
- **output/reports/**: Enthält Berichte über das Crawling
- **output/logs/**: Enthält Protokolldateien

### Robots.txt-Dateien

Die extrahierten robots.txt-Dateien werden im Verzeichnis `output/robots-files/` gespeichert. Der Dateiname folgt dem Format `[normalisierte-domain]-robots.txt`.


#### Update-Verhalten für robots.txt Dateien

Der Crawler implementiert eine intelligente Update-Logik, um zu verhindern, dass robots.txt Dateien dauerhaft übersprungen werden:

##### `forceUpdate` (boolean, Standard: false)
- **true**: Alle robots.txt Dateien werden bei jedem Crawl-Durchgang aktualisiert, unabhängig vom Alter
- **false**: robots.txt Dateien werden nur aktualisiert, wenn sie älter als `updateAfterDays` sind

##### `updateAfterDays` (number, Standard: 30)
- Anzahl der Tage, nach denen eine robots.txt Datei als "veraltet" gilt und aktualisiert werden sollte
- Wird nur berücksichtigt, wenn `forceUpdate` auf `false` steht

#### Beispiel-Konfigurationen

```bash
# Alle 7 Tage aktualisieren (Standardmodus: Crawling + Analyse + API)
npm start -- --updateAfterDays=7

# Bei jedem Crawl aktualisieren (nur mit --crawlOnly)
npm run start:crawl-only -- --forceUpdate=true

# Kombiniert: Force Update mit anderen Parametern
npm run start:crawl-only -- --forceUpdate=true --parallelWorkers=10

# Standard: Alle 30 Tage aktualisieren (keine Parameter nötig)
npm start
```

**Wichtiger Hinweis**: Die `--forceUpdate` Option funktioniert nur im Crawling-Only-Modus (`npm run start:crawl-only`), da sie spezifisch für das Crawling-Verhalten ist.

#### Verhalten

1. **Neue Websites**: Werden immer gecrawlt (robots.txt existiert noch nicht)
2. **Existierende robots.txt mit `forceUpdate: true`**: Werden bei jedem Crawl aktualisiert
3. **Existierende robots.txt mit `forceUpdate: false`**: Werden aktualisiert wenn:
   - Die Datei älter als `updateAfterDays` ist, ODER
   - Die Datei aus einem vorherigen Monat stammt UND der aktuelle Monat maximal noch einen Tag dauert (Monatsende-Regel)
4. **Failed Domains**: Bleiben weiterhin von der intelligenten Retry-Logik betroffen


### Berichte

Nach jedem Crawling-Durchlauf werden zwei Arten von Berichten erstellt:

1. **Crawl-Ergebnisse**: Detaillierte Informationen zu jedem Crawling-Versuch
2. **Crawl-Zusammenfassung**: Zusammenfassung des gesamten Crawling-Durchlaufs

### Analyse-Ausgabe

Nach der Analyse werden folgende Dateien erstellt:

1. **data/bot-statistics.json**: Enthält detaillierte Informationen zu allen Bots, einschließlich ihrer Kategorisierung, Beschreibung, Eigentümer und monatlichen Statistiken
2. **data/analysis/summary.json**: Enthält eine Zusammenfassung der Analyse, einschließlich der Gesamtzahl der Bots und Websites, der Bot-Kategorien und der Top-Bots
3. **data/analysis/websites/**: Enthält für jede Website eine JSON-Datei mit Informationen zu den Bots, die in der robots.txt-Datei konfiguriert sind
4. **data/analysis/trends/monthly-trends.json**: Enthält zeitliche Trends für Bots, Kategorien und Websites


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
│   ├── playwright.config.ts # Playwright-Konfiguration
│   └── analysis.config.ts   # Analyse-Konfiguration
├── src/                     # Quellcode
│   ├── services/            # Crawler-Dienste
│   │   ├── BrowserPool.ts
│   │   ├── CrawlOrchestrator.ts
│   │   ├── FailedDomainManager.ts
│   │   ├── FileManager.ts
│   │   ├── HttpCrawler.ts
│   │   ├── PlaywrightCrawler.ts
│   │   ├── ProgressMonitor.ts
│   │   └── WebsiteLoader.ts
│   ├── analyzers/           # Analyse-Dienste
│   │   ├── AnalysisOrchestrator.ts
│   │   ├── bot/
│   │   │   └── BotAnalyzer.ts
│   │   ├── website/
│   │   │   └── WebsiteAnalyzer.ts
│   │   └── temporal/
│   │       └── TemporalAnalyzer.ts
│   ├── api/                 # API-Server
│   │   ├── index.ts
│   │   └── ApiServer.ts
│   ├── frontend/            # Web-Frontend
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── charts/
│   │   │   │   └── layout/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── App.tsx
│   │   │   └── index.tsx
│   │   └── package.json
│   ├── types/               # Typdefinitionen
│   │   ├── Config.ts
│   │   ├── CrawlResult.ts
│   │   ├── Website.ts
│   │   └── Analysis.ts
│   ├── utils/               # Hilfsfunktionen
│   ├── workers/             # Worker-Threads
│   └── app.ts               # Hauptanwendung
├── tests/                   # Tests
│   ├── integration/
│   └── unit/
├── data/                    # Eingabe- und Analysedaten
│   ├── websites.json        # Liste der zu crawlenden Websites
│   ├── analysis/            # Analyseergebnisse
│   └── bot-statistics.json  # Bot-Statistiken
├── output/                  # Ausgabeverzeichnis für Crawling
│   ├── logs/
│   ├── reports/
│   └── robots-files/
├── package.json
└── tsconfig.json
```

### Entwicklungsbefehle

- **Build**: `npm run build`
- **Entwicklungsmodus**: `npm run dev`
- **Tests**: `npm test`
- **Linting**: `npm run lint`

## Technische Schulden und geplante Verbesserungen

### ESM-Kompatibilität

Der Crawler verwendet derzeit eine ältere Version (3.1.0) der Bibliothek `p-limit`, da neuere Versionen als ES-Module (ESM) veröffentlicht werden und nicht direkt mit CommonJS `require()` importiert werden können. Dies führt zu Fehlern wie:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module [...]/node_modules/p-limit/index.js not supported.
Instead change the require of index.js to a dynamic import() which is available in all CommonJS modules.
```

#### Geplante Verbesserung

Ein zukünftiges Refactoring sollte die Umstellung auf dynamische Imports beinhalten:

```typescript
// Aktuell (CommonJS-Stil):
import pLimit from 'p-limit';
const limit = pLimit(concurrency);

// Zukünftig (ESM-kompatibel):
const pLimit = await import('p-limit').then(module => module.default);
const limit = pLimit(concurrency);
```

Diese Änderung würde es ermöglichen, die neueste Version von `p-limit` zu verwenden und die Codebase zukunftssicherer zu machen. Da dynamische Imports asynchron sind, erfordert diese Änderung jedoch eine umfassendere Refaktorierung der betroffenen Codeteile.

### Erweiterung

Die Anwendung ist modular aufgebaut und kann leicht erweitert werden:

1. **Neue Crawler-Methode hinzufügen**: Erstellen Sie eine neue Klasse, die das Crawling durchführt, und integrieren Sie sie in den CrawlOrchestrator
2. **Neue Ausgabeformate hinzufügen**: Erweitern Sie den FileManager, um zusätzliche Ausgabeformate zu unterstützen
3. **Neue Anti-Blocking-Maßnahmen hinzufügen**: Implementieren Sie zusätzliche Maßnahmen in den Crawler-Klassen

### Ressourcen

- Standardisierung der robots.txt durch das IETF im Robots Exclusion Protocol: https://datatracker.ietf.org/doc/rfc9309/

- AI Preferences (aipref) Erweiterungen  https://datatracker.ietf.org/wg/aipref/about/. The AI Preferences Working Group will standardize building blocks that allow for the expression of preferences about how content is collected and processed for Artificial Intelligence (AI) model development, deployment, and use.
