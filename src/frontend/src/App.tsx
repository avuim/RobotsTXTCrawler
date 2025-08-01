import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles.ts';
import DashboardPage from './components/dashboard/DashboardPage.tsx';
import BotListPage from './components/bots/BotListPage.tsx';
import BotDetailPage from './components/bots/BotDetailPage.tsx';
import WebsiteListPage from './components/websites/WebsiteListPage.tsx';
import WebsiteDetailPage from './components/websites/WebsiteDetailPage.tsx';

// Verwende einheitlich /RobotsTXTCrawler basename für alle Umgebungen
const getBasename = () => {
  console.log('Using unified basename: /RobotsTXTCrawler');
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
