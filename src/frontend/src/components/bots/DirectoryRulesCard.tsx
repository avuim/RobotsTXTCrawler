import React, { useState } from 'react';
import { BotStats } from '../../types/Bot';

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '0.5rem',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  padding: '1.5rem',
  marginBottom: '1.5rem'
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 1rem 0',
  color: '#2c3e50',
  fontSize: '1.2rem',
  fontWeight: 600
};

const tabContainerStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #dddddd',
  marginBottom: '1rem'
};

const getTabStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.5rem 1rem',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 500,
  color: active ? '#2c3e50' : '#666666',
  borderBottom: `2px solid ${active ? '#2c3e50' : 'transparent'}`,
  transition: 'all 0.2s ease'
});

const directoryTableStyle: React.CSSProperties = {
  marginBottom: '1.5rem'
};

const directoryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5rem 0',
  borderBottom: '1px solid #dddddd',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease'
};

const directoryPathStyle: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  fontWeight: 500,
  color: '#333333'
};

const websiteCountStyle: React.CSSProperties = {
  color: '#666666',
  fontSize: '0.9rem'
};

const websiteListStyle: React.CSSProperties = {
  marginTop: '0.25rem',
  paddingLeft: '1rem'
};

const websiteItemStyle: React.CSSProperties = {
  display: 'inline-block',
  marginRight: '0.5rem',
  marginBottom: '0.25rem',
  padding: '0.25rem 0.5rem',
  backgroundColor: '#f5f5f5',
  borderRadius: '0.25rem',
  fontSize: '0.8rem',
  color: '#333333'
};

const emptyStateStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '2rem',
  color: '#666666',
  fontStyle: 'italic'
};

const statsContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1rem',
  marginBottom: '1.5rem',
  padding: '1rem',
  backgroundColor: '#f5f5f5',
  borderRadius: '0.25rem'
};

const statItemStyle: React.CSSProperties = {
  textAlign: 'center'
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#666666',
  marginBottom: '0.25rem'
};

const statValueStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 600,
  color: '#333333'
};

interface DirectoryRule {
  directory: string;
  websites: string[];
  websiteCount: number;
}

interface DirectoryRulesCardProps {
  botStats: BotStats;
  botName: string;
}

const DirectoryRulesCard: React.FC<DirectoryRulesCardProps> = ({ botStats, botName }) => {
  const [activeTab, setActiveTab] = useState<'allowed' | 'disallowed'>('allowed');
  const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(new Set());

  // Directory-Regeln für den aktiven Tab
  const directoryRules = botStats.directoryRules[activeTab];
  const directoryData: DirectoryRule[] = Object.entries(directoryRules).map(([directory, websites]) => ({
    directory,
    websites,
    websiteCount: websites.length
  })).sort((a, b) => b.websiteCount - a.websiteCount);

  // Statistiken berechnen
  const allowedDirectories = Object.keys(botStats.directoryRules.allowed).length;
  const disallowedDirectories = Object.keys(botStats.directoryRules.disallowed).length;
  const totalDirectories = allowedDirectories + disallowedDirectories;
  
  const allowedDirectoryWebsites = Object.values(botStats.directoryRules.allowed)
    .reduce((total, websites) => total + websites.length, 0);
  const disallowedDirectoryWebsites = Object.values(botStats.directoryRules.disallowed)
    .reduce((total, websites) => total + websites.length, 0);

  const toggleDirectory = (directory: string) => {
    const newExpanded = new Set(expandedDirectories);
    if (newExpanded.has(directory)) {
      newExpanded.delete(directory);
    } else {
      newExpanded.add(directory);
    }
    setExpandedDirectories(newExpanded);
  };

  if (totalDirectories === 0) {
    return (
      <div style={containerStyle}>
        <h3 style={sectionTitleStyle}>Verzeichnis-Regeln</h3>
        <div style={emptyStateStyle}>
          Keine verzeichnisspezifischen Regeln für {botName} gefunden.
          <br />
          Alle Regeln beziehen sich auf die gesamte Website.
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h3 style={sectionTitleStyle}>Verzeichnis-Regeln</h3>
      
      <div style={statsContainerStyle}>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Verzeichnisse gesamt</div>
          <div style={statValueStyle}>{totalDirectories}</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Erlaubte Verzeichnisse</div>
          <div style={{...statValueStyle, color: '#10b981'}}>{allowedDirectories}</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Verbotene Verzeichnisse</div>
          <div style={{...statValueStyle, color: '#ef4444'}}>{disallowedDirectories}</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Websites mit Verzeichnis-Regeln</div>
          <div style={statValueStyle}>{allowedDirectoryWebsites + disallowedDirectoryWebsites}</div>
        </div>
      </div>

      <div style={tabContainerStyle}>
        <button 
          style={getTabStyle(activeTab === 'allowed')} 
          onClick={() => setActiveTab('allowed')}
        >
          Erlaubte Verzeichnisse ({allowedDirectories})
        </button>
        <button 
          style={getTabStyle(activeTab === 'disallowed')} 
          onClick={() => setActiveTab('disallowed')}
        >
          Verbotene Verzeichnisse ({disallowedDirectories})
        </button>
      </div>

      <div style={directoryTableStyle}>
        {directoryData.length === 0 ? (
          <div style={emptyStateStyle}>
            Keine {activeTab === 'allowed' ? 'erlaubten' : 'verbotenen'} Verzeichnisse gefunden.
          </div>
        ) : (
          directoryData.map((rule) => (
            <div key={rule.directory}>
              <div style={directoryRowStyle} onClick={() => toggleDirectory(rule.directory)}>
                <span style={directoryPathStyle}>{rule.directory}</span>
                <span style={websiteCountStyle}>
                  {rule.websiteCount} Website{rule.websiteCount !== 1 ? 's' : ''}
                </span>
              </div>
              {expandedDirectories.has(rule.directory) && (
                <div style={websiteListStyle}>
                  {rule.websites.map((website) => (
                    <span key={website} style={websiteItemStyle}>{website}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DirectoryRulesCard;
