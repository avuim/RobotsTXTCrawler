import React, { useState } from 'react';

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

const pathListStyle: React.CSSProperties = {
  marginBottom: '1.5rem'
};

const pathItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.75rem 1rem',
  marginBottom: '0.5rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '0.25rem',
  borderLeft: '4px solid #dee2e6'
};

const allowedPathStyle: React.CSSProperties = {
  ...pathItemStyle,
  borderLeftColor: '#10b981',
  backgroundColor: '#f0fdf4'
};

const disallowedPathStyle: React.CSSProperties = {
  ...pathItemStyle,
  borderLeftColor: '#ef4444',
  backgroundColor: '#fef2f2'
};

const pathTextStyle: React.CSSProperties = {
  fontFamily: "'Courier New', monospace",
  fontWeight: 500,
  color: '#333333',
  fontSize: '0.9rem'
};

const pathTypeStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 600,
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  color: 'white'
};

const allowedBadgeStyle: React.CSSProperties = {
  ...pathTypeStyle,
  backgroundColor: '#10b981'
};

const disallowedBadgeStyle: React.CSSProperties = {
  ...pathTypeStyle,
  backgroundColor: '#ef4444'
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

interface WebsiteDirectoryRulesCardProps {
  paths: {
    allowed: string[];
    disallowed: string[];
  };
  domain: string;
}

const WebsiteDirectoryRulesCard: React.FC<WebsiteDirectoryRulesCardProps> = ({ paths, domain }) => {
  const [activeTab, setActiveTab] = useState<'allowed' | 'disallowed'>('disallowed');

  const allowedPaths = paths.allowed || [];
  const disallowedPaths = paths.disallowed || [];
  const totalPaths = allowedPaths.length + disallowedPaths.length;

  // Wenn keine spezifischen Pfade vorhanden sind, zeige nichts an
  if (totalPaths === 0) {
    return null;
  }

  const currentPaths = activeTab === 'allowed' ? allowedPaths : disallowedPaths;

  return (
    <div style={containerStyle}>
      <h3 style={sectionTitleStyle}>Verzeichnis-Regeln</h3>
      
      <div style={statsContainerStyle}>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Pfade gesamt</div>
          <div style={statValueStyle}>{totalPaths}</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Erlaubte Pfade</div>
          <div style={{...statValueStyle, color: '#10b981'}}>{allowedPaths.length}</div>
        </div>
        <div style={statItemStyle}>
          <div style={statLabelStyle}>Verbotene Pfade</div>
          <div style={{...statValueStyle, color: '#ef4444'}}>{disallowedPaths.length}</div>
        </div>
      </div>

      <div style={tabContainerStyle}>
        <button 
          style={getTabStyle(activeTab === 'allowed')} 
          onClick={() => setActiveTab('allowed')}
        >
          Erlaubte Pfade ({allowedPaths.length})
        </button>
        <button 
          style={getTabStyle(activeTab === 'disallowed')} 
          onClick={() => setActiveTab('disallowed')}
        >
          Verbotene Pfade ({disallowedPaths.length})
        </button>
      </div>

      <div style={pathListStyle}>
        {currentPaths.length === 0 ? (
          <div style={emptyStateStyle}>
            Keine {activeTab === 'allowed' ? 'erlaubten' : 'verbotenen'} Pfade für {domain} gefunden.
          </div>
        ) : (
          currentPaths.map((path, index) => (
            <div 
              key={index} 
              style={activeTab === 'allowed' ? allowedPathStyle : disallowedPathStyle}
            >
              <span style={pathTextStyle}>{path}</span>
              <span style={activeTab === 'allowed' ? allowedBadgeStyle : disallowedBadgeStyle}>
                {activeTab === 'allowed' ? 'Erlaubt' : 'Verboten'}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{ fontSize: '0.85rem', color: '#666666', fontStyle: 'italic' }}>
        Diese Regeln gelten für alle Bots, die in der robots.txt von {domain} definiert sind.
      </div>
    </div>
  );
};

export default WebsiteDirectoryRulesCard;
