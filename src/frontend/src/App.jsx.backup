import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles.ts';

// Einfache Seitenkomponenten
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/summary')
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
      })
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Daten:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Willkommen beim Robots.txt Crawler und Analyzer!</p>
      <p>Der Crawler wurde erfolgreich gestartet und läuft im Hintergrund.</p>
      <p>API-Server läuft auf Port 3001.</p>
      
      {loading && <p>Lade Daten...</p>}
      {error && <p>Fehler beim Laden der Daten: {error}</p>}
      
      {summary && (
        <div>
          <h2>Zusammenfassung</h2>
          <p>Letzte Aktualisierung: {new Date(summary.lastUpdated).toLocaleString()}</p>
          
          <h3>Statistiken</h3>
          <ul>
            <li>Anzahl Bots: {summary.totalBots}</li>
            <li>Anzahl Websites: {summary.totalWebsites}</li>
          </ul>
          
          <h3>Bot-Kategorien</h3>
          <ul>
            <li>Suchmaschinen: {summary.botCategories.searchEngine}</li>
            <li>SEO-Tools: {summary.botCategories.seo}</li>
            <li>KI/LLM-Scraper: {summary.botCategories.aiScraper}</li>
            <li>Andere: {summary.botCategories.other}</li>
          </ul>
          
          <h3>Top 5 Bots</h3>
          <ul>
            {summary.topBots.slice(0, 5).map((bot, index) => (
              <li key={index}>
                <strong>{bot.name}</strong> ({bot.category}): 
                {bot.totalWebsites} Websites 
                ({bot.allowedWebsites} erlaubt, {bot.disallowedWebsites} verboten)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const BotList = () => {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/bots')
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
      })
      .then(data => {
        setBots(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Bots:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Bot-Liste</h1>
      
      {loading && <p>Lade Daten...</p>}
      {error && <p>Fehler beim Laden der Daten: {error}</p>}
      
      {bots && bots.length > 0 ? (
        <div>
          <p>Insgesamt {bots.length} Bots gefunden.</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Kategorie</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Websites</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Erlaubt</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Verboten</th>
              </tr>
            </thead>
            <tbody>
              {bots.map((bot, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <a href={`/bots/${encodeURIComponent(bot.name)}`} style={{ textDecoration: 'none', color: '#3498db' }}>
                      {bot.name}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem' }}>{bot.category}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{bot.totalWebsites}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{bot.allowedWebsites}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{bot.disallowedWebsites}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Keine Bots gefunden.</p>
      )}
    </div>
  );
};

const BotDetail = () => {
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extrahiere den Bot-Namen aus der URL
  const botName = window.location.pathname.split('/').pop();
  
  useEffect(() => {
    if (!botName) return;
    
    fetch(`http://localhost:3001/api/bots/${encodeURIComponent(botName)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
      })
      .then(data => {
        setBot(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Bot-Details:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [botName]);

  return (
    <div>
      <h1>Bot-Details</h1>
      
      {loading && <p>Lade Daten...</p>}
      {error && <p>Fehler beim Laden der Daten: {error}</p>}
      
      {bot ? (
        <div>
          <h2>{bot.name}</h2>
          
          {bot.owner && <p><strong>Betreiber:</strong> {bot.owner}</p>}
          {bot.description && <p><strong>Beschreibung:</strong> {bot.description}</p>}
          {bot.website && (
            <p>
              <strong>Website:</strong>{' '}
              <a href={bot.website} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>
                {bot.website}
              </a>
            </p>
          )}
          
          <p><strong>Kategorie:</strong> {bot.category}</p>
          
          <h3>Statistiken</h3>
          <ul>
            <li><strong>Websites gesamt:</strong> {Object.values(bot.monthlyStats).reduce((sum, stats) => sum + stats.totalWebsites, 0)}</li>
            <li><strong>Erlaubt auf:</strong> {Object.values(bot.monthlyStats).reduce((sum, stats) => sum + stats.allowedWebsites, 0)} Websites</li>
            <li><strong>Verboten auf:</strong> {Object.values(bot.monthlyStats).reduce((sum, stats) => sum + stats.disallowedWebsites, 0)} Websites</li>
          </ul>
          
          <h3>Monatliche Statistiken</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Monat</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Websites gesamt</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Erlaubt</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Verboten</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(bot.monthlyStats).map(([month, stats], index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{month}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{stats.totalWebsites}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{stats.allowedWebsites}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{stats.disallowedWebsites}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3>Beispiel-Websites</h3>
          <div style={{ display: 'flex', marginTop: '1rem' }}>
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <h4>Erlaubt auf</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 1.5rem' }}>
                {Object.values(bot.monthlyStats).flatMap(stats => stats.websites.allowed).slice(0, 10).map((domain, index) => (
                  <li key={index}>
                    <a href={`/websites/${encodeURIComponent(domain)}`} style={{ color: '#3498db' }}>
                      {domain}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h4>Verboten auf</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 1.5rem' }}>
                {Object.values(bot.monthlyStats).flatMap(stats => stats.websites.disallowed).slice(0, 10).map((domain, index) => (
                  <li key={index}>
                    <a href={`/websites/${encodeURIComponent(domain)}`} style={{ color: '#3498db' }}>
                      {domain}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p>Bot nicht gefunden oder keine Daten verfügbar.</p>
      )}
    </div>
  );
};

const WebsiteList = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/websites')
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
      })
      .then(data => {
        setWebsites(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Websites:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Website-Liste</h1>
      
      {loading && <p>Lade Daten...</p>}
      {error && <p>Fehler beim Laden der Daten: {error}</p>}
      
      {websites && websites.length > 0 ? (
        <div>
          <p>Insgesamt {websites.length} Websites analysiert.</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Domain</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Bots</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Erlaubt</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Verboten</th>
                <th style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Zuletzt aktualisiert</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((website, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>
                    <a href={`/websites/${encodeURIComponent(website.domain)}`} style={{ textDecoration: 'none', color: '#3498db' }}>
                      {website.domain}
                    </a>
                  </td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{website.totalBots}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{website.allowedBots}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{website.disallowedBots}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                    {website.lastUpdated ? new Date(website.lastUpdated).toLocaleDateString() : 'Unbekannt'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Keine Websites gefunden.</p>
      )}
    </div>
  );
};

const WebsiteDetail = () => {
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Extrahiere die Domain aus der URL
  const domain = window.location.pathname.split('/').pop();
  
  useEffect(() => {
    if (!domain) return;
    
    fetch(`http://localhost:3001/api/websites/${encodeURIComponent(domain)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
      })
      .then(data => {
        setWebsite(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Website-Details:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [domain]);

  return (
    <div>
      <h1>Website-Details</h1>
      
      {loading && <p>Lade Daten...</p>}
      {error && <p>Fehler beim Laden der Daten: {error}</p>}
      
      {website ? (
        <div>
          <h2>{website.domain}</h2>
          
          <p><strong>Zuletzt aktualisiert:</strong> {new Date(website.lastUpdated).toLocaleString()}</p>
          
          <h3>Statistiken</h3>
          <ul>
            <li><strong>Bots gesamt:</strong> {website.totalBots}</li>
            <li><strong>Erlaubte Bots:</strong> {website.allowedBots}</li>
            <li><strong>Verbotene Bots:</strong> {website.disallowedBots}</li>
          </ul>
          
          <h3>Robots.txt Inhalt</h3>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            overflowX: 'auto',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {website.robotsTxt}
          </pre>
          
          <h3>Bot-Regeln</h3>
          <div style={{ display: 'flex', marginTop: '1rem' }}>
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <h4>Erlaubte Bots</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 1.5rem' }}>
                {website.bots && website.bots.allowed && website.bots.allowed.length > 0 ? (
                  website.bots.allowed.map((bot, index) => (
                    <li key={index}>
                      <a href={`/bots/${encodeURIComponent(bot)}`} style={{ color: '#3498db' }}>
                        {bot}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>Keine erlaubten Bots definiert</li>
                )}
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h4>Verbotene Bots</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 1.5rem' }}>
                {website.bots && website.bots.disallowed && website.bots.disallowed.length > 0 ? (
                  website.bots.disallowed.map((bot, index) => (
                    <li key={index}>
                      <a href={`/bots/${encodeURIComponent(bot)}`} style={{ color: '#3498db' }}>
                        {bot}
                      </a>
                    </li>
                  ))
                ) : (
                  <li>Keine verbotenen Bots definiert</li>
                )}
              </ul>
            </div>
          </div>
          
          <h3>Pfad-Regeln</h3>
          <div style={{ display: 'flex', marginTop: '1rem' }}>
            <div style={{ flex: 1, marginRight: '1rem' }}>
              <h4>Erlaubte Pfade</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 1.5rem' }}>
                {website.paths && website.paths.allowed ? 
                  website.paths.allowed.map((path, index) => (
                    <li key={index}>{path}</li>
                  )) : 
                  <li>Keine erlaubten Pfade definiert</li>
                }
              </ul>
            </div>
            <div style={{ flex: 1 }}>
              <h4>Verbotene Pfade</h4>
              <ul style={{ maxHeight: '200px', overflowY: 'auto', padding: '0 0 0 1.5rem' }}>
                {website.paths && website.paths.disallowed ? 
                  website.paths.disallowed.map((path, index) => (
                    <li key={index}>{path}</li>
                  )) : 
                  <li>Keine verbotenen Pfade definiert</li>
                }
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p>Website nicht gefunden oder keine Daten verfügbar.</p>
      )}
    </div>
  );
};

const Trends = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/trends')
      .then(response => {
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        return response.json();
      })
      .then(data => {
        setTrends(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Abrufen der Trends:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Trends</h1>
      
      {loading && <p>Lade Daten...</p>}
      {error && <p>Fehler beim Laden der Daten: {error}</p>}
      
      {trends && trends.months && trends.months.length > 0 ? (
        <div>
          <h2>Monatliche Trends</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Monat</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Websites</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Bots</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Suchmaschinen</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>SEO-Tools</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>KI/LLM-Scraper</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Andere</th>
              </tr>
            </thead>
            <tbody>
              {trends.months.map((month, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '0.5rem' }}>{month.month}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{month.totalWebsites}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{month.totalBots}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{month.botCategories.searchEngine}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{month.botCategories.seo}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{month.botCategories.aiScraper}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{month.botCategories.other}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3>Trends für KI/LLM-Scraper</h3>
          <p>Anzahl der Websites, die KI/LLM-Scraper in ihrer robots.txt erwähnen:</p>
          <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            {trends.months.map((month, index) => (
              <div key={index} style={{ display: 'inline-block', marginRight: '1rem' }}>
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>{month.month}</div>
                <div 
                  style={{ 
                    width: '30px', 
                    backgroundColor: '#e74c3c', 
                    height: `${Math.max(20, month.botCategories.aiScraper * 2)}px`,
                    marginTop: '5px'
                  }} 
                />
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>{month.botCategories.aiScraper}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Keine Trend-Daten verfügbar.</p>
      )}
    </div>
  );
};

// Einfache Layout-Komponenten
const Header = () => (
  <header style={{ backgroundColor: '#2c3e50', color: 'white', padding: '1rem' }}>
    <h1>Robots.txt Crawler und Analyzer</h1>
  </header>
);

const Sidebar = () => (
  <aside style={{ width: '250px', backgroundColor: 'white', padding: '1rem', borderRight: '1px solid #ddd' }}>
    <nav>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '0.5rem' }}><a href="/" style={{ textDecoration: 'none', color: '#3498db' }}>Dashboard</a></li>
        <li style={{ marginBottom: '0.5rem' }}><a href="/bots" style={{ textDecoration: 'none', color: '#3498db' }}>Alle Bots</a></li>
        <li style={{ marginBottom: '0.5rem' }}><a href="/websites" style={{ textDecoration: 'none', color: '#3498db' }}>Alle Websites</a></li>
        <li style={{ marginBottom: '0.5rem' }}><a href="/trends" style={{ textDecoration: 'none', color: '#3498db' }}>Trends</a></li>
      </ul>
    </nav>
  </aside>
);

const Footer = () => (
  <footer style={{ backgroundColor: '#2c3e50', color: 'white', padding: '1rem', textAlign: 'center' }}>
    <p>© 2025 Robots.txt Crawler und Analyzer</p>
  </footer>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <div className="app-container">
          <Header />
          <div className="main-content" style={{ display: 'flex', flex: 1 }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '1rem' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bots" element={<BotList />} />
                <Route path="/bots/:botName" element={<BotDetail />} />
                <Route path="/websites" element={<WebsiteList />} />
                <Route path="/websites/:domain" element={<WebsiteDetail />} />
                <Route path="/trends" element={<Trends />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
