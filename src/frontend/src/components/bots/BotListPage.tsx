import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../common/Layout/Layout.tsx';
import Table, { TableColumn, TableLink } from '../common/Table.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { API } from '../../services/api.ts';
import { Bot } from '../../types/Bot.ts';
import Loading from '../common/Loading.tsx';
import ErrorMessage from '../common/ErrorMessage.tsx';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9rem;
  min-width: 200px;
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
  justify-content: flex-end;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.lightText};
`;

const StatValue = styled.span<{ type: 'allowed' | 'disallowed' }>`
  color: ${({ theme, type }) => 
    type === 'allowed' ? theme.colors.success : theme.colors.danger};
  font-weight: 500;
`;

const BotListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: bots, loading, error } = useApi(() => API.getBots());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categoryLabels = {
    searchEngine: 'Suchmaschine',
    seo: 'SEO-Tool',
    aiScraper: 'KI/LLM-Scraper',
    other: 'Andere',
  };

  const filteredBots = bots?.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || bot.category === categoryFilter;
    const isNotWildcard = bot.name !== '*';
    return matchesSearch && matchesCategory && isNotWildcard;
  }).sort((a, b) => b.totalWebsites - a.totalWebsites) || [];

  const columns: TableColumn<Bot>[] = [
    {
      key: 'name',
      header: 'Bot Name',
      width: '40%',
      render: (bot) => (
        <TableLink to={`/bots/${encodeURIComponent(bot.name)}`}>
          {bot.name}
        </TableLink>
      ),
    },
    {
      key: 'category',
      header: 'Kategorie',
      width: '25%',
      render: (bot) => (
        <CategoryBadge category={bot.category}>
          {categoryLabels[bot.category as keyof typeof categoryLabels] || bot.category}
        </CategoryBadge>
      ),
    },
    {
      key: 'stats',
      header: 'Erlaubt / Verboten',
      width: '35%',
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

  const handleRowClick = (bot: Bot) => {
    navigate(`/bots/${encodeURIComponent(bot.name)}`);
  };

  if (loading) {
    return (
      <Layout pageTitle="Alle Bots">
        <Loading message="Lade Bot-Daten..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Alle Bots">
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Alle Bots">
      <PageContainer>
        <FilterContainer>
          <SearchInput
            type="text"
            placeholder="Bot suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Alle Kategorien</option>
            <option value="searchEngine">Suchmaschinen</option>
            <option value="seo">SEO-Tools</option>
            <option value="aiScraper">KI/LLM-Scraper</option>
            <option value="other">Andere</option>
          </FilterSelect>
        </FilterContainer>

        <Table 
          data={filteredBots} 
          columns={columns}
          onRowClick={handleRowClick}
        />
      </PageContainer>
    </Layout>
  );
};

export default BotListPage;
