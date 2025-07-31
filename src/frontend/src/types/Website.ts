export interface Website {
  domain: string;
  robotsTxt: string;
  lastUpdated: string;
  totalBots: number;
  allowedBots: number;
  disallowedBots: number;
  bots: {
    allowed: string[];
    disallowed: string[];
  };
  paths: {
    allowed: string[];
    disallowed: string[];
  };
}

export interface WebsiteSummary {
  domain: string;
  totalBots: number;
  allowedBots: number;
  disallowedBots: number;
  lastUpdated: string;
}
