import React from 'react';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { API } from '../../services/api.ts';
import Loading from '../common/Loading.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';
import MonthlyStatsChart from '../common/MonthlyStatsChart.tsx';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
`;

const TrendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const TrendCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TrendTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-weight: 600;
`;

const TrendValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TrendChange = styled.div<{ $positive: boolean }>`
  font-size: 0.9rem;
  color: ${({ theme, $positive }) => 
    $positive ? theme.colors.success : theme.colors.danger};
  font-weight: 500;
`;


const TrendsPage: React.FC = () => {
  const { data: trendsArray, loading, error } = useApi(() => API.getTrends());

  if (loading) {
    return (
      <Layout pageTitle="Trends">
        <Loading message="Lade Trend-Daten..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Trends">
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!trendsArray || !Array.isArray(trendsArray) || trendsArray.length === 0) {
    return (
      <Layout pageTitle="Trends">
        <ErrorMessage message="Keine Trend-Daten verfügbar" />
      </Layout>
    );
  }

  // Berechne Trend-Statistiken aus dem Array
  const currentMonth = trendsArray[trendsArray.length - 1];
  const previousMonth = trendsArray.length > 1 ? trendsArray[trendsArray.length - 2] : null;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const botChange = previousMonth ? calculateChange(
    currentMonth.totalBots || 0, 
    previousMonth.totalBots || 0
  ) : 0;
  
  const websiteChange = previousMonth ? calculateChange(
    currentMonth.totalWebsites || 0, 
    previousMonth.totalWebsites || 0
  ) : 0;

  // Berechne Verbindungsstatistiken aus topBots
  const currentAllowed = currentMonth.topBots?.reduce((sum, bot) => sum + (bot.allowed || 0), 0) || 0;
  const currentDisallowed = currentMonth.topBots?.reduce((sum, bot) => sum + (bot.disallowed || 0), 0) || 0;
  const previousAllowed = previousMonth?.topBots?.reduce((sum, bot) => sum + (bot.allowed || 0), 0) || 0;

  const allowedChange = previousMonth ? calculateChange(currentAllowed, previousAllowed) : 0;

  // Transformiere Daten für MonthlyStatsChart
  const monthlyStatsForChart = trendsArray.reduce((acc, monthData) => {
    const monthAllowed = monthData.topBots?.reduce((sum, bot) => sum + (bot.allowed || 0), 0) || 0;
    const monthDisallowed = monthData.topBots?.reduce((sum, bot) => sum + (bot.disallowed || 0), 0) || 0;
    
    acc[monthData.month] = {
      totalWebsites: monthData.totalWebsites || 0,
      allowedWebsites: monthAllowed,
      disallowedWebsites: monthDisallowed,
      totalBots: monthData.totalBots || 0,
      websites: {
        allowed: [],
        disallowed: []
      }
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <Layout pageTitle="Trends">
      <PageContainer>
        <Card>
          <SectionTitle>Aktuelle Trends</SectionTitle>
          <TrendGrid>
            <TrendCard>
              <TrendTitle>Anzahl Websites</TrendTitle>
              <TrendValue>{(currentMonth.totalWebsites || 0).toLocaleString()}</TrendValue>
              <TrendChange $positive={websiteChange >= 0}>
                {previousMonth ? `${websiteChange >= 0 ? '+' : ''}${websiteChange.toFixed(1)}% vs. Vormonat` : 'Keine Vergleichsdaten'}
              </TrendChange>
            </TrendCard>
            
            <TrendCard>
              <TrendTitle>Anzahl Bots</TrendTitle>
              <TrendValue>{(currentMonth.totalBots || 0).toLocaleString()}</TrendValue>
              <TrendChange $positive={botChange >= 0}>
                {previousMonth ? `${botChange >= 0 ? '+' : ''}${botChange.toFixed(1)}% vs. Vormonat` : 'Keine Vergleichsdaten'}
              </TrendChange>
            </TrendCard>
            
            <TrendCard>
              <TrendTitle>Erlaubte Bots</TrendTitle>
              <TrendValue>{currentAllowed.toLocaleString()}</TrendValue>
              <TrendChange $positive={allowedChange >= 0}>
                {previousMonth ? `${allowedChange >= 0 ? '+' : ''}${allowedChange.toFixed(1)}% vs. Vormonat` : 'Keine Vergleichsdaten'}
              </TrendChange>
            </TrendCard>
            
            <TrendCard>
              <TrendTitle>Verbotene Bots</TrendTitle>
              <TrendValue>{currentDisallowed.toLocaleString()}</TrendValue>
              <TrendChange $positive={false}>
                {((currentDisallowed / (currentAllowed + currentDisallowed || 1)) * 100).toFixed(1)}% aller Bots
              </TrendChange>
            </TrendCard>
          </TrendGrid>
        </Card>

        <Card>
          <MonthlyStatsChart monthlyStats={monthlyStatsForChart} />
        </Card>

        {currentMonth.topBots && (
          <Card>
            <SectionTitle>Top Bots (aktueller Monat)</SectionTitle>
            <TrendGrid>
              {currentMonth.topBots.slice(0, 6).map((bot, index) => (
                <TrendCard key={bot.name || index}>
                  <TrendTitle>{bot.name}</TrendTitle>
                  <TrendValue>{bot.websites.toLocaleString()}</TrendValue>
                  <TrendChange $positive={bot.allowed > bot.disallowed}>
                    {bot.allowed} erlaubt, {bot.disallowed} verboten
                  </TrendChange>
                </TrendCard>
              ))}
            </TrendGrid>
          </Card>
        )}
      </PageContainer>
    </Layout>
  );
};

export default TrendsPage;
