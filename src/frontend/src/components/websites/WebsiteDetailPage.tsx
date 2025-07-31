import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import Table, { TableColumn, TableLink } from '../common/Table.tsx';
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

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
`;

const StatusBadge = styled.span<{ $allowed: boolean }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${({ theme, $allowed }) => 
    $allowed ? theme.colors.success : theme.colors.danger};
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

interface BotEntry {
  name: string;
  category: string;
  allowed: boolean;
}

const WebsiteDetailPage: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const decodedDomain = domain ? decodeURIComponent(domain) : '';
  
  const { data: website, loading, error } = useApi(() => 
    domain ? API.getWebsiteByDomain(decodedDomain) : Promise.reject('No domain provided')
  );

  const categoryLabels = {
    searchEngine: 'Suchmaschine',
    seo: 'SEO-Tool',
    aiScraper: 'KI/LLM-Scraper',
    other: 'Andere',
  };

  const columns: TableColumn<BotEntry>[] = [
    {
      key: 'name',
      header: 'Bot Name',
      render: (entry) => (
        <TableLink href={`/bots/${encodeURIComponent(entry.name)}`}>
          {entry.name}
        </TableLink>
      ),
    },
    {
      key: 'category',
      header: 'Kategorie',
      render: (entry) => (
        <CategoryBadge $category={entry.category}>
          {categoryLabels[entry.category as keyof typeof categoryLabels] || entry.category}
        </CategoryBadge>
      ),
    },
    {
      key: 'allowed',
      header: 'Status',
      render: (entry) => (
        <StatusBadge $allowed={entry.allowed}>
          {entry.allowed ? 'Erlaubt' : 'Verboten'}
        </StatusBadge>
      ),
    },
  ];

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

  // Erstelle Bot-Einträge aus den Website-Daten
  const botEntries: BotEntry[] = [
    ...(website.allowedBots || []).map((botName: string) => ({
      name: botName,
      category: 'other', // Default, könnte aus Bot-Daten geholt werden
      allowed: true
    })),
    ...(website.disallowedBots || []).map((botName: string) => ({
      name: botName,
      category: 'other', // Default, könnte aus Bot-Daten geholt werden
      allowed: false
    }))
  ];

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
              <InfoLabel>Anzahl Bots</InfoLabel>
              <InfoValue>{website.totalBots?.toLocaleString() || '0'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Erlaubte Bots</InfoLabel>
              <InfoValue style={{ color: '#10b981' }}>
                {website.allowedBots?.toLocaleString() || '0'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Verbotene Bots</InfoLabel>
              <InfoValue style={{ color: '#ef4444' }}>
                {website.disallowedBots?.toLocaleString() || '0'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Erlaubt-Quote</InfoLabel>
              <InfoValue>
                {website.totalBots && website.totalBots > 0 
                  ? `${((website.allowedBots / website.totalBots) * 100).toFixed(1)}%`
                  : '0%'
                }
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Zuletzt aktualisiert</InfoLabel>
              <InfoValue>
                {website.lastUpdated 
                  ? new Date(website.lastUpdated).toLocaleDateString('de-DE')
                  : 'Unbekannt'
                }
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </InfoCard>

        <InfoCard>
          <SectionTitle>Bot-Details</SectionTitle>
          {botEntries.length > 0 ? (
            <Table 
              data={botEntries} 
              columns={columns}
            />
          ) : (
            <p>Keine Bot-Details verfügbar</p>
          )}
        </InfoCard>
      </PageContainer>
    </Layout>
  );
};

export default WebsiteDetailPage;
