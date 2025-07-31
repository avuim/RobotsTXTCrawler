import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.lightText};
  font-size: 0.9rem;
`;

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Lade Daten...', 
  size = 'medium' 
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return '20px';
      case 'large': return '60px';
      default: return '40px';
    }
  };

  return (
    <LoadingContainer>
      <Spinner style={{ width: getSpinnerSize(), height: getSpinnerSize() }} />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
};

export default Loading;
