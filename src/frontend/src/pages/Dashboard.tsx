import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Summary } from '../types';
import { PieChart } from '../components/charts';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.lightText};
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

const TopBotsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TopBotsTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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

const ViewAllLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.secondary};
  
  &:hover {
    text-decoration: underline;
  }
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

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSummary();
        setSummary(data);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Dashboard-Daten:', err);
        setError('Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <LoadingContainer>Lade Dashboard-Daten...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  if (!summary) {
    return <ErrorContainer>Keine Daten verfügbar.</ErrorContainer>;
  }
  
  // Daten für das Bot-Kategorien-Diagramm
  const categoryChartData = {
    labels: ['Suchmaschinen', 'SEO-Tools', 'KI/LLM-Scraper', 'Andere'],
    datasets: [
      {
        data: [
          summary.botCategories.searchEngine,
          summary.botCategories.seo,
          summary.botCategories.aiScraper,
          summary.botCategories.other
        ],
        backgroundColor: [
          '#3498db',
          '#2ecc71',
          '#e74c3c',
          '#f39c12'
        ]
      }
    ]
  };
  
  return (
    <PageContainer>
      <h1>Dashboard</h1>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{summary.totalBots}</StatValue>
          <StatLabel>Bots insgesamt</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{summary.totalWebsites}</StatValue>
          <StatLabel>Websites insgesamt</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <ChartContainer>
        <ChartTitle>Bot-Kategorien</ChartTitle>
        <PieChart data={categoryChartData} />
      </ChartContainer>
      
      <TopBotsContainer>
        <TopBotsTitle>Top Bots</TopBotsTitle>
        {summary.topBots.map(bot => (
          <BotItem key={bot.name}>
            <BotName to={`/bots/${encodeURIComponent(bot.name)}`}>
              {bot.name}
            </BotName>
            <BotStats>
              <BotStat>
                <span>{bot.totalWebsites} Websites</span>
              </BotStat>
              <BotStat color="#2ecc71">
                <span>{bot.allowedWebsites} erlaubt</span>
              </BotStat>
              <BotStat color="#e74c3c">
                <span>{bot.disallowedWebsites} verboten</span>
              </BotStat>
            </BotStats>
          </BotItem>
        ))}
        <ViewAllLink to="/bots">Alle Bots anzeigen</ViewAllLink>
      </TopBotsContainer>
    </PageContainer>
  );
};

export default Dashboard;
