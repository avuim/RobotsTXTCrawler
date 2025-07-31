import axios, { AxiosResponse } from 'axios';
import { Bot } from '../types/Bot.ts';
import { Website } from '../types/Website.ts';
import { Summary } from '../types/Common.ts';

const API_BASE_URL = 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const API = {
  // Summary endpoints
  getSummary: async (): Promise<Summary> => {
    const response = await apiClient.get<Summary>('/summary');
    return response.data;
  },

  // Bot endpoints
  getBots: async (): Promise<Bot[]> => {
    const response = await apiClient.get<Bot[]>('/bots');
    return response.data;
  },

  getBotByName: async (name: string): Promise<Bot> => {
    const response = await apiClient.get<Bot>(`/bots/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Website endpoints
  getWebsites: async (): Promise<Website[]> => {
    const response = await apiClient.get<Website[]>('/websites');
    return response.data;
  },

  getWebsiteByDomain: async (domain: string): Promise<Website> => {
    const response = await apiClient.get<Website>(`/websites/${encodeURIComponent(domain)}`);
    return response.data;
  },

};

export default API;
