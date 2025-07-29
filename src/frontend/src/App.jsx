import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles.ts';

// Einfache Seitenkomponenten
const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Willkommen beim Robots.txt Crawler und Analyzer!</p>
    <p>Der Crawler wurde erfolgreich gestartet und läuft im Hintergrund.</p>
    <p>API-Server läuft auf Port 3001.</p>
    <p>Hier werden in Zukunft Statistiken und Diagramme angezeigt.</p>
  </div>
);

const BotList = () => (
  <div>
    <h1>Bot-Liste</h1>
    <p>Hier werden alle gefundenen Bots angezeigt.</p>
  </div>
);

const BotDetail = () => (
  <div>
    <h1>Bot-Details</h1>
    <p>Hier werden Details zu einem bestimmten Bot angezeigt.</p>
  </div>
);

const WebsiteList = () => (
  <div>
    <h1>Website-Liste</h1>
    <p>Hier werden alle analysierten Websites angezeigt.</p>
  </div>
);

const WebsiteDetail = () => (
  <div>
    <h1>Website-Details</h1>
    <p>Hier werden Details zu einer bestimmten Website angezeigt.</p>
  </div>
);

const Trends = () => (
  <div>
    <h1>Trends</h1>
    <p>Hier werden zeitliche Trends angezeigt.</p>
  </div>
);

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
