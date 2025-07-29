import React from 'react';
import styled from 'styled-components';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { getCategoryName, getAllCategoryIds } from '../../utils/categoryUtils.ts';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const NavLink = styled(RouterNavLink)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.secondary};
  }
  
  &.active {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.white};
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.lightText};
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <NavList>
        <NavItem>
          <NavLink to="/" end>Dashboard</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/bots">Alle Bots</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/websites">Alle Websites</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/trends">Trends</NavLink>
        </NavItem>
      </NavList>
      
      <SectionTitle>Bot-Kategorien</SectionTitle>
      <NavList>
        {getAllCategoryIds().map(categoryId => (
          <NavItem key={categoryId}>
            <NavLink to={`/bots/category/${categoryId}`}>
              {getCategoryName(categoryId)}
            </NavLink>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
