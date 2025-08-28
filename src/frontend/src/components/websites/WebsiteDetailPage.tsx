import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import GlobalRulesCard from './GlobalRulesCard.tsx';
import BotSpecificRulesCard from './BotSpecificRulesCard.tsx';
import WebsiteDirectoryRulesCard from './WebsiteDirectoryRulesCard.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { API } from '../../services/api.ts';
import Loading from '../common/Loading.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InfoLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.lightText};
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;


const WebsiteDetailPage: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const decodedDomain = domain ? decodeURIComponent(domain) : '';
  
  const { data: website, loading, error } = useApi(() => 
    domain ? API.getWebsiteByDomain(decodedDomain) : Promise.reject('No domain provided')
  );

  // Lade Bot-Liste für Kategorien
  const { data: botList } = useApi(() => API.getBots());

  // Funktion zum Ermitteln der Bot-Kategorie
  const getBotCategory = (botName: string): string => {
    if (!botList) return 'other';
    
    const bot = botList.find((b: any) => b.name === botName);
    return bot?.category || 'other';
  };

  if (loading) {
    return (
      <Layout pageTitle={`Website: ${decodedDomain}`}>
        <Loading message="Lade Website-Details..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle={`Website: ${decodedDomain}`}>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!website) {
    return (
      <Layout pageTitle={`Website: ${decodedDomain}`}>
        <ErrorMessage message="Website nicht gefunden" />
      </Layout>
    );
  }


  // Verwende neue Statistiken oder Fallback zu Legacy
  const stats = website.stats || {
    totalSpecificBots: website.totalBots || 0,
    allowedBots: website.allowedBots || 0,
    disallowedBots: website.disallowedBots || 0,
    hasGlobalAllow: true
  };

  // Debug-Ausgabe - vollständige Website-Daten
  console.log('🔍 Complete website object:', JSON.stringify(website, null, 2));
  
  console.log('🔍 Website data structure:', JSON.stringify({
    hasGlobalRules: !!website.globalRules,
    hasSpecificBots: !!website.specificBots,
    specificBotsLength: website.specificBots?.length || 0,
    stats,
    allKeys: Object.keys(website)
  }, null, 2));
  
  console.log('🔍 GlobalRules condition:', JSON.stringify({
    hasGlobalRules: !!website.globalRules,
    hasGlobalRulesPaths: !!(website.globalRules && website.globalRules.paths),
    globalRulesData: website.globalRules
  }, null, 2));
  
  console.log('🔍 SpecificBots condition:', JSON.stringify({
    hasSpecificBots: !!website.specificBots,
    specificBotsLength: website.specificBots?.length || 0,
    condition: !!(website.specificBots && website.specificBots.length > 0),
    specificBotsData: website.specificBots
  }, null, 2));

  return (
    <Layout pageTitle={`Website: ${decodedDomain}`}>
      <PageContainer>
        <InfoCard>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Domain</InfoLabel>
              <InfoValue>{decodedDomain}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Global Status</InfoLabel>
              <InfoValue style={{ color: stats.hasGlobalAllow ? '#10b981' : '#ef4444' }}>
                {stats.hasGlobalAllow ? 'Erlaubt' : 'Verboten'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Spezifische Bots</InfoLabel>
              <InfoValue>{stats.totalSpecificBots.toLocaleString()}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Davon erlaubt</InfoLabel>
              <InfoValue style={{ color: '#10b981' }}>
                {stats.allowedBots.toLocaleString()}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Davon verboten</InfoLabel>
              <InfoValue style={{ color: '#ef4444' }}>
                {stats.disallowedBots.toLocaleString()}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </InfoCard>

        {/* Globale Regeln */}
        {website.globalRules && website.globalRules.paths && (
          <GlobalRulesCard 
            hasGlobalAllow={stats.hasGlobalAllow}
            paths={website.globalRules.paths}
            domain={decodedDomain} 
          />
        )}

        {/* Bot-spezifische Regeln */}
        {website.specificBots && website.specificBots.length > 0 && (
          <BotSpecificRulesCard 
            specificBots={website.specificBots}
            stats={stats}
            getBotCategory={getBotCategory}
          />
        )}

        {/* Fallback: Legacy Directory Rules (nur wenn neue Struktur nicht vorhanden) */}
        {!website.globalRules && !website.specificBots && website.paths && (
          <WebsiteDirectoryRulesCard 
            paths={website.paths} 
            domain={decodedDomain} 
          />
        )}

      </PageContainer>
    </Layout>
  );
};

export default WebsiteDetailPage;
