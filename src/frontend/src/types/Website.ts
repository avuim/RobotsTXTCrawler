export interface Website {
  domain: string;
  robotsTxt: string;
  
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
  totalBots?: number;
  allowedBots?: number;
  disallowedBots?: number;
  bots?: {
    allowed: string[];
    disallowed: string[];
  };
  paths?: {
    allowed: string[];
    disallowed: string[];
  };
}

export interface WebsiteSummary {
  domain: string;
  totalBots: number;
  allowedBots: number;
  disallowedBots: number;
}
