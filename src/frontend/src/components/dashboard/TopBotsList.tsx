import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Table, { TableColumn, TableLink } from '../common/Table.tsx';

const TopBotsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
`;

const CategoryBadge = styled.span<{ category: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  background-color: ${({ theme, category }) => {
    switch (category) {
      case 'searchEngine': return theme.colors.searchEngine;
      case 'seo': return theme.colors.seo;
      case 'aiScraper': return theme.colors.aiScraper;
      case 'other': return theme.colors.other;
      default: return theme.colors.lightText;
    }
  }};
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.85rem;
`;

const StatLine = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.lightText};
`;

const StatValue = styled.span<{ type: 'allowed' | 'disallowed' }>`
  color: ${({ theme, type }) => 
    type === 'allowed' ? theme.colors.success : theme.colors.danger};
  font-weight: 500;
`;

interface TopBot {
  name: string;
  category: string;
  totalWebsites: number;
  allowedWebsites: number;
  disallowedWebsites: number;
}

interface TopBotsListProps {
  bots: TopBot[];
}

const TopBotsList: React.FC<TopBotsListProps> = ({ bots }) => {
  const navigate = useNavigate();

  const categoryLabels = {
    searchEngine: 'Suchmaschine',
    seo: 'SEO-Tool',
    aiScraper: 'KI/LLM-Scraper',
    other: 'Andere',
  };

  const columns: TableColumn<TopBot>[] = [
    {
      key: 'name',
      header: 'Bot Name',
      render: (bot) => (
        <TableLink href={`/bots/${encodeURIComponent(bot.name)}`}>
          {bot.name}
        </TableLink>
      ),
    },
    {
      key: 'category',
      header: 'Kategorie',
      render: (bot) => (
        <CategoryBadge category={bot.category}>
          {categoryLabels[bot.category as keyof typeof categoryLabels] || bot.category}
        </CategoryBadge>
      ),
    },
    {
      key: 'totalWebsites',
      header: 'Websites',
      align: 'right',
      render: (bot) => bot.totalWebsites.toLocaleString(),
    },
    {
      key: 'stats',
      header: 'Erlaubt / Verboten',
      align: 'right',
      render: (bot) => (
        <StatsContainer>
          <StatLine>
            <span>Erlaubt:</span>
            <StatValue type="allowed">
              {bot.allowedWebsites.toLocaleString()}
            </StatValue>
          </StatLine>
          <StatLine>
            <span>Verboten:</span>
            <StatValue type="disallowed">
              {bot.disallowedWebsites.toLocaleString()}
            </StatValue>
          </StatLine>
        </StatsContainer>
      ),
    },
  ];

  const handleRowClick = (bot: TopBot) => {
    navigate(`/bots/${encodeURIComponent(bot.name)}`);
  };

  // Filter out the "*" bot and get top 5
  const filteredBots = bots.filter(bot => bot.name !== '*').slice(0, 5);

  return (
    <TopBotsContainer>
      <SectionTitle>Top 5 Bots</SectionTitle>
      <Table 
        data={filteredBots} 
        columns={columns}
        onRowClick={handleRowClick}
      />
    </TopBotsContainer>
  );
};

export default TopBotsList;
