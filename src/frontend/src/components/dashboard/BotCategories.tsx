import React from 'react';
import styled from 'styled-components';

const CategoriesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  font-weight: 600;
`;

const CategoriesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}30;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryIcon = styled.div<{ category: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme, category }) => {
    switch (category) {
      case 'searchEngine': return theme.colors.searchEngine;
      case 'seo': return theme.colors.seo;
      case 'aiScraper': return theme.colors.aiScraper;
      case 'other': return theme.colors.other;
      default: return theme.colors.lightText;
    }
  }};
`;

const CategoryLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const CategoryValue = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 1.1rem;
`;

interface BotCategoriesProps {
  categories: {
    searchEngine: number;
    seo: number;
    aiScraper: number;
    other: number;
  };
}

const BotCategories: React.FC<BotCategoriesProps> = ({ categories }) => {
  const categoryLabels = {
    searchEngine: 'Suchmaschinen',
    seo: 'SEO-Tools',
    aiScraper: 'KI/LLM-Scraper',
    other: 'Andere',
  };

  return (
    <CategoriesContainer>
      <SectionTitle>Bot-Kategorien</SectionTitle>
      
      <CategoriesList>
        {Object.entries(categories).map(([key, value]) => (
          <CategoryItem key={key}>
            <CategoryInfo>
              <CategoryIcon category={key} />
              <CategoryLabel>
                {categoryLabels[key as keyof typeof categoryLabels]}
              </CategoryLabel>
            </CategoryInfo>
            <CategoryValue>{value.toLocaleString()}</CategoryValue>
          </CategoryItem>
        ))}
      </CategoriesList>
    </CategoriesContainer>
  );
};

export default BotCategories;
