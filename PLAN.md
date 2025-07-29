# Erweiterungsplan für RobotsTXTCrawler

Dieser Plan beschreibt die Erweiterung des RobotsTXTCrawlers um Funktionen zur Auswertung der robots.txt-Daten und deren Visualisierung mit einem modernen Web-Frontend.

## 1. Architektur-Übersicht

### Backend (Datenanalyse)
- **Analyzer-Modul**: Ein neues Modul zur Analyse der robots.txt-Dateien
  - Modulare Struktur für einfaches Hinzufügen neuer Analysen
  - Zentrale Koordination durch einen AnalysisOrchestrator
  - Speicherung der Analyseergebnisse in JSON-Dateien (inkl. bot-statistics.json)

### Frontend (Visualisierung)
- **Modernes Web-Frontend**: Basierend auf React mit TypeScript
  - Modulare Komponenten für verschiedene Visualisierungen
  - Responsive Design für verschiedene Endgeräte
  - Zentrale Datenverwaltung mit Context API oder Redux
  - API-Schnittstelle zum Backend für Datenabruf

### Verbindung zwischen Backend und Frontend
- **REST-API**: Einfache API zum Abrufen der Analysedaten
  - Endpunkte für verschiedene Analysetypen
  - Filterung und Sortierung der Daten
  - Caching-Mechanismen für bessere Performance

## 2. Datenanalyse-Komponenten

### BotAnalyzer
- Extrahiert alle User-Agents aus den robots.txt-Dateien
- Kategorisiert Bots nach Typen (Search Engine, SEO, AI/LLM, etc.)
- Zählt Häufigkeit der Bots über alle Websites
- Analysiert Allow/Disallow-Regeln pro Bot
- Aktualisiert die bot-statistics.json mit Grundinformationen zu Bots

### WebsiteAnalyzer
- Analysiert robots.txt-Dateien pro Website
- Extrahiert alle konfigurierten Bots pro Website
- Erstellt Statistiken über Allow/Disallow-Regeln

### TemporalAnalyzer
- Verfolgt Änderungen über die Zeit (monatlich)
- Speichert historische Daten für Trendanalysen

## 3. Frontend-Komponenten

### Dashboard
- Übersicht über wichtigste Kennzahlen
- Schnellzugriff auf häufig verwendete Analysen

### BotExplorer
- Liste aller Bots mit Kategorisierung
- Detailansicht mit Informationen zu jedem Bot
- Visualisierung der Häufigkeit über alle Websites
- Anzeige von Allow/Disallow-Statistiken

### WebsiteExplorer
- Suchfunktion für Websites
- Liste aller Bots pro Website mit Allow/Disallow-Status
- Detailansicht der robots.txt-Konfiguration

### Visualisierungen
- Balkendiagramme für Bot-Häufigkeiten
- Kreisdiagramme für Allow/Disallow-Verteilung
- Zeitreihen für Entwicklung über Monate
- Heatmaps für Bot-Website-Beziehungen

## 4. Implementierungsplan

### Phase 1: Datenanalyse-Backend
1. Implementierung des Analyzer-Moduls
2. Entwicklung der Bot-Kategorisierung
3. Erstellung der bot-statistics.json
4. Implementierung der REST-API

### Phase 2: Frontend-Grundstruktur
1. Setup des React-Projekts mit TypeScript
2. Implementierung der Basiskomponenten
3. Einrichtung der API-Kommunikation
4. Entwicklung des responsiven Layouts

### Phase 3: Visualisierungen
1. Implementierung der Diagramm-Komponenten
2. Entwicklung der interaktiven Elemente
3. Integration der Filterfunktionen
4. Optimierung der Performance

### Phase 4: Integration und Tests
1. Verbindung von Backend und Frontend
2. End-to-End-Tests
3. Performance-Optimierung
4. Dokumentation

## 5. Technologie-Stack

### Backend
- TypeScript (bestehend)
- Node.js (bestehend)
- Express.js für die API
- fs-extra für Dateizugriff (bestehend)

### Frontend
- React mit TypeScript
- Chart.js oder D3.js für Visualisierungen
- Axios für API-Anfragen
- Styled-components oder Tailwind CSS für Styling

### Datenformat
- JSON für Datenspeicherung und -austausch
- Strukturierte Schemas für konsistente Datenformate

## 6. Struktur der bot-statistics.json

```json
{
  "lastUpdated": "2025-07-29T15:00:00Z",
  "totalWebsites": 1024,
  "totalBots": 156,
  "botCategories": {
    "searchEngine": 15,
    "seo": 28,
    "aiScraper": 42,
    "other": 71
  },
  "bots": {
    "Googlebot": {
      "name": "Googlebot",
      "category": "searchEngine",
      "owner": "Google",
      "description": "Der Hauptcrawler von Google für die Websuche",
      "website": "https://developers.google.com/search/docs/crawling-indexing/googlebot",
      "monthlyStats": {
        "2025-06": {
          "totalWebsites": 980,
          "allowedWebsites": 950,
          "disallowedWebsites": 30,
          "websites": {
            "allowed": ["example.com", "example.org"],
            "disallowed": ["private-site.com"]
          }
        },
        "2025-07": {
          "totalWebsites": 1015,
          "allowedWebsites": 975,
          "disallowedWebsites": 40,
          "websites": {
            "allowed": ["example.com", "example.org", "new-site.com"],
            "disallowed": ["private-site.com", "another-private.com"]
          }
        }
      }
    },
    "GPTBot": {
      "name": "GPTBot",
      "category": "aiScraper",
      "owner": "OpenAI",
      "description": "Crawler für die Trainingsdaten von ChatGPT",
      "website": "https://platform.openai.com/docs/gptbot",
      "monthlyStats": {
        "2025-06": {
          "totalWebsites": 850,
          "allowedWebsites": 150,
          "disallowedWebsites": 700,
          "websites": {
            "allowed": ["public-data.com"],
            "disallowed": ["news-site.com"]
          }
        },
        "2025-07": {
          "totalWebsites": 920,
          "allowedWebsites": 120,
          "disallowedWebsites": 800,
          "websites": {
            "allowed": ["public-data.com", "open-content.org"],
            "disallowed": ["news-site.com", "premium-content.de"]
          }
        }
      }
    }
  }
}
```

Diese Struktur bietet mehrere Vorteile:

1. **Historische Verfolgung**: Wir können sehen, wie sich die Allow/Disallow-Konfigurationen für jeden Bot über die Zeit ändern.
2. **Vergleichbarkeit**: Es ist einfach, Veränderungen zwischen verschiedenen Monaten zu identifizieren.
3. **Vollständigkeit**: Für jeden Monat haben wir sowohl die aggregierten Zahlen als auch die vollständigen Listen.
4. **Analysemöglichkeiten**: Wir können Trends erkennen, z.B. welche Websites ihre Konfiguration für bestimmte Bots geändert haben.
