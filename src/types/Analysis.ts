// Typen für die Bot-Kategorien
export type BotCategory = 'searchEngine' | 'seo' | 'aiScraper' | 'other';

// Interface für die monatlichen Statistiken eines Bots
export interface BotMonthlyStat {
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
  websites: {
    allowed: string[];
    disallowed: string[];
  };
}

// Interface für die Informationen zu einem Bot
export interface BotInfo {
  name: string;
  category: BotCategory;
  owner?: string;
  description?: string;
  website?: string;
  monthlyStats: Record<string, BotMonthlyStat>;
}

// Interface für die Kategorisierung der Bots
export interface BotCategories {
  searchEngine: number;
  seo: number;
  aiScraper: number;
  other: number;
}

// Interface für die Bot-Statistiken
export interface BotStatistics {
  lastUpdated: string;
  totalWebsites: number;
  totalBots: number;
  botCategories: BotCategories;
  bots: Record<string, BotInfo>;
}

// Interface für die Analyse-Ergebnisse einer Website
export interface WebsiteAnalysis {
  domain: string;
  normalizedDomain: string;
  bots: {
    name: string;
    allowed: boolean;
  }[];
}

// Interface für die Analyse-Ergebnisse eines Bots
export interface BotAnalysis {
  name: string;
  category: BotCategory;
  websites: {
    domain: string;
    allowed: boolean;
  }[];
}

// Interface für die Analyse-Konfiguration
export interface AnalysisConfig {
  paths: {
    crawlResults: string;
    analysisOutput: string;
    botStatistics: string;
  };
  botCategories: {
    searchEngine: string[];
    seo: string[];
    aiScraper: string[];
    defaultCategory: string;
  };
  settings: {
    minWebsitesForBot: number;
    maxTopBots: number;
    trendMonths: number;
  };
}
