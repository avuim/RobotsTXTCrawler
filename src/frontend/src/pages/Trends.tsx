import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiService } from '../services/api';
import { TrendsData } from '../types';
import { BarChart } from '../components/charts';
import { getCategoryName, getCategoryColor, getAllCategoryIds } from '../utils/categoryUtils';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
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

const InfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const InfoText = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Trends: React.FC = () => {
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bots' | 'categories' | 'websites'>('bots');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTrends();
        setTrendsData(data);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Trend-Daten:', err);
        setError('Die Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return <LoadingContainer>Lade Trend-Daten...</LoadingContainer>;
  }
  
  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }
  
  if (!trendsData) {
    return <ErrorContainer>Keine Daten verfügbar.</ErrorContainer>;
  }
  
  // Daten für das Bot-Trend-Diagramm
  const botTrendChartData = {
    labels: trendsData.months,
    datasets: [
      {
        label: 'Bots insgesamt',
        data: trendsData.botTrends.totalBots,
        backgroundColor: '#3498db'
      }
    ]
  };
  
  // Daten für das Kategorie-Trend-Diagramm
  const categoryTrendChartData = {
    labels: trendsData.months,
    datasets: Object.keys(trendsData.categoryTrends).map(categoryId => ({
      label: getCategoryName(categoryId),
      data: trendsData.categoryTrends[categoryId],
      backgroundColor: getCategoryColor(categoryId)
    }))
  };
  
  // Daten für das Website-Trend-Diagramm
  const websiteTrendChartData = {
    labels: trendsData.months,
    datasets: [
      {
        label: 'Websites insgesamt',
        data: trendsData.websiteTrends.totalWebsites,
        backgroundColor: '#3498db'
      }
    ]
  };
  
  return (
    <PageContainer>
      <h1>Trends und Entwicklungen</h1>
      
      <InfoCard>
        <InfoTitle>Über die Trends</InfoTitle>
        <InfoText>
          Diese Seite zeigt die Entwicklung der Bots, Kategorien und Websites über die Zeit.
          Die Daten werden monatlich aktualisiert und basieren auf den Crawling-Ergebnissen.
        </InfoText>
      </InfoCard>
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'bots'} 
            onClick={() => setActiveTab('bots')}
          >
            Bot-Trends
          </TabButton>
          <TabButton 
            active={activeTab === 'categories'} 
            onClick={() => setActiveTab('categories')}
          >
            Kategorie-Trends
          </TabButton>
          <TabButton 
            active={activeTab === 'websites'} 
            onClick={() => setActiveTab('websites')}
          >
            Website-Trends
          </TabButton>
        </TabButtons>
        
        <TabContent>
          {activeTab === 'bots' && (
            <ChartContainer>
              <ChartTitle>Entwicklung der Bot-Anzahl über die Zeit</ChartTitle>
              <BarChart data={botTrendChartData} />
            </ChartContainer>
          )}
          
          {activeTab === 'categories' && (
            <ChartContainer>
              <ChartTitle>Entwicklung der Bot-Kategorien über die Zeit</ChartTitle>
              <BarChart data={categoryTrendChartData} />
            </ChartContainer>
          )}
          
          {activeTab === 'websites' && (
            <ChartContainer>
              <ChartTitle>Entwicklung der Website-Anzahl über die Zeit</ChartTitle>
              <BarChart data={websiteTrendChartData} />
            </ChartContainer>
          )}
        </TabContent>
      </TabContainer>
    </PageContainer>
  );
};

export default Trends;
