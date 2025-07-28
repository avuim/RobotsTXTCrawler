import { CrawlerConfig } from '../../config/crawler.config';
import { LoggingConfig } from '../../config/logging.config';
import { PlaywrightConfig } from '../../config/playwright.config';

// Interface für die gesamte Anwendungskonfiguration
export interface AppConfig {
  crawler: CrawlerConfig;
  logging: LoggingConfig;
  playwright: PlaywrightConfig;
}

// Interface für die Kommandozeilenargumente
export interface CliArgs {
  configPath?: string;
  websitesPath?: string;
  outputDir?: string;
  parallelWorkers?: number;
  logLevel?: string;
  browserFallback?: boolean;
  help?: boolean;
}

// Interface für die Umgebungsvariablen
export interface EnvVars {
  ROBOTS_CRAWLER_CONFIG_PATH?: string;
  ROBOTS_CRAWLER_WEBSITES_PATH?: string;
  ROBOTS_CRAWLER_OUTPUT_DIR?: string;
  ROBOTS_CRAWLER_PARALLEL_WORKERS?: string;
  ROBOTS_CRAWLER_LOG_LEVEL?: string;
  ROBOTS_CRAWLER_BROWSER_FALLBACK?: string;
}
