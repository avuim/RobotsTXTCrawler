import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.5rem;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.heading};
  
  &:hover {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.9;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  font-weight: 500;
  
  &:hover {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.8;
  }
  
  &.active {
    border-bottom: 2px solid ${({ theme }) => theme.colors.white};
  }
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">Robots.txt Analyzer</Logo>
        <Nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/bots">Bots</NavLink>
          <NavLink to="/websites">Websites</NavLink>
          <NavLink to="/trends">Trends</NavLink>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
