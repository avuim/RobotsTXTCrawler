import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { WebsiteAnalysis, BotCategory } from '../types';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const WebsiteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const WebsiteTitle = styled.div`
  flex: 1;
`;

const WebsiteMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const WebsiteInfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const WebsiteInfoTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BotsList = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BotItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const BotName = styled(Link)`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const BotStatus = styled.div<{ allowed: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ allowed, theme }) => allowed ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
  color: ${({ allowed, theme }) => allowed ? theme.colors.success : theme.colors.danger};
  font-size: 0.9rem;
  font-weight: 500;
`;

const CategoryBadge = styled.span<{ category: BotCategory }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${({ category, theme }) => theme.colors[category]};
  color: ${({ theme }) => theme.colors.white};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const TabContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: transparent;
  border: none;
  border-bottom: 3px solid ${({ active, theme }) => active ? theme.colors.secondary : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.secondary : theme.colors.text};
  font-weight: ${({ active }) => active ? '500' : '400'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const TabContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md} 0;
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

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    text-decoration: underline;
  }
`;

const WebsiteDetail: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const [website, setWebsite] = useState<WebsiteAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'allowed' | 'disallowed' | 'all'>('all');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!domain) return;
      
      try {
        setLoading(true);
        const data = await apiService.getWebsite(domain);
        setWebsite(data);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Website-Daten:', err);
        setError('Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [domain]);
  
  if (loading) {
    return <LoadingContainer>Lade Website-Daten...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  if (!website) {
    return <ErrorContainer>Website nicht gefunden.</ErrorContainer>;
  }
  
  // Filtern der Bots basierend auf dem aktiven Tab
  const filteredBots = website.bots.filter(bot => {
    if (activeTab === 'all') return true;
    if (activeTab === 'allowed') return bot.allowed;
    if (activeTab === 'disallowed') return !bot.allowed;
    return true;
  });
  
  // Zählen der erlaubten und verbotenen Bots
  const allowedCount = website.bots.filter(bot => bot.allowed).length;
  const disallowedCount = website.bots.filter(bot => !bot.allowed).length;
  
  return (
    <PageContainer>
      <BackLink to="/websites">← Zurück zur Website-Liste</BackLink>
      
      <WebsiteHeader>
        <WebsiteTitle>
          <h1>{website.domain}</h1>
        </WebsiteTitle>
        
        <WebsiteMeta>
          <div>Normalisierte Domain: <strong>{website.normalizedDomain}</strong></div>
        </WebsiteMeta>
      </WebsiteHeader>
      
      <WebsiteInfoCard>
        <WebsiteInfoTitle>Statistiken</WebsiteInfoTitle>
        <div>
          <p>Anzahl der Bots: <strong>{website.bots.length}</strong></p>
          <p>Erlaubte Bots: <strong>{allowedCount}</strong></p>
          <p>Verbotene Bots: <strong>{disallowedCount}</strong></p>
        </div>
      </WebsiteInfoCard>
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            Alle Bots ({website.bots.length})
          </TabButton>
          <TabButton 
            active={activeTab === 'allowed'} 
            onClick={() => setActiveTab('allowed')}
          >
            Erlaubt ({allowedCount})
          </TabButton>
          <TabButton 
            active={activeTab === 'disallowed'} 
            onClick={() => setActiveTab('disallowed')}
          >
            Verboten ({disallowedCount})
          </TabButton>
        </TabButtons>
        
        <TabContent>
          <BotsList>
            {filteredBots.length === 0 ? (
              <p>Keine Bots in dieser Kategorie.</p>
            ) : (
              filteredBots.map(bot => (
                <BotItem key={bot.name}>
                  <BotName to={`/bots/${encodeURIComponent(bot.name)}`}>
                    {bot.name}
                  </BotName>
                  <BotStatus allowed={bot.allowed}>
                    {bot.allowed ? 'Erlaubt' : 'Verboten'}
                  </BotStatus>
                </BotItem>
              ))
            )}
          </BotsList>
        </TabContent>
      </TabContainer>
    </PageContainer>
  );
};

export default WebsiteDetail;
