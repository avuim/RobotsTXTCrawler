import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  margin-top: auto;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  margin: 0 ${({ theme }) => theme.spacing.sm};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
`;

interface FooterProps {
  showLinks?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showLinks = true }) => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterText>
        © {currentYear} Robots.txt Crawler und Analyzer
        {showLinks && (
          <>
            {' | '}
            <FooterLink href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </FooterLink>
            {' | '}
            <FooterLink href="/api/docs" target="_blank" rel="noopener noreferrer">
              API Docs
            </FooterLink>
          </>
        )}
      </FooterText>
    </FooterContainer>
  );
};

export default Footer;
