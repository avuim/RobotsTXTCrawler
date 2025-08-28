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

const StatusBadge = styled.span<{ allowed: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 16px;
  background-color: ${props => props.allowed ? '#d4edda' : '#f8d7da'};
  color: ${props => props.allowed ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.allowed ? '#c3e6cb' : '#f5c6cb'};
`;

const TabContainer = styled.div`
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.active ? '#007bff' : '#6c757d'};
  border-bottom: 2px solid ${props => props.active ? '#007bff' : 'transparent'};
  margin-right: 8px;
  
  &:hover {
    color: #007bff;
  }
`;

const PathList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PathItem = styled.div<{ type: 'allowed' | 'disallowed' }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: ${props => props.type === 'allowed' ? '#d4edda' : '#f8d7da'};
  border-left: 4px solid ${props => props.type === 'allowed' ? '#28a745' : '#dc3545'};
`;

const PathText = styled.code`
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #495057;
`;

const Badge = styled.span<{ type: 'allowed' | 'disallowed' }>`
  background-color: ${props => props.type === 'allowed' ? '#28a745' : '#dc3545'};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 24px;
`;

const Description = styled.p`
  color: #6c757d;
  font-size: 0.875rem;
  margin: 8px 0 16px 0;
  line-height: 1.4;
`;

interface GlobalRulesCardProps {
  hasGlobalAllow: boolean;
  paths: {
    allowed: string[];
    disallowed: string[];
  };
  domain: string;
}

const GlobalRulesCard: React.FC<GlobalRulesCardProps> = ({ hasGlobalAllow, paths, domain }) => {
  const [activeTab, setActiveTab] = React.useState<'allowed' | 'disallowed'>('disallowed');
  
  const totalPaths = paths.allowed.length + paths.disallowed.length;
  
  // Wenn keine Pfade vorhanden sind, zeige nur den Status
  if (totalPaths === 0) {
    return (
      <Card>
        <Title>Globale Regeln (User-agent: *)</Title>
        <StatusBadge allowed={hasGlobalAllow}>
          {hasGlobalAllow ? 'Global erlaubt' : 'Global verboten'}
        </StatusBadge>
        <Description>
          Diese Regel gilt für alle Bots, die nicht explizit in der robots.txt von {domain} definiert sind.
        </Description>
      </Card>
    );
  }

  return (
    <Card>
      <Title>Globale Regeln (User-agent: *)</Title>
      <StatusBadge allowed={hasGlobalAllow}>
        {hasGlobalAllow ? 'Global erlaubt' : 'Global verboten'}
      </StatusBadge>
      <Description>
        Diese Regeln gelten für alle Bots, die nicht explizit in der robots.txt von {domain} definiert sind.
      </Description>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'allowed'} 
          onClick={() => setActiveTab('allowed')}
        >
          Erlaubte Pfade ({paths.allowed.length})
        </Tab>
        <Tab 
          active={activeTab === 'disallowed'} 
          onClick={() => setActiveTab('disallowed')}
        >
          Verbotene Pfade ({paths.disallowed.length})
        </Tab>
      </TabContainer>

      <PathList>
        {activeTab === 'allowed' && (
          <>
            {paths.allowed.length > 0 ? (
              paths.allowed.map((path, index) => (
                <PathItem key={index} type="allowed">
                  <PathText>{path}</PathText>
                  <Badge type="allowed">Erlaubt</Badge>
                </PathItem>
              ))
            ) : (
              <EmptyState>Keine erlaubten Pfade definiert</EmptyState>
            )}
          </>
        )}
        
        {activeTab === 'disallowed' && (
          <>
            {paths.disallowed.length > 0 ? (
              paths.disallowed.map((path, index) => (
                <PathItem key={index} type="disallowed">
                  <PathText>{path}</PathText>
                  <Badge type="disallowed">Verboten</Badge>
                </PathItem>
              ))
            ) : (
              <EmptyState>Keine verbotenen Pfade definiert</EmptyState>
            )}
          </>
        )}
      </PathList>
    </Card>
  );
};

export default GlobalRulesCard;
