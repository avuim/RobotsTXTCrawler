import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const HeaderSubtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
  color: ${({ theme }) => theme.colors.white};
`;

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Robots.txt Crawler und Analyzer',
  subtitle = 'Analyse von Robots.txt-Dateien und Bot-Verhalten'
}) => {
  return (
    <HeaderContainer>
      <HeaderTitle>{title}</HeaderTitle>
      {subtitle && <HeaderSubtitle>{subtitle}</HeaderSubtitle>}
    </HeaderContainer>
  );
};

export default Header;
