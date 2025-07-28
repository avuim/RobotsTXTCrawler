// Mögliche Status für ein Crawling-Ergebnis
export type CrawlStatus = 'success' | 'failed' | 'pending' | 'skipped';

// Mögliche Methoden für das Crawling
export type CrawlMethod = 'http' | 'playwright' | 'both_failed' | 'not_attempted';

// Interface für ein einzelnes Crawling-Ergebnis
export interface CrawlResult {
  domain: string;
  status: CrawlStatus;
  method?: CrawlMethod;
  content?: string;
  error?: string;
  responseTime?: number;
  fileSize?: number;
  outputFile?: string;
  timestamp?: string;
  retryCount?: number;
}

// Interface für eine Zusammenfassung des Crawlings
export interface CrawlSummary {
  id: string;
  startTime: string;
  endTime: string;
  totalSites: number;
  successful: number;
  failed: number;
  skipped: number;
  totalDuration: number;
  avgResponseTime: number;
  config: Record<string, any>;
}

// Interface für fehlgeschlagene Domains
export interface FailedDomain {
  domain: string;
  lastAttempt: string;
  attempts: number;
  lastError: string;
  nextRetry?: string;
}

// Interface für die Persistierung fehlgeschlagener Domains
export interface FailedDomainsStorage {
  failedDomains: Record<string, FailedDomain>;
}
