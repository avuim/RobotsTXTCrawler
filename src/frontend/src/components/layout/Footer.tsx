import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-size: 0.9rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Copyright = styled.div`
  opacity: 0.8;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.white};
  }
`;

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          &copy; {currentYear} Robots.txt Analyzer
        </Copyright>
        <FooterLinks>
          <FooterLink href="https://github.com/avuim/RobotsTXTCrawler" target="_blank" rel="noopener noreferrer">
            GitHub
          </FooterLink>
          <FooterLink href="#" target="_blank" rel="noopener noreferrer">
            Dokumentation
          </FooterLink>
          <FooterLink href="#" target="_blank" rel="noopener noreferrer">
            Datenschutz
          </FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
