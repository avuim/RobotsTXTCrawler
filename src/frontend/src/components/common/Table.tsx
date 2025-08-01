import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  background-color: ${({ theme }) => theme.colors.white};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  table-layout: fixed;
`;

const TableHeader = styled.thead`
  background-color: ${({ theme }) => theme.colors.background};
`;

const TableHeaderCell = styled.th<{ align?: 'left' | 'center' | 'right'; width?: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: ${({ align }) => align || 'left'};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  width: ${({ width }) => width || 'auto'};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.background}50;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const TableCell = styled.td<{ align?: 'left' | 'center' | 'right' }>`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: ${({ align }) => align || 'left'};
  color: ${({ theme }) => theme.colors.text};
`;

const TableLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
}

function Table<T extends Record<string, any>>({ 
  data, 
  columns, 
  onRowClick 
}: TableProps<T>) {
  const getCellValue = (item: T, column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item);
    }
    return item[column.key as keyof T];
  };

  return (
    <TableContainer>
      <StyledTable>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHeaderCell key={index} align={column.align} width={column.width}>
                {column.header}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow 
              key={rowIndex}
              onClick={() => onRowClick?.(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} align={column.align}>
                  {getCellValue(item, column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </TableContainer>
  );
}

export { TableLink };
export default Table;
