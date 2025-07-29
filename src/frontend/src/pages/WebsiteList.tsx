import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

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

const WebsiteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const WebsiteCard = styled.div`
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

const WebsiteName = styled(Link)`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  word-break: break-all;
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const WebsiteStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const WebsiteStat = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.lightText};
`;

const StatValue = styled.span`
  font-weight: 500;
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

const WebsiteList: React.FC = () => {
  const [websites, setWebsites] = useState<string[]>([]);
  const [filteredWebsites, setFilteredWebsites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAllWebsites();
        setWebsites(data);
        setFilteredWebsites(data);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Website-Daten:', err);
        setError('Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filtern der Websites basierend auf Suchbegriff
  useEffect(() => {
    if (!websites.length) return;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = websites.filter(domain => 
        domain.toLowerCase().includes(query)
      );
      setFilteredWebsites(filtered);
    } else {
      setFilteredWebsites(websites);
    }
  }, [searchQuery, websites]);
  
  const handleSearch = () => {
    // Die Suche wird bereits durch den useEffect-Hook oben durchgeführt
    // Dieser Handler ist für zukünftige Erweiterungen
  };
  
  if (loading) {
    return <LoadingContainer>Lade Websites...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  return (
    <PageContainer>
      <h1>Alle Websites</h1>
      
      <SearchContainer>
        <SearchInput 
          type="text" 
          placeholder="Website-Domain suchen..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <SearchButton onClick={handleSearch}>Suchen</SearchButton>
      </SearchContainer>
      
      {filteredWebsites.length === 0 ? (
        <NoResultsContainer>
          Keine Websites gefunden, die Ihren Suchkriterien entsprechen.
        </NoResultsContainer>
      ) : (
        <WebsiteGrid>
          {filteredWebsites.map(domain => (
            <WebsiteCard key={domain}>
              <WebsiteName to={`/websites/${encodeURIComponent(domain)}`}>
                {domain}
              </WebsiteName>
              
              <WebsiteStats>
                <WebsiteStat>
                  <StatLabel>Domain:</StatLabel>
                  <StatValue>{domain}</StatValue>
                </WebsiteStat>
                {/* Weitere Statistiken könnten hier angezeigt werden, wenn sie verfügbar sind */}
              </WebsiteStats>
            </WebsiteCard>
          ))}
        </WebsiteGrid>
      )}
    </PageContainer>
  );
};

export default WebsiteList;
