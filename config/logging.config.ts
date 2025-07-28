import winston from 'winston';
import path from 'path';
import fs from 'fs-extra';

// Typ für die Logging-Konfiguration
export interface LoggingConfig {
  logLevel: string;
  logDir: string;
  logFileName: string;
  consoleOutput: boolean;
}

// Standard-Konfiguration
export const defaultLoggingConfig: LoggingConfig = {
  logLevel: 'info',
  logDir: './output/logs',
  logFileName: `crawl-${new Date().toISOString().replace(/:/g, '-')}.json`,
  consoleOutput: true
};

// Logger erstellen
export function createLogger(config: LoggingConfig = defaultLoggingConfig): winston.Logger {
  // Sicherstellen, dass das Log-Verzeichnis existiert
  fs.ensureDirSync(config.logDir);
  
  const logFilePath = path.join(config.logDir, config.logFileName);
  
  // Transports konfigurieren
  const transports: winston.transport[] = [
    new winston.transports.File({
      filename: logFilePath,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ];
  
  // Konsolenausgabe hinzufügen, wenn aktiviert
  if (config.consoleOutput) {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...rest }) => {
            return `${timestamp} ${level}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''}`;
          })
        )
      })
    );
  }
  
  // Logger erstellen
  return winston.createLogger({
    level: config.logLevel,
    format: winston.format.json(),
    defaultMeta: { service: 'robots-txt-crawler' },
    transports
  });
}

// Hilfsfunktion zum Erstellen eines strukturierten Log-Eintrags
export function createLogEntry(domain: string, status: 'success' | 'failed', details: Record<string, any> = {}): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    domain,
    status,
    ...details
  };
}
