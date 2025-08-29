import axios, { AxiosResponse } from 'axios';
import { Bot } from '../types/Bot.ts';
import { Website } from '../types/Website.ts';
import { Summary } from '../types/Common.ts';

// Bestimme ob statische API oder Live-API verwendet werden soll
// Statischer Modus nur für GitHub Pages oder wenn explizit auf "static" gesetzt
const isGitHubPages = window.location.hostname === 'avuim.github.io';
const isExplicitStatic = process.env.REACT_APP_API_MODE === 'static';

const isStaticMode = isGitHubPages || isExplicitStatic;
const API_BASE_URL = isStaticMode ? '/RobotsTXTCrawler/api' : 'http://localhost:3001/api';

console.log('🔍 DEBUG API Configuration:');
console.log('  - window.location.hostname:', window.location.hostname);
console.log('  - isGitHubPages:', isGitHubPages);
console.log('  - process.env.REACT_APP_API_MODE:', process.env.REACT_APP_API_MODE);
console.log('  - isExplicitStatic:', isExplicitStatic);
console.log('  - isStaticMode:', isStaticMode);
console.log('  - API_BASE_URL:', API_BASE_URL);
console.log('API Mode:', isStaticMode ? 'Static (GitHub Pages)' : 'Live (Local Development)');
console.log('API Base URL:', API_BASE_URL);
console.log('Environment API Base URL:', process.env.REACT_APP_API_BASE_URL);

const apiClient = !isStaticMode ? axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}) : null;

// Response interceptor for error handling (nur für Live-API)
if (apiClient) {
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
}

// Hilfsfunktion für statische API-Calls
const fetchStaticData = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching static data from ${endpoint}:`, error);
    throw error;
  }
};

export const API = {
  // Summary endpoints
  getSummary: async (): Promise<Summary> => {
    if (isStaticMode) {
      return await fetchStaticData('/analysis/summary');
    }
    const response = await apiClient!.get<Summary>('/summary');
    return response.data;
  },

  // Bot endpoints
  getBots: async (): Promise<Bot[]> => {
    if (isStaticMode) {
      const botStats = await fetchStaticData('/bot-statistics');
      
      // Transformiere die Bots in das erwartete Format
      const botList = Object.entries(botStats.bots).map(([name, botInfo]: [string, any]) => {
        // Verwende nur den aktuellsten Monat (wie in der Live-API)
        const latestMonth = Object.keys(botInfo.monthlyStats).sort().pop();
        const currentStats = latestMonth ? botInfo.monthlyStats[latestMonth] : null;
        
        const totalWebsites = currentStats ? currentStats.totalWebsites : 0;
        const allowedWebsites = currentStats ? currentStats.allowedWebsites : 0;
        const disallowedWebsites = currentStats ? currentStats.disallowedWebsites : 0;
        
        return {
          name,
          category: botInfo.category,
          owner: botInfo.owner,
          description: botInfo.description,
          website: botInfo.website,
          totalWebsites,
          allowedWebsites,
          disallowedWebsites,
          monthlyStats: botInfo.monthlyStats
        };
      });
      
      return botList;
    }
    const response = await apiClient!.get<Bot[]>('/bots');
    return response.data;
  },

  getBotByName: async (name: string): Promise<Bot> => {
    if (isStaticMode) {
      const botStats = await fetchStaticData('/bot-statistics');
      
      if (botStats.bots && botStats.bots[name]) {
        const botData = botStats.bots[name];
        
        // Lade Bot-Kategorien-Informationen
        try {
          const categories = await fetchStaticData('/analysis/bot-categories');
          
          let botDetails = null;
          for (const categoryData of Object.values(categories.categories)) {
            const categoryBots = (categoryData as any).bots;
            if (categoryBots && categoryBots[name]) {
              botDetails = categoryBots[name];
              break;
            }
          }
          
          return {
            ...botData,
            details: botDetails
          };
        } catch (err) {
          console.warn('Fehler beim Laden der Bot-Kategorien:', err);
          return botData;
        }
      } else {
        throw new Error(`Bot "${name}" nicht gefunden`);
      }
    }
    const response = await apiClient!.get<Bot>(`/bots/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Website endpoints
  getWebsites: async (): Promise<Website[]> => {
    if (isStaticMode) {
      try {
        // Verwende die von GitHub Actions erstellte websites-list.json
        const websitesList = await fetchStaticData('/websites-list');
        
        // Die Datei enthält bereits die korrekten Statistiken
        return websitesList.map((item: any) => ({
          domain: item.domain,
          totalBots: item.totalBots || 0,
          allowedBots: item.allowedBots || 0,
          disallowedBots: item.disallowedBots || 0
        }));
      } catch (error) {
        console.error('Error loading websites-list.json:', error);
        // Fallback: Leere Liste
        return [];
      }
    }
    const response = await apiClient!.get<Website[]>('/websites');
    return response.data;
  },

  getWebsiteByDomain: async (domain: string): Promise<Website> => {
    if (isStaticMode) {
      try {
        // Direkter fetch ohne .json Anhang, da die Datei bereits .json heißt
        const response = await fetch(`${API_BASE_URL}/analysis/websites/${domain}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transformiere die Daten in das erwartete Format (mit neuer und Legacy-Struktur)
        const transformedData = {
          domain: data.domain || domain,
          robotsTxt: data.robotsTxt || '',
          
          // Neue Datenstruktur
          globalRules: data.globalRules,
          specificBots: data.specificBots,
          stats: data.stats,
          
          // Legacy-Format für Rückwärtskompatibilität
          totalBots: data.bots ? data.bots.length : 0,
          allowedBots: data.bots ? data.bots.filter((bot: any) => bot.allowed === true).length : 0,
          disallowedBots: data.bots ? data.bots.filter((bot: any) => bot.allowed === false).length : 0,
          bots: data.bots || [],
          paths: data.paths
        };
        
        return transformedData;
      } catch (error) {
        console.error(`Error fetching website data for ${domain}:`, error);
        throw error;
      }
    }
    const response = await apiClient!.get<Website>(`/websites/${encodeURIComponent(domain)}`);
    
    // Debug: Log the received data
    console.log('🔍 Frontend API received data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  },

  // Zusätzliche Funktionen für statische API
  getTrends: async () => {
    if (isStaticMode) {
      return await fetchStaticData('/analysis/trends/monthly-trends');
    }
    const response = await apiClient!.get('/trends');
    return response.data;
  },

  searchBots: async (query: string): Promise<Bot[]> => {
    if (isStaticMode) {
      const bots = await API.getBots();
      return bots.filter(bot => 
        bot.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    const response = await apiClient!.get('/search/bots', { params: { q: query } });
    return response.data;
  },

  searchWebsites: async (query: string): Promise<Website[]> => {
    if (isStaticMode) {
      const websites = await API.getWebsites();
      return websites.filter((website: any) => 
        website.domain.toLowerCase().includes(query.toLowerCase())
      );
    }
    const response = await apiClient!.get('/search/websites', { params: { q: query } });
    return response.data;
  },

};

export default API;
