import axios from 'axios';
import { BotStatistics, WebsiteAnalysis, TrendsData, Summary, BotInfo } from '../types';

// Basis-URL für die API
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Axios-Instance mit Basis-URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API-Service
export const apiService = {
  // Zusammenfassung abrufen
  getSummary: async (): Promise<Summary> => {
    const response = await api.get<Summary>('/summary');
    return response.data;
  },
  
  // Alle Bots abrufen
  getAllBots: async (): Promise<BotStatistics> => {
    const response = await api.get<BotStatistics>('/bots');
    return response.data;
  },
  
  // Einzelnen Bot abrufen
  getBot: async (botName: string): Promise<BotInfo> => {
    const response = await api.get<BotInfo>(`/bots/${encodeURIComponent(botName)}`);
    return response.data;
  },
  
  // Alle Websites abrufen
  getAllWebsites: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/websites');
    return response.data;
  },
  
  // Einzelne Website abrufen
  getWebsite: async (domain: string): Promise<WebsiteAnalysis> => {
    const response = await api.get<WebsiteAnalysis>(`/websites/${encodeURIComponent(domain)}`);
    return response.data;
  },
  
  // Trends abrufen
  getTrends: async (): Promise<TrendsData> => {
    const response = await api.get<TrendsData>('/trends');
    return response.data;
  },
  
  // Nach Bots suchen
  searchBots: async (query: string): Promise<BotInfo[]> => {
    const response = await api.get<BotInfo[]>(`/search/bots?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  // Nach Websites suchen
  searchWebsites: async (query: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/search/websites?q=${encodeURIComponent(query)}`);
    return response.data;
  }
};
