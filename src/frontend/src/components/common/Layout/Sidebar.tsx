import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.small};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const SidebarTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  font-weight: 600;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: block;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.white : theme.colors.text};
  background-color: ${({ theme, $isActive }) => $isActive ? theme.colors.secondary : 'transparent'};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all ${({ theme }) => theme.transitions.fast};
  font-weight: ${({ $isActive }) => $isActive ? '500' : '400'};
  
  &:hover {
    background-color: ${({ theme, $isActive }) => 
      $isActive ? theme.colors.secondary : theme.colors.background};
    color: ${({ theme, $isActive }) => 
      $isActive ? theme.colors.white : theme.colors.primary};
  }
`;

const NavIcon = styled.span`
  margin-right: ${({ theme }) => theme.spacing.sm};
  font-size: 1.1rem;
`;

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navigationItems: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/bots', label: 'Alle Bots', icon: '🤖' },
  { path: '/websites', label: 'Alle Websites', icon: '🌐' },
  { path: '/trends', label: 'Trends', icon: '📈' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <SidebarContainer>
      <SidebarTitle>Navigation</SidebarTitle>
      <nav>
        <NavList>
          {navigationItems.map((item) => (
            <NavItem key={item.path}>
              <NavLink 
                to={item.path} 
                $isActive={location.pathname === item.path}
              >
                <NavIcon>{item.icon}</NavIcon>
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </nav>
    </SidebarContainer>
  );
};

export default Sidebar;
