import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.danger}15;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ErrorIcon = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 1.2rem;
  font-weight: bold;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
  font-size: 0.9rem;
`;

interface ErrorMessageProps {
  message: string;
  showIcon?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  showIcon = true 
}) => {
  return (
    <ErrorContainer>
      {showIcon && <ErrorIcon>⚠</ErrorIcon>}
      <ErrorText>{message}</ErrorText>
    </ErrorContainer>
  );
};

export default ErrorMessage;
