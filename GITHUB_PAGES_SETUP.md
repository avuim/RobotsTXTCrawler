# GitHub Pages Setup für RobotsTXTCrawler

Diese Anleitung erklärt, wie Sie das Frontend Ihrer RobotsTXTCrawler-Anwendung über GitHub Pages bereitstellen können.

## Voraussetzungen

1. GitHub Repository mit dem RobotsTXTCrawler Code
2. Analysedaten im `data/` Verzeichnis (durch Ihre bestehende Crawl-Action generiert)

## Setup-Schritte

### 1. GitHub Pages aktivieren

1. Gehen Sie zu Ihrem GitHub Repository
2. Klicken Sie auf **Settings** (Einstellungen)
3. Scrollen Sie zu **Pages** im linken Menü
4. Unter **Source** wählen Sie **GitHub Actions**

### 2. Workflow-Dateien

Die folgenden Workflow-Dateien wurden bereits erstellt:

- `.github/workflows/deploy-frontend.yml` - Deployed das Frontend zu GitHub Pages

### 3. Automatisches Deployment

Das Frontend wird automatisch deployed wenn:

- Änderungen am Frontend-Code (`src/frontend/**`) gepusht werden
- Neue Analysedaten (`data/**`) verfügbar sind
- Der Workflow manuell über die GitHub Actions UI ausgelöst wird

### 4. Zugriff auf die Website

Nach erfolgreichem Deployment ist Ihre Website verfügbar unter:

```
https://avuim.github.io/RobotsTXTCrawler
```

## Funktionsweise

### Statische API

Das Frontend funktioniert ohne Live-API-Server durch:

1. **Datenvorbereitung**: Die GitHub Action kopiert alle Analysedaten aus `data/` in das Frontend
2. **Statische JSON-Dateien**: Daten werden als statische Dateien bereitgestellt
3. **Hybride API**: Das Frontend erkennt automatisch ob es lokal (mit Live-API) oder auf GitHub Pages (statisch) läuft

### Datenaktualisierung

- Das Frontend wird automatisch aktualisiert wenn neue Crawl-Daten verfügbar sind
- Ihre bestehende Crawl-Action generiert die Daten
- Die Frontend-Action wird durch Änderungen im `data/` Verzeichnis getriggert

## Lokale Entwicklung

Für lokale Entwicklung:

```bash
cd src/frontend
npm install
npm start
```

Das Frontend läuft dann auf `http://localhost:3000` und nutzt die Live-API auf `http://localhost:3001`.

## Troubleshooting

### Frontend wird nicht aktualisiert

1. Überprüfen Sie die GitHub Actions Logs
2. Stellen Sie sicher, dass GitHub Pages aktiviert ist
3. Prüfen Sie ob die Analysedaten im `data/` Verzeichnis vorhanden sind

### API-Fehler auf GitHub Pages

1. Überprüfen Sie die Browser-Konsole auf Fehler
2. Stellen Sie sicher, dass alle JSON-Dateien korrekt kopiert wurden
3. Prüfen Sie die Netzwerk-Registerkarte auf fehlgeschlagene Requests

### Deployment schlägt fehl

1. Überprüfen Sie die GitHub Actions Logs
2. Stellen Sie sicher, dass alle Frontend-Abhängigkeiten installiert werden können
3. Prüfen Sie ob die Node.js-Version kompatibel ist

## Anpassungen

### API-Base-URL ändern

Falls Sie das Repository umbenennen, passen Sie in `.github/workflows/deploy-frontend.yml` an:

```yaml
echo "REACT_APP_API_BASE_URL=/IHR_NEUER_REPO_NAME/api" > .env.production
```

### Zusätzliche Daten einbinden

Um weitere Datenquellen einzubinden, erweitern Sie den "Prepare static data" Schritt in der GitHub Action.

## Kosten

- GitHub Pages ist kostenlos für öffentliche Repositories
- GitHub Actions haben ein kostenloses Kontingent (2000 Minuten/Monat für kostenlose Accounts)
- Keine zusätzlichen Hosting-Kosten
