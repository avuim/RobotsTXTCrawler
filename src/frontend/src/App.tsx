import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle, theme } from './styles';
import { Header, Footer, Sidebar } from './components/layout';
import {
  Dashboard,
  BotList,
  BotDetail,
  WebsiteList,
  WebsiteDetail,
  Trends
} from './pages';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <div className="app-container">
          <Header />
          <div className="main-content">
            <Sidebar />
            <main>
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
