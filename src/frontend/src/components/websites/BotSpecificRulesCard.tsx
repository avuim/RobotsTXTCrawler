import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Title = styled.h3`
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
`;

const BotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BotItem = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
`;

const BotHeader = styled.div<{ allowed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${props => props.allowed ? '#d4edda' : '#f8d7da'};
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.allowed ? '#c3e6cb' : '#f5c6cb'};
  }
`;

const BotName = styled.span`
  font-weight: 500;
  color: #2c3e50;
`;

const BotStatus = styled.span<{ allowed: boolean }>`
  background-color: ${props => props.allowed ? '#28a745' : '#dc3545'};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  margin-right: 8px;
  background-color: ${({ $category }) => {
    switch ($category) {
      case 'searchEngine': return '#007bff';
      case 'seo': return '#28a745';
      case 'aiScraper': return '#dc3545';
      case 'other': return '#6c757d';
      default: return '#6c757d';
    }
  }};
`;

const BotHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BotHeaderColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const ColumnHeader = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  padding: 8px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const ColumnHeaders = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 16px;
`;

const BotDetails = styled.div<{ expanded: boolean }>`
  display: ${props => props.expanded ? 'block' : 'none'};
  padding: 16px;
  background: #f8f9fa;
`;

const PathSection = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PathSectionTitle = styled.h5`
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
`;

const PathList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PathItem = styled.div<{ type: 'allowed' | 'disallowed' }>`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  background-color: ${props => props.type === 'allowed' ? '#d4edda' : '#f8d7da'};
  border-left: 3px solid ${props => props.type === 'allowed' ? '#28a745' : '#dc3545'};
`;

const PathText = styled.code`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8rem;
  color: #495057;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 24px;
`;

const NoPathsMessage = styled.div`
  color: #6c757d;
  font-size: 0.875rem;
  font-style: italic;
`;

const ExpandIcon = styled.span<{ expanded: boolean }>`
  margin-left: 8px;
  transition: transform 0.2s;
  transform: ${props => props.expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
`;

interface BotSpecificRulesCardProps {
  specificBots: {
    name: string;
    allowed: boolean;
    paths?: {
      allowed: string[];
      disallowed: string[];
    };
  }[];
  stats: {
    totalSpecificBots: number;
    allowedBots: number;
    disallowedBots: number;
  };
  getBotCategory?: (botName: string) => string;
}

const BotSpecificRulesCard: React.FC<BotSpecificRulesCardProps> = ({ specificBots, stats, getBotCategory }) => {
  const [expandedBots, setExpandedBots] = React.useState<Set<string>>(new Set());
  
  const toggleBot = (botName: string) => {
    const newExpanded = new Set(expandedBots);
    if (newExpanded.has(botName)) {
      newExpanded.delete(botName);
    } else {
      newExpanded.add(botName);
    }
    setExpandedBots(newExpanded);
  };

  const categoryLabels = {
    searchEngine: 'Suchmaschine',
    seo: 'SEO-Tool',
    aiScraper: 'KI/LLM-Scraper',
    other: 'Andere',
  };
  
  if (specificBots.length === 0) {
    return (
      <Card>
        <Title>Bot-spezifische Regeln</Title>
        <EmptyState>
          Keine bot-spezifischen Regeln definiert. Alle Bots folgen den globalen Regeln.
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <Title>Bot-spezifische Regeln ({stats.totalSpecificBots} Bots)</Title>
      
      <StatsContainer>
        <StatItem>
          <StatLabel>Gesamt</StatLabel>
          <StatValue>{stats.totalSpecificBots}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Erlaubt</StatLabel>
          <StatValue>{stats.allowedBots}</StatValue>
        </StatItem>
        <StatItem>
          <StatLabel>Verboten</StatLabel>
          <StatValue>{stats.disallowedBots}</StatValue>
        </StatItem>
      </StatsContainer>

      {/* Spaltenüberschriften */}
      <ColumnHeaders>
        <ColumnHeader>Bot Name</ColumnHeader>
        <ColumnHeader>Kategorie</ColumnHeader>
        <ColumnHeader>Status</ColumnHeader>
        <ColumnHeader></ColumnHeader>
      </ColumnHeaders>

      <BotList>
        {specificBots.map((bot) => {
          const isExpanded = expandedBots.has(bot.name);
          const hasPaths = bot.paths && (bot.paths.allowed.length > 0 || bot.paths.disallowed.length > 0);
          const botCategory = getBotCategory ? getBotCategory(bot.name) : 'other';
          
          return (
            <BotItem key={bot.name}>
              <BotHeader 
                allowed={bot.allowed} 
                onClick={() => toggleBot(bot.name)}
              >
                <BotHeaderColumns>
                  <BotName>{bot.name}</BotName>
                  {getBotCategory && (
                    <CategoryBadge $category={botCategory}>
                      {categoryLabels[botCategory as keyof typeof categoryLabels] || botCategory}
                    </CategoryBadge>
                  )}
                  <BotStatus allowed={bot.allowed}>
                    {bot.allowed ? 'Erlaubt' : 'Verboten'}
                  </BotStatus>
                  <BotHeaderRight>
                    {hasPaths && (
                      <ExpandIcon expanded={isExpanded}>▶</ExpandIcon>
                    )}
                  </BotHeaderRight>
                </BotHeaderColumns>
              </BotHeader>
              
              {hasPaths && (
                <BotDetails expanded={isExpanded}>
                  {bot.paths!.disallowed.length > 0 && (
                    <PathSection>
                      <PathSectionTitle>Verbotene Pfade ({bot.paths!.disallowed.length})</PathSectionTitle>
                      <PathList>
                        {bot.paths!.disallowed.map((path, index) => (
                          <PathItem key={index} type="disallowed">
                            <PathText>{path}</PathText>
                          </PathItem>
                        ))}
                      </PathList>
                    </PathSection>
                  )}
                  
                  {bot.paths!.allowed.length > 0 && (
                    <PathSection>
                      <PathSectionTitle>Erlaubte Pfade ({bot.paths!.allowed.length})</PathSectionTitle>
                      <PathList>
                        {bot.paths!.allowed.map((path, index) => (
                          <PathItem key={index} type="allowed">
                            <PathText>{path}</PathText>
                          </PathItem>
                        ))}
                      </PathList>
                    </PathSection>
                  )}
                  
                  {bot.paths!.allowed.length === 0 && bot.paths!.disallowed.length === 0 && (
                    <NoPathsMessage>
                      Keine spezifischen Pfad-Regeln für diesen Bot definiert.
                    </NoPathsMessage>
                  )}
                </BotDetails>
              )}
            </BotItem>
          );
        })}
      </BotList>
    </Card>
  );
};

export default BotSpecificRulesCard;
