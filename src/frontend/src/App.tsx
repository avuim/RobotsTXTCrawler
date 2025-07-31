import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles.ts';
import DashboardPage from './components/dashboard/DashboardPage.tsx';
import BotListPage from './components/bots/BotListPage.tsx';
import BotDetailPage from './components/bots/BotDetailPage.tsx';
import WebsiteListPage from './components/websites/WebsiteListPage.tsx';
import WebsiteDetailPage from './components/websites/WebsiteDetailPage.tsx';
import TrendsPage from './components/trends/TrendsPage.tsx';


const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bots" element={<BotListPage />} />
          <Route path="/bots/:botName" element={<BotDetailPage />} />
          <Route path="/websites" element={<WebsiteListPage />} />
          <Route path="/websites/:domain" element={<WebsiteDetailPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
