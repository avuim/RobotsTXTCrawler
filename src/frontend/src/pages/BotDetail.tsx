import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { BotInfo, BotCategory } from '../types';
import { PieChart, BarChart } from '../components/charts';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const BotTitle = styled.div`
  flex: 1;
`;

const BotMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryBadge = styled.span<{ category: BotCategory }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${({ category, theme }) => theme.colors[category]};
  color: ${({ theme }) => theme.colors.white};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const BotDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BotInfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BotInfoTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BotInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const BotInfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const BotInfoLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.lightText};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const BotInfoValue = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
`;

const BotLink = styled.a`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ChartContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const WebsitesList = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const WebsitesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const WebsiteItem = styled.div<{ allowed: boolean }>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ allowed, theme }) => allowed ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
  border-left: 3px solid ${({ allowed, theme }) => allowed ? theme.colors.success : theme.colors.danger};
`;

const WebsiteLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
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

const BotDetail: React.FC = () => {
  const { botName } = useParams<{ botName: string }>();
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'websites'>('overview');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!botName) return;
      
      try {
        setLoading(true);
        const data = await apiService.getBot(botName);
        setBot(data);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Bot-Daten:', err);
        setError('Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [botName]);
  
  if (loading) {
    return <LoadingContainer>Lade Bot-Daten...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  if (!bot) {
    return <ErrorContainer>Bot nicht gefunden.</ErrorContainer>;
  }
  
  // Daten für das Websites-Diagramm (erlaubt vs. verboten)
  const latestMonth = Object.keys(bot.monthlyStats).sort().pop();
  const websiteChartData = latestMonth ? {
    labels: ['Erlaubt', 'Verboten'],
    datasets: [
      {
        data: [
          bot.monthlyStats[latestMonth].allowedWebsites,
          bot.monthlyStats[latestMonth].disallowedWebsites
        ],
        backgroundColor: [
          '#2ecc71',
          '#e74c3c'
        ]
      }
    ]
  } : null;
  
  // Daten für das monatliche Trend-Diagramm
  const trendChartData = {
    labels: Object.keys(bot.monthlyStats).sort(),
    datasets: [
      {
        label: 'Websites insgesamt',
        data: Object.keys(bot.monthlyStats).sort().map(month => bot.monthlyStats[month].totalWebsites),
        backgroundColor: '#3498db'
      },
      {
        label: 'Erlaubt',
        data: Object.keys(bot.monthlyStats).sort().map(month => bot.monthlyStats[month].allowedWebsites),
        backgroundColor: '#2ecc71'
      },
      {
        label: 'Verboten',
        data: Object.keys(bot.monthlyStats).sort().map(month => bot.monthlyStats[month].disallowedWebsites),
        backgroundColor: '#e74c3c'
      }
    ]
  };
  
  return (
    <PageContainer>
      <BackLink to="/bots">← Zurück zur Bot-Liste</BackLink>
      
      <BotHeader>
        <BotTitle>
          <h1>
            {bot.name}
            <CategoryBadge category={bot.category}>
              {bot.category === 'searchEngine' && 'Suchmaschine'}
              {bot.category === 'seo' && 'SEO-Tool'}
              {bot.category === 'aiScraper' && 'KI/LLM-Scraper'}
              {bot.category === 'other' && 'Andere'}
            </CategoryBadge>
          </h1>
        </BotTitle>
        
        <BotMeta>
          {bot.owner && (
            <div>Betreiber: <strong>{bot.owner}</strong></div>
          )}
          {bot.website && (
            <div>Website: <BotLink href={bot.website} target="_blank" rel="noopener noreferrer">{bot.website}</BotLink></div>
          )}
        </BotMeta>
      </BotHeader>
      
      {bot.description && (
        <BotDescription>{bot.description}</BotDescription>
      )}
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            Übersicht
          </TabButton>
          <TabButton 
            active={activeTab === 'websites'} 
            onClick={() => setActiveTab('websites')}
          >
            Websites
          </TabButton>
        </TabButtons>
        
        <TabContent>
          {activeTab === 'overview' ? (
            <>
              <BotInfoCard>
                <BotInfoTitle>Statistiken</BotInfoTitle>
                <BotInfoGrid>
                  <BotInfoItem>
                    <BotInfoLabel>Websites insgesamt</BotInfoLabel>
                    <BotInfoValue>
                      {latestMonth ? bot.monthlyStats[latestMonth].totalWebsites : 0}
                    </BotInfoValue>
                  </BotInfoItem>
                  <BotInfoItem>
                    <BotInfoLabel>Erlaubte Websites</BotInfoLabel>
                    <BotInfoValue>
                      {latestMonth ? bot.monthlyStats[latestMonth].allowedWebsites : 0}
                    </BotInfoValue>
                  </BotInfoItem>
                  <BotInfoItem>
                    <BotInfoLabel>Verbotene Websites</BotInfoLabel>
                    <BotInfoValue>
                      {latestMonth ? bot.monthlyStats[latestMonth].disallowedWebsites : 0}
                    </BotInfoValue>
                  </BotInfoItem>
                </BotInfoGrid>
              </BotInfoCard>
              
              {websiteChartData && (
                <ChartContainer>
                  <ChartTitle>Erlaubte vs. verbotene Websites</ChartTitle>
                  <PieChart data={websiteChartData} />
                </ChartContainer>
              )}
              
              {Object.keys(bot.monthlyStats).length > 1 && (
                <ChartContainer>
                  <ChartTitle>Monatlicher Trend</ChartTitle>
                  <BarChart data={trendChartData} />
                </ChartContainer>
              )}
            </>
          ) : (
            <>
              {latestMonth && (
                <>
                  <WebsitesList>
                    <BotInfoTitle>Erlaubte Websites ({bot.monthlyStats[latestMonth].websites.allowed.length})</BotInfoTitle>
                    <WebsitesGrid>
                      {bot.monthlyStats[latestMonth].websites.allowed.map(domain => (
                        <WebsiteItem key={domain} allowed={true}>
                          <WebsiteLink to={`/websites/${encodeURIComponent(domain)}`}>
                            {domain}
                          </WebsiteLink>
                        </WebsiteItem>
                      ))}
                    </WebsitesGrid>
                  </WebsitesList>
                  
                  <WebsitesList>
                    <BotInfoTitle>Verbotene Websites ({bot.monthlyStats[latestMonth].websites.disallowed.length})</BotInfoTitle>
                    <WebsitesGrid>
                      {bot.monthlyStats[latestMonth].websites.disallowed.map(domain => (
                        <WebsiteItem key={domain} allowed={false}>
                          <WebsiteLink to={`/websites/${encodeURIComponent(domain)}`}>
                            {domain}
                          </WebsiteLink>
                        </WebsiteItem>
                      ))}
                    </WebsitesGrid>
                  </WebsitesList>
                </>
              )}
            </>
          )}
        </TabContent>
      </TabContainer>
    </PageContainer>
  );
};

export default BotDetail;
