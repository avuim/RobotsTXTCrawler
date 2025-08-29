import { createGlobalStyle } from 'styled-components';

// Theme-Definition
export const theme = {
  colors: {
    primary: '#2c3e50',
    secondary: '#3498db',
    accent: '#e74c3c',
    background: '#f5f5f5',
    text: '#333333',
    lightText: '#666666',
    border: '#dddddd',
    success: '#2ecc71',
    warning: '#f39c12',
    danger: '#e74c3c',
    white: '#ffffff',
    searchEngine: '#3498db',
    seo: '#2ecc71',
    aiScraper: '#e74c3c',
    aiSearchCrawler: '#9b59b6',
    aiAssistant: '#1abc9c',
    aiAgent: '#e67e22',
    archiver: '#34495e',
    socialMedia: '#e91e63',
    other: '#f39c12'
  },
  fonts: {
    main: "'Roboto', sans-serif",
    heading: "'Montserrat', sans-serif"
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    largeDesktop: '1200px'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
    round: '50%'
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    large: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  transitions: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease'
  }
};

// Globale Styles
export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: ${({ theme }) => theme.fonts.main};
    font-size: 16px;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  a {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  button {
    cursor: pointer;
    font-family: ${({ theme }) => theme.fonts.main};
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .main-content {
    display: flex;
    flex: 1;
  }
  
  main {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.lg};
  }
  
  .card {
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadows.small};
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
  
  .section-title {
    font-size: 1.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    padding-bottom: ${({ theme }) => theme.spacing.sm};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
  
  .search-box {
    display: flex;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    
    input {
      flex: 1;
      padding: ${({ theme }) => theme.spacing.md};
      border: 1px solid ${({ theme }) => theme.colors.border};
      border-radius: ${({ theme }) => theme.borderRadius.medium};
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.secondary};
      }
    }
    
    button {
      margin-left: ${({ theme }) => theme.spacing.sm};
      padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
      background-color: ${({ theme }) => theme.colors.secondary};
      color: ${({ theme }) => theme.colors.white};
      border: none;
      border-radius: ${({ theme }) => theme.borderRadius.medium};
      transition: background-color ${({ theme }) => theme.transitions.fast};
      
      &:hover {
        background-color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.xl};
  }
  
  .error {
    color: ${({ theme }) => theme.colors.danger};
    padding: ${({ theme }) => theme.spacing.md};
    border: 1px solid ${({ theme }) => theme.colors.danger};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    .main-content {
      flex-direction: column;
    }
  }
`;
