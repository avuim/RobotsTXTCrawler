import { LaunchOptions } from 'playwright';

// Typ für die Playwright-Konfiguration
export interface PlaywrightConfig {
  launchOptions: LaunchOptions;
  maxBrowserInstances: number;
  navigationTimeout: number;
  userAgents: string[];
}

// Standard-Konfiguration
export const defaultPlaywrightConfig: PlaywrightConfig = {
  launchOptions: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security'
    ]
  },
  maxBrowserInstances: 3,
  navigationTimeout: 15000,
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59'
  ]
};

// Zufälligen User-Agent auswählen
export function getRandomUserAgent(config: PlaywrightConfig = defaultPlaywrightConfig): string {
  const index = Math.floor(Math.random() * config.userAgents.length);
  return config.userAgents[index];
}
