// Interface für die Authentifizierungsdaten (wird in diesem Projekt ignoriert)
export interface WebsiteAuth {
  loginUrl: string;
  loginButton: string;
  user: string;
  password: string;
  userField: string;
  passwordField: string;
  sitesToVisit: string[];
  wordsToClick?: string[];
}

// Interface für die Website-Daten aus der websites.json
export interface Website {
  site: string;
  textSettingsSaveConfirm?: string[];
  auth?: WebsiteAuth;
  sitesToVisit?: string[];
}

// Interface für die normalisierte Website-Daten
export interface NormalizedWebsite {
  domain: string;
  normalizedDomain: string;
  originalSite: string;
  robotsTxtUrl: string;
}

// Funktion zur Normalisierung einer Website
export function normalizeWebsite(website: Website): NormalizedWebsite {
  const originalSite = website.site;
  
  // Domain extrahieren (ohne Protokoll)
  let domain = originalSite;
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    domain = domain.split('//')[1];
  }
  
  // Pfad entfernen, falls vorhanden
  if (domain.includes('/')) {
    domain = domain.split('/')[0];
  }
  
  // Normalisierte Domain (für Dateinamen)
  const normalizedDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '-');
  
  // Robots.txt URL erstellen
  const robotsTxtUrl = `https://${domain}/robots.txt`;
  
  return {
    domain,
    normalizedDomain,
    originalSite,
    robotsTxtUrl
  };
}
