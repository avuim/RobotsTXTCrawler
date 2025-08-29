import React from 'react';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import SummaryStats from './SummaryStats.tsx';
import BotCategories from './BotCategories.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { API } from '../../services/api.ts';
import Loading from '../common/Loading.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthSection = styled.div`
  grid-column: 1 / -1;
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const WelcomeCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const WelcomeTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
`;

const WelcomeText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const StatusIndicator = styled.div<{ $status: 'running' | 'stopped' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme, $status }) => 
    $status === 'running' ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ theme, $status }) => 
    $status === 'running' ? theme.colors.success : theme.colors.danger};
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatusDot = styled.div<{ status: 'running' | 'stopped' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme, status }) => 
    status === 'running' ? theme.colors.success : theme.colors.danger};
`;

const DashboardPage: React.FC = () => {
  const { data: summary, loading, error } = useApi(() => API.getSummary());

  // Bestimme API-Modus (gleiche Logik wie in api.ts)
  const isGitHubPages = window.location.hostname === 'avuim.github.io';
  const isExplicitStatic = process.env.REACT_APP_API_MODE === 'static';
  const isStaticMode = isGitHubPages || isExplicitStatic;

  if (loading) {
    return (
      <Layout pageTitle="Dashboard">
        <Loading message="Lade Dashboard-Daten..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Dashboard">
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Dashboard">
      <WelcomeCard>
        <WelcomeTitle>Willkommen beim Robots.txt Crawler und Analyzer!</WelcomeTitle>
        <WelcomeText>
          {isStaticMode 
            ? 'Diese Anwendung läuft auf GitHub Pages mit statischen Daten. Die Daten werden regelmäßig durch automatisierte Crawler-Läufe aktualisiert.'
            : 'Der Crawler wurde erfolgreich gestartet und läuft im Hintergrund.'
          }
          {' '}Hier finden Sie eine Übersicht über die gesammelten Daten und Statistiken.
        </WelcomeText>
        <WelcomeText>
          <StatusIndicator $status="running">
            <StatusDot status="running" />
            {isStaticMode 
              ? 'Statische API (GitHub Pages)' 
              : 'API-Server läuft auf Port 3001'
            }
          </StatusIndicator>
        </WelcomeText>
      </WelcomeCard>

      {summary && (
        <>
          <DashboardGrid>
            <Card>
              <SummaryStats summary={summary} />
            </Card>
            <Card>
              <BotCategories categories={summary.botCategories} />
            </Card>
          </DashboardGrid>
          
        </>
      )}
    </Layout>
  );
};

export default DashboardPage;
