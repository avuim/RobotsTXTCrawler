import React from 'react';
import styled from 'styled-components';
import { Summary } from '../../types/Common.ts';

const StatsContainer = styled.div`
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

const StatsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}30;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const StatValue = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.1rem;
`;

const LastUpdated = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0 0 0;
  color: ${({ theme }) => theme.colors.lightText};
  font-size: 0.85rem;
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border}30;
`;

interface SummaryStatsProps {
  summary: Summary;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ summary }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StatsContainer>
      <SectionTitle>Zusammenfassung</SectionTitle>
      
      <StatsList>
        <StatItem>
          <StatLabel>Anzahl Bots</StatLabel>
          <StatValue>{summary.totalBots.toLocaleString()}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Anzahl Websites</StatLabel>
          <StatValue>{summary.totalWebsites.toLocaleString()}</StatValue>
        </StatItem>
      </StatsList>

      <LastUpdated>
        Letzte Aktualisierung: {formatDate(summary.lastUpdated)}
      </LastUpdated>
    </StatsContainer>
  );
};

export default SummaryStats;
