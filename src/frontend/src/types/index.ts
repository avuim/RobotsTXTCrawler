// Bot-Kategorien
export type BotCategory = 'searchEngine' | 'seo' | 'aiScraper' | 'other';

// Monatliche Bot-Statistiken
export interface MonthlyBotStats {
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
  websites: {
    allowed: string[];
    disallowed: string[];
  };
}

// Bot-Informationen
export interface BotInfo {
  name: string;
  category: BotCategory;
  description?: string;
  owner?: string;
  website?: string;
  monthlyStats: {
    [month: string]: MonthlyBotStats;
  };
}

// Bot-Statistiken
export interface BotStatistics {
  totalBots: number;
  categories: {
    searchEngine: number;
    seo: number;
    aiScraper: number;
    other: number;
  };
  bots: {
    [botName: string]: BotInfo;
  };
}

// Website-Analyse
export interface WebsiteAnalysis {
  domain: string;
  normalizedDomain: string;
  bots: {
    name: string;
    allowed: boolean;
    category: BotCategory;
  }[];
}

// Dashboard-Zusammenfassung
export interface Summary {
  totalBots: number;
  totalWebsites: number;
  botCategories: {
    searchEngine: number;
    seo: number;
    aiScraper: number;
    other: number;
  };
  topBots: {
    name: string;
    category: BotCategory;
    totalWebsites: number;
    allowedWebsites: number;
    disallowedWebsites: number;
  }[];
}

// Trend-Daten
export interface TrendsData {
  months: string[];
  botTrends: {
    totalBots: number[];
  };
  categoryTrends: {
    searchEngine: number[];
    seo: number[];
    aiScraper: number[];
    other: number[];
  };
  websiteTrends: {
    totalWebsites: number[];
  };
}
