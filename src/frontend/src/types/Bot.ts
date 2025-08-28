export type BotCategory = 'searchEngine' | 'seo' | 'aiScraper' | 'other';

export interface BotStats {
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
  websites: {
    allowed: string[];
    disallowed: string[];
  };
  directoryRules: {
    allowed: {
      [directory: string]: string[];
    };
    disallowed: {
      [directory: string]: string[];
    };
  };
}

export interface BotDetails {
  name: string;
  owner: string;
  description: string;
  website: string;
}

export interface Bot {
  name: string;
  category: BotCategory;
  owner?: string;
  description?: string;
  website?: string;
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
  monthlyStats: Record<string, BotStats>;
  details?: BotDetails;
}

export interface BotSummary {
  name: string;
  category: BotCategory;
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
}
