export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface Summary {
  lastUpdated: string;
  totalBots: number;
  totalWebsites: number;
  botCategories: {
    searchEngine: number;
    seo: number;
    aiScraper: number;
    other: number;
  };
}
