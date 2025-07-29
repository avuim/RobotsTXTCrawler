import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { BotStatistics, BotInfo, BotCategory } from '../types';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const SearchContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SearchButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 1rem;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ active, theme }) => active ? theme.colors.secondary : theme.colors.white};
  color: ${({ active, theme }) => active ? theme.colors.white : theme.colors.text};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.secondary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ active, theme }) => active ? theme.colors.secondary : theme.colors.background};
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const BotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BotCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  transition: transform ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const BotName = styled(Link)`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const BotDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.lightText};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-grow: 1;
`;

const BotMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const BotStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const BotStat = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ color, theme }) => color || theme.colors.text};
  font-size: 0.9rem;
`;

const CategoryBadge = styled.span<{ category: BotCategory }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ category, theme }) => theme.colors[category]};
  color: ${({ theme }) => theme.colors.white};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.lightText};
`;

const ErrorContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NoResultsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BotList: React.FC = () => {
  const [botData, setBotData] = useState<BotStatistics | null>(null);
  const [filteredBots, setFilteredBots] = useState<BotInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<BotCategory | 'all'>('all');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllBots();
        setBotData(data);
        
        // Alle Bots in ein Array umwandeln
        const botsArray = Object.entries(data.bots).map(([name, bot]) => ({
          ...bot,
          name
        }));
        
        setFilteredBots(botsArray);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Bot-Daten:', err);
        setError('Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtern der Bots basierend auf Suchbegriff und Kategorie
  useEffect(() => {
    if (!botData) return;
    
    let result = Object.entries(botData.bots).map(([name, bot]) => ({
      ...bot,
      name
    }));
    
    // Nach Suchbegriff filtern
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(bot => 
        bot.name.toLowerCase().includes(query) || 
        (bot.description && bot.description.toLowerCase().includes(query))
      );
    }
    
    // Nach Kategorie filtern
    if (activeFilter !== 'all') {
      result = result.filter(bot => bot.category === activeFilter);
    }
    
    setFilteredBots(result);
  }, [searchQuery, activeFilter, botData]);
  
  const handleSearch = () => {
    // Die Suche wird bereits durch den useEffect-Hook oben durchgeführt
    // Dieser Handler ist für zukünftige Erweiterungen
  };
  
  const handleFilterClick = (filter: BotCategory | 'all') => {
    setActiveFilter(filter);
  };
  
  if (loading) {
    return <LoadingContainer>Lade Bots...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  if (!botData) {
    return <ErrorContainer>Keine Daten verfügbar.</ErrorContainer>;
  }
  
  return (
    <PageContainer>
      <h1>Alle Bots</h1>
      
      <SearchContainer>
        <SearchInput 
          type="text" 
          placeholder="Bot-Namen oder Beschreibung suchen..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <SearchButton onClick={handleSearch}>Suchen</SearchButton>
      </SearchContainer>
      
      <FilterContainer>
        <FilterButton 
          active={activeFilter === 'all'} 
          onClick={() => handleFilterClick('all')}
        >
          Alle
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'searchEngine'} 
          onClick={() => handleFilterClick('searchEngine')}
        >
          Suchmaschinen
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'seo'} 
          onClick={() => handleFilterClick('seo')}
        >
          SEO-Tools
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'aiScraper'} 
          onClick={() => handleFilterClick('aiScraper')}
        >
          KI/LLM-Scraper
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'other'} 
          onClick={() => handleFilterClick('other')}
        >
          Andere
        </FilterButton>
      </FilterContainer>
      
      {filteredBots.length === 0 ? (
        <NoResultsContainer>
          Keine Bots gefunden, die Ihren Suchkriterien entsprechen.
        </NoResultsContainer>
      ) : (
        <BotGrid>
          {filteredBots.map(bot => (
            <BotCard key={bot.name}>
              <BotName to={`/bots/${encodeURIComponent(bot.name)}`}>
                {bot.name}
              </BotName>
              
              <CategoryBadge category={bot.category}>
                {bot.category === 'searchEngine' && 'Suchmaschine'}
                {bot.category === 'seo' && 'SEO-Tool'}
                {bot.category === 'aiScraper' && 'KI/LLM-Scraper'}
                {bot.category === 'other' && 'Andere'}
              </CategoryBadge>
              
              <BotDescription>
                {bot.description || 'Keine Beschreibung verfügbar.'}
              </BotDescription>
              
              <BotMeta>
                {bot.owner && <div>Betreiber: {bot.owner}</div>}
                
                <BotStats>
                  {Object.keys(bot.monthlyStats).length > 0 && (
                    <>
                      <BotStat>
                        <span>{Object.values(bot.monthlyStats)[0].totalWebsites} Websites</span>
                      </BotStat>
                      <BotStat color="#2ecc71">
                        <span>{Object.values(bot.monthlyStats)[0].allowedWebsites} erlaubt</span>
                      </BotStat>
                      <BotStat color="#e74c3c">
                        <span>{Object.values(bot.monthlyStats)[0].disallowedWebsites} verboten</span>
                      </BotStat>
                    </>
                  )}
                </BotStats>
              </BotMeta>
            </BotCard>
          ))}
        </BotGrid>
      )}
    </PageContainer>
  );
};

export default BotList;
