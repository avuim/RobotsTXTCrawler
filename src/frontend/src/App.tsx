import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles.ts';
import DashboardPage from './components/dashboard/DashboardPage.tsx';
import BotListPage from './components/bots/BotListPage.tsx';
import BotDetailPage from './components/bots/BotDetailPage.tsx';
import WebsiteListPage from './components/websites/WebsiteListPage.tsx';
import WebsiteDetailPage from './components/websites/WebsiteDetailPage.tsx';

// Bestimme basename basierend auf der Umgebung
const getBasename = () => {
  // In Entwicklung (localhost) kein basename verwenden
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  // In Produktion (GitHub Pages) basename verwenden
  return '/RobotsTXTCrawler';
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router basename={getBasename()}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bots" element={<BotListPage />} />
          <Route path="/bots/:botName" element={<BotDetailPage />} />
          <Route path="/websites" element={<WebsiteListPage />} />
          <Route path="/websites/:domain" element={<WebsiteDetailPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
