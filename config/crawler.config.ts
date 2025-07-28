import { z } from 'zod';

// Zod Schema für die Konfigurationsvalidierung
export const CrawlerConfigSchema = z.object({
  // Parallelisierung
  parallelWorkers: z.number().int().positive().default(15),
  batchSize: z.number().int().positive().default(100),
  
  // HTTP-Crawler
  httpTimeout: z.number().int().positive().default(5000),
  requestDelay: z.number().int().nonnegative().default(100),
  domainCooldown: z.number().int().nonnegative().default(2000),
  maxRetries: z.number().int().nonnegative().default(3),
  
  // Playwright-Fallback
  browserFallback: z.boolean().default(true),
  browserTimeout: z.number().int().positive().default(15000),
  maxBrowserInstances: z.number().int().positive().default(3),
  headless: z.boolean().default(true),
  
  // Anti-Blocking
  userAgentRotation: z.boolean().default(true),
  randomDelay: z.boolean().default(true),
  respectRobotsTxt: z.boolean().default(false),
  
  // Output
  outputDir: z.string().default('./output'),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Performance
  maxConcurrentRequests: z.number().int().positive().default(50),
  connectionPoolSize: z.number().int().positive().default(20),
});

// Typ aus dem Schema ableiten
export type CrawlerConfig = z.infer<typeof CrawlerConfigSchema>;

// Standard-Konfiguration
export const defaultConfig: CrawlerConfig = {
  // Parallelisierung
  parallelWorkers: 15,
  batchSize: 100,
  
  // HTTP-Crawler
  httpTimeout: 5000,
  requestDelay: 100,
  domainCooldown: 2000,
  maxRetries: 3,
  
  // Playwright-Fallback
  browserFallback: true,
  browserTimeout: 15000,
  maxBrowserInstances: 3,
  headless: true,
  
  // Anti-Blocking
  userAgentRotation: true,
  randomDelay: true,
  respectRobotsTxt: false,
  
  // Output
  outputDir: './output',
  logLevel: 'info',
  
  // Performance
  maxConcurrentRequests: 50,
  connectionPoolSize: 20,
};

// Konfiguration laden und validieren
export function loadConfig(customConfig: Partial<CrawlerConfig> = {}): CrawlerConfig {
  try {
    return CrawlerConfigSchema.parse({
      ...defaultConfig,
      ...customConfig
    });
  } catch (error) {
    console.error('Ungültige Konfiguration:', error);
    return defaultConfig;
  }
}
