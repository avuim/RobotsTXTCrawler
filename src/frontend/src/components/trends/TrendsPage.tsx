import React from 'react';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { API } from '../../services/api.ts';
import Loading from '../common/Loading.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

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

const MonthlyStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MonthRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
`;

const MonthLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const MonthStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: 0.9rem;
`;

const StatItem = styled.span<{ $type: 'bots' | 'websites' | 'allowed' | 'disallowed' }>`
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'allowed': return theme.colors.success;
      case 'disallowed': return theme.colors.danger;
      case 'bots': return theme.colors.primary;
      case 'websites': return theme.colors.secondary;
      default: return theme.colors.text;
    }
  }};
  font-weight: 500;
`;

const TrendsPage: React.FC = () => {
  const { data: trends, loading, error } = useApi(() => API.getTrends());

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

  if (!trends) {
    return (
      <Layout pageTitle="Trends">
        <ErrorMessage message="Keine Trend-Daten verfügbar" />
      </Layout>
    );
  }

  // Berechne Trend-Statistiken
  const monthlyData = trends.monthlyStats || {};
  const months = Object.keys(monthlyData).sort();
  
  const currentMonth = months[months.length - 1];
  const previousMonth = months[months.length - 2];
  
  const currentStats = monthlyData[currentMonth] || {};
  const previousStats = monthlyData[previousMonth] || {};

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const botChange = calculateChange(
    currentStats.totalBots || 0, 
    previousStats.totalBots || 0
  );
  
  const websiteChange = calculateChange(
    currentStats.totalWebsites || 0, 
    previousStats.totalWebsites || 0
  );

  const allowedChange = calculateChange(
    currentStats.allowedConnections || 0, 
    previousStats.allowedConnections || 0
  );

  return (
    <Layout pageTitle="Trends">
      <PageContainer>
        <Card>
          <SectionTitle>Aktuelle Trends</SectionTitle>
          <TrendGrid>
            <TrendCard>
              <TrendTitle>Anzahl Bots</TrendTitle>
              <TrendValue>{(currentStats.totalBots || 0).toLocaleString()}</TrendValue>
              <TrendChange $positive={botChange >= 0}>
                {botChange >= 0 ? '+' : ''}{botChange.toFixed(1)}% vs. Vormonat
              </TrendChange>
            </TrendCard>
            
            <TrendCard>
              <TrendTitle>Anzahl Websites</TrendTitle>
              <TrendValue>{(currentStats.totalWebsites || 0).toLocaleString()}</TrendValue>
              <TrendChange $positive={websiteChange >= 0}>
                {websiteChange >= 0 ? '+' : ''}{websiteChange.toFixed(1)}% vs. Vormonat
              </TrendChange>
            </TrendCard>
            
            <TrendCard>
              <TrendTitle>Erlaubte Verbindungen</TrendTitle>
              <TrendValue>{(currentStats.allowedConnections || 0).toLocaleString()}</TrendValue>
              <TrendChange $positive={allowedChange >= 0}>
                {allowedChange >= 0 ? '+' : ''}{allowedChange.toFixed(1)}% vs. Vormonat
              </TrendChange>
            </TrendCard>
            
            <TrendCard>
              <TrendTitle>Verbotene Verbindungen</TrendTitle>
              <TrendValue>{(currentStats.disallowedConnections || 0).toLocaleString()}</TrendValue>
              <TrendChange $positive={false}>
                {((currentStats.disallowedConnections || 0) / (currentStats.totalConnections || 1) * 100).toFixed(1)}% aller Verbindungen
              </TrendChange>
            </TrendCard>
          </TrendGrid>
        </Card>

        <Card>
          <SectionTitle>Monatliche Entwicklung</SectionTitle>
          <MonthlyStatsContainer>
            {months.reverse().map(month => {
              const stats = monthlyData[month];
              return (
                <MonthRow key={month}>
                  <MonthLabel>{month}</MonthLabel>
                  <MonthStats>
                    <StatItem $type="bots">
                      {(stats.totalBots || 0).toLocaleString()} Bots
                    </StatItem>
                    <StatItem $type="websites">
                      {(stats.totalWebsites || 0).toLocaleString()} Websites
                    </StatItem>
                    <StatItem $type="allowed">
                      {(stats.allowedConnections || 0).toLocaleString()} Erlaubt
                    </StatItem>
                    <StatItem $type="disallowed">
                      {(stats.disallowedConnections || 0).toLocaleString()} Verboten
                    </StatItem>
                  </MonthStats>
                </MonthRow>
              );
            })}
          </MonthlyStatsContainer>
        </Card>

        {trends.topGrowingBots && (
          <Card>
            <SectionTitle>Am schnellsten wachsende Bots</SectionTitle>
            <TrendGrid>
              {trends.topGrowingBots.slice(0, 6).map((bot: any, index: number) => (
                <TrendCard key={bot.name || index}>
                  <TrendTitle>{bot.name}</TrendTitle>
                  <TrendValue>+{bot.growth?.toFixed(1) || '0'}%</TrendValue>
                  <TrendChange $positive={true}>
                    {(bot.currentWebsites || 0).toLocaleString()} Websites
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
