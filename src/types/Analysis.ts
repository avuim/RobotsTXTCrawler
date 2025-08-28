// Typen für die Bot-Kategorien
export type BotCategory = string;

// Interface für die monatlichen Statistiken eines Bots
export interface BotMonthlyStat {
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
  websites: {
    allowed: string[];
    disallowed: string[];
  };
  // Neue Struktur für Directory-basierte Regeln
  directoryRules: {
    allowed: {
      [directory: string]: string[];  // Directory -> Liste von Websites
    };
    disallowed: {
      [directory: string]: string[];  // Directory -> Liste von Websites
    };
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
export type BotCategories = Record<string, number>;

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
  robotsTxt?: string;
  
  // Neue Struktur: Trennung von globalen und bot-spezifischen Regeln
  globalRules: {
    paths: {
      allowed: string[];
      disallowed: string[];
    };
  };
  
  // Spezifische Bots ohne den Wildcard "*"
  specificBots: {
    name: string;
    allowed: boolean;
    paths?: {
      allowed: string[];
      disallowed: string[];
    };
  }[];
  
  // Neue Statistik-Struktur
  stats: {
    totalSpecificBots: number;    // Anzahl explizit definierter Bots (ohne *)
    allowedBots: number;          // Nur spezifische Bots
    disallowedBots: number;       // Nur spezifische Bots
    hasGlobalAllow: boolean;      // Status für User-agent: *
  };
  
  // Legacy-Felder für Rückwärtskompatibilität (deprecated)
  bots?: {
    name: string;
    allowed: boolean;
  }[];
  paths?: {
    allowed: string[];
    disallowed: string[];
  };
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
    defaultCategory: string;
  };
  settings: {
    minWebsitesForBot: number;
    maxTopBots: number;
    trendMonths: number;
  };
}
