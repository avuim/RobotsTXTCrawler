import React from 'react';
import styled from 'styled-components';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import Footer from './Footer.tsx';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background};
  overflow-y: auto;
`;

const PageTitle = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2rem;
  font-weight: 600;
`;

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  pageTitle,
  headerTitle,
  headerSubtitle
}) => {
  return (
    <AppContainer>
      <Header title={headerTitle} subtitle={headerSubtitle} />
      <MainContent>
        <Sidebar />
        <ContentArea>
          {pageTitle && <PageTitle>{pageTitle}</PageTitle>}
          {children}
        </ContentArea>
      </MainContent>
      <Footer />
    </AppContainer>
  );
};

export default Layout;
