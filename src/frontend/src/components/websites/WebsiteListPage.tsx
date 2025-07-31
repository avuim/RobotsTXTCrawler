import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.9rem;
  min-width: 300px;
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

const StatValue = styled.span<{ $type: 'allowed' | 'disallowed' | 'total' }>`
  color: ${({ theme, $type }) => {
    switch ($type) {
      case 'allowed': return theme.colors.success;
      case 'disallowed': return theme.colors.danger;
      default: return theme.colors.text;
    }
  }};
  font-weight: 500;
`;


interface Website {
  domain: string;
  totalBots: number;
  allowedBots: number;
  disallowedBots: number;
}

const WebsiteListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: websites, loading, error } = useApi(() => API.getWebsites());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWebsites = websites?.filter(website => 
    website.domain.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const columns: TableColumn<Website>[] = [
    {
      key: 'domain',
      header: 'Domain',
      render: (website) => (
        <TableLink href={`/websites/${encodeURIComponent(website.domain)}`}>
          {website.domain}
        </TableLink>
      ),
    },
    {
      key: 'totalBots',
      header: 'Anzahl Bots',
      align: 'right',
      render: (website) => website.totalBots.toLocaleString(),
    },
    {
      key: 'stats',
      header: 'Erlaubt / Verboten',
      align: 'right',
      render: (website) => (
        <StatsContainer>
          <StatLine>
            <span>Erlaubt:</span>
            <StatValue $type="allowed">
              {website.allowedBots.toLocaleString()}
            </StatValue>
          </StatLine>
          <StatLine>
            <span>Verboten:</span>
            <StatValue $type="disallowed">
              {website.disallowedBots.toLocaleString()}
            </StatValue>
          </StatLine>
        </StatsContainer>
      ),
    },
    {
      key: 'allowanceRate',
      header: 'Erlaubt-Quote',
      align: 'right',
      render: (website) => {
        const rate = website.totalBots > 0 
          ? ((website.allowedBots / website.totalBots) * 100).toFixed(1)
          : '0';
        return `${rate}%`;
      },
    },
  ];

  const handleRowClick = (website: Website) => {
    navigate(`/websites/${encodeURIComponent(website.domain)}`);
  };

  if (loading) {
    return (
      <Layout pageTitle="Alle Websites">
        <Loading message="Lade Website-Daten..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout pageTitle="Alle Websites">
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Alle Websites">
      <PageContainer>
        <FilterContainer>
          <SearchInput
            type="text"
            placeholder="Website suchen (z.B. google.com, facebook.com)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div>
            <strong>{filteredWebsites.length}</strong> von <strong>{websites?.length || 0}</strong> Websites
          </div>
        </FilterContainer>

        <Table 
          data={filteredWebsites} 
          columns={columns}
          onRowClick={handleRowClick}
        />
      </PageContainer>
    </Layout>
  );
};

export default WebsiteListPage;
