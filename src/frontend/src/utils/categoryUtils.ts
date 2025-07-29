/**
 * Hilfsfunktionen für die Arbeit mit Bot-Kategorien
 */

// Mapping von Kategorie-IDs zu benutzerfreundlichen Namen
export const categoryNames: Record<string, string> = {
  searchEngine: 'Suchmaschine',
  seo: 'SEO-Tool',
  aiScraper: 'KI/LLM-Scraper',
  other: 'Andere'
};

/**
 * Gibt den benutzerfreundlichen Namen einer Kategorie zurück
 * @param categoryId Die Kategorie-ID
 * @returns Der benutzerfreundliche Name der Kategorie
 */
export const getCategoryName = (categoryId: string): string => {
  return categoryNames[categoryId] || categoryId;
};

/**
 * Gibt eine Farbe für eine Kategorie zurück
 * @param categoryId Die Kategorie-ID
 * @returns Die Farbe für die Kategorie
 */
export const getCategoryColor = (categoryId: string): string => {
  const colors: Record<string, string> = {
    searchEngine: '#3498db',
    seo: '#2ecc71',
    aiScraper: '#e74c3c',
    other: '#f39c12'
  };
  
  return colors[categoryId] || '#95a5a6';
};

/**
 * Gibt alle bekannten Kategorie-IDs zurück
 * @returns Ein Array mit allen bekannten Kategorie-IDs
 */
export const getAllCategoryIds = (): string[] => {
  return Object.keys(categoryNames);
};
