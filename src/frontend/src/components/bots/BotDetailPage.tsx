import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import Table, { TableColumn, TableLink } from '../common/Table.tsx';
import MonthlyStatsChart from '../common/MonthlyStatsChart.tsx';
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

const BotInfoCard = styled(InfoCard)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const BotTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  font-weight: 700;
`;

const BotDescription = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  font-size: 1rem;
`;

const BotMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MetaLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.lightText};
  font-weight: 500;
`;

const MetaValue = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const WebsiteLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
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

const CategoryBadge = styled.span<{ $category: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${({ theme, $category }) => {
    switch ($category) {
      case 'searchEngine': return theme.colors.searchEngine;
      case 'seo': return theme.colors.seo;
      case 'aiScraper': return theme.colors.aiScraper;
      case 'other': return theme.colors.other;
      default: return theme.colors.lightText;
    }
  }};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ allowed: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${({ theme, allowed }) => 
    allowed ? theme.colors.success : theme.colors.danger};
`;

interface WebsiteEntry {
  domain: string;
  allowed: boolean;
  lastChecked: string;
}

const BotDetailPage: React.FC = () => {
  const { botName } = useParams<{ botName: string }>();
  const decodedBotName = botName ? decodeURIComponent(botName) : '';
  
  const { data: bot, loading, error } = useApi(() => 
    botName ? API.getBotByName(decodedBotName) : Promise.reject('No bot name provided')
  );

  const categoryLabels = {
    searchEngine: 'Suchmaschine',
    seo: 'SEO-Tool',
    aiScraper: 'KI/LLM-Scraper',
    other: 'Andere',
  };

  const columns: TableColumn<WebsiteEntry>[] = [
    {
      key: 'domain',
      header: 'Website',
      render: (entry) => (
        <TableLink to={`/websites/${encodeURIComponent(entry.domain)}`}>
          {entry.domain}
        </TableLink>
      ),
    },
    {
      key: 'allowed',
      header: 'Status',
      render: (entry) => (
        <StatusBadge allowed={entry.allowed}>
          {entry.allowed ? 'Erlaubt' : 'Verboten'}
        </StatusBadge>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout pageTitle={`Bot: ${decodedBotName}`}>
        <Loading message="Lade Bot-Details..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle={`Bot: ${decodedBotName}`}>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  if (!bot) {
    return (
      <Layout pageTitle={`Bot: ${decodedBotName}`}>
        <ErrorMessage message="Bot nicht gefunden" />
      </Layout>
    );
  }

  // Aktueller Monat für die Statistiken
  const currentMonth = new Date().toISOString().substring(0, 7); // Format: YYYY-MM
  const latestMonth = bot.monthlyStats ? Object.keys(bot.monthlyStats).sort().pop() : null;
  const currentStats = latestMonth ? bot.monthlyStats[latestMonth] : null;
  
  // Verwende die Statistiken des aktuellsten Monats (normalerweise der aktuelle Monat)
  const totalWebsites = currentStats ? currentStats.totalWebsites : 0;
  const allowedWebsites = currentStats ? currentStats.allowedWebsites : 0;
  const disallowedWebsites = currentStats ? currentStats.disallowedWebsites : 0;
  
  // Berechne Verzeichnis-Regeln Statistiken
  const directoryRulesStats = currentStats ? {
    allowedPaths: Object.keys(currentStats.directoryRules?.allowed || {}).length,
    disallowedPaths: Object.keys(currentStats.directoryRules?.disallowed || {}).length,
    totalDirectoryRules: Object.keys(currentStats.directoryRules?.allowed || {}).length + 
                        Object.keys(currentStats.directoryRules?.disallowed || {}).length
  } : { allowedPaths: 0, disallowedPaths: 0, totalDirectoryRules: 0 };

  return (
    <Layout pageTitle={`Bot: ${decodedBotName}`}>
      <PageContainer>
        {/* Bot-Detail-Informationen */}
        {(bot.description || bot.owner || bot.website) && (
          <BotInfoCard>
            <BotTitle>{decodedBotName}</BotTitle>
            {bot.description && (
              <BotDescription>{bot.description}</BotDescription>
            )}
            <BotMeta>
              {bot.owner && (
                <MetaItem>
                  <MetaLabel>Anbieter</MetaLabel>
                  <MetaValue>{bot.owner}</MetaValue>
                </MetaItem>
              )}
              {bot.website && (
                <MetaItem>
                  <MetaLabel>Website</MetaLabel>
                  <WebsiteLink href={bot.website} target="_blank" rel="noopener noreferrer">
                    {bot.website}
                  </WebsiteLink>
                </MetaItem>
              )}
              <MetaItem>
                <MetaLabel>Kategorie</MetaLabel>
                <CategoryBadge $category={bot.category}>
                  {categoryLabels[bot.category as keyof typeof categoryLabels] || bot.category}
                </CategoryBadge>
              </MetaItem>
            </BotMeta>
          </BotInfoCard>
        )}

        {/* Globale Statistiken */}
        <InfoCard>
          <SectionTitle>Globale Bot-Regeln ({latestMonth || 'Aktueller Monat'})</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Bot Name</InfoLabel>
              <InfoValue>{decodedBotName}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Kategorie</InfoLabel>
              <CategoryBadge $category={bot.category}>
                {categoryLabels[bot.category as keyof typeof categoryLabels] || bot.category}
              </CategoryBadge>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Websites mit globalen Regeln</InfoLabel>
              <InfoValue>{totalWebsites.toLocaleString()}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Global erlaubte Websites</InfoLabel>
              <InfoValue style={{ color: '#10b981' }}>
                {allowedWebsites.toLocaleString()}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Global verbotene Websites</InfoLabel>
              <InfoValue style={{ color: '#ef4444' }}>
                {disallowedWebsites.toLocaleString()}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Erlaubt-Quote (global)</InfoLabel>
              <InfoValue>
                {totalWebsites > 0 
                  ? `${((allowedWebsites / totalWebsites) * 100).toFixed(1)}%`
                  : '0%'
                }
              </InfoValue>
            </InfoItem>
          </InfoGrid>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
            Diese Statistiken zeigen nur Websites mit globalen Allow/Disallow-Regeln (Allow: / oder Disallow: /).
          </p>
        </InfoCard>

        {/* Verzeichnis-Regeln Statistiken */}
        {directoryRulesStats.totalDirectoryRules > 0 && (
          <InfoCard>
            <SectionTitle>Verzeichnis-spezifische Regeln ({latestMonth || 'Aktueller Monat'})</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Verzeichnisse mit Regeln</InfoLabel>
                <InfoValue>{directoryRulesStats.totalDirectoryRules.toLocaleString()}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Erlaubte Verzeichnisse</InfoLabel>
                <InfoValue style={{ color: '#10b981' }}>
                  {directoryRulesStats.allowedPaths.toLocaleString()}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Verbotene Verzeichnisse</InfoLabel>
                <InfoValue style={{ color: '#ef4444' }}>
                  {directoryRulesStats.disallowedPaths.toLocaleString()}
                </InfoValue>
              </InfoItem>
            </InfoGrid>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>
              Diese Statistiken zeigen spezifische Verzeichnis-Regeln wie Allow: /blog/ oder Disallow: /admin/.
            </p>
          </InfoCard>
        )}

        {/* Monatlicher Verlauf Chart */}
        <InfoCard>
          <SectionTitle>Monatlicher Verlauf</SectionTitle>
          {bot.monthlyStats && Object.keys(bot.monthlyStats).length > 0 ? (
            <MonthlyStatsChart monthlyStats={bot.monthlyStats} />
          ) : (
            <p>Keine monatlichen Daten verfügbar</p>
          )}
        </InfoCard>


        {/* Website-Details - Globale Regeln */}
        <InfoCard>
          <SectionTitle>Websites mit globalen Regeln ({latestMonth || 'Aktueller Monat'})</SectionTitle>
          {currentStats ? (
            (() => {
              // Zeige nur Websites mit globalen Regeln
              const websiteEntries: WebsiteEntry[] = [
                ...currentStats.websites.allowed.map(domain => ({
                  domain,
                  allowed: true,
                  lastChecked: latestMonth || ''
                })),
                ...currentStats.websites.disallowed.map(domain => ({
                  domain,
                  allowed: false,
                  lastChecked: latestMonth || ''
                }))
              ];
              
              return (
                <div>
                  <h4>Websites mit globalen Allow/Disallow-Regeln für {decodedBotName}</h4>
                  <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                    Gesamt: {websiteEntries.length} Websites ({currentStats.websites.allowed.length} global erlaubt, {currentStats.websites.disallowed.length} global verboten)
                  </p>
                  {websiteEntries.length > 0 ? (
                    <Table 
                      data={websiteEntries} 
                      columns={columns}
                    />
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#6b7280' }}>
                      Keine Websites mit globalen Regeln für diesen Bot gefunden.
                    </p>
                  )}
                </div>
              );
            })()
          ) : (
            <p>Keine Website-Details verfügbar</p>
          )}
        </InfoCard>
      </PageContainer>
    </Layout>
  );
};

export default BotDetailPage;
