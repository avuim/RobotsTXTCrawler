import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin: 1.5rem 0;
`;

const ChartTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
`;

interface MonthlyStatsData {
  month: string;
  allowedWebsites: number;
  disallowedWebsites: number;
  totalWebsites: number;
  totalBots?: number;
}

interface MonthlyStatsChartProps {
  monthlyStats: Record<string, {
    totalWebsites: number;
    allowedWebsites: number;
    disallowedWebsites: number;
    totalBots?: number;
    websites: {
      allowed: string[];
      disallowed: string[];
    };
  }>;
}

const MonthlyStatsChart: React.FC<MonthlyStatsChartProps> = ({ monthlyStats }) => {
  // Transformiere die monthlyStats in Chart-Daten
  const chartData: MonthlyStatsData[] = Object.entries(monthlyStats)
    .map(([month, stats]) => ({
      month: formatMonth(month),
      allowedWebsites: stats.allowedWebsites,
      disallowedWebsites: stats.disallowedWebsites,
      totalWebsites: stats.totalWebsites,
      totalBots: stats.totalBots
    }))
    .sort((a, b) => a.month.localeCompare(b.month)); // Sortiere chronologisch

  // Formatiere Monat für bessere Anzeige
  function formatMonth(monthStr: string): string {
    try {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return monthStr;
    }
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{`${label}`}</p>
          <p style={{ margin: '0 0 3px 0', color: '#10b981' }}>
            {`Erlaubte Bots: ${data.allowedWebsites.toLocaleString()}`}
          </p>
          <p style={{ margin: '0 0 3px 0', color: '#ef4444' }}>
            {`Verbotene Bots: ${data.disallowedWebsites.toLocaleString()}`}
          </p>
          {data.totalBots && (
            <p style={{ margin: '0 0 3px 0', color: '#3b82f6' }}>
              {`Anzahl Bots: ${data.totalBots.toLocaleString()}`}
            </p>
          )}
          <p style={{ margin: '0', color: '#6b7280' }}>
            {`Websites: ${data.totalWebsites.toLocaleString()}`}
          </p>
          <p style={{ margin: '3px 0 0 0', color: '#6b7280', fontSize: '0.9em' }}>
            {`Erlaubt-Quote: ${data.allowedWebsites + data.disallowedWebsites > 0 ? ((data.allowedWebsites / (data.allowedWebsites + data.disallowedWebsites)) * 100).toFixed(1) : 0}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <ChartContainer>
        <ChartTitle>Monatlicher Verlauf</ChartTitle>
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          Keine monatlichen Daten verfügbar
        </p>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>Monatlicher Verlauf - Erlaubte vs. Verbotene Bots</ChartTitle>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#3b82f6"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="allowedWebsites" 
            name="Erlaubte Bots"
            fill="#10b981" 
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            yAxisId="left"
            dataKey="disallowedWebsites" 
            name="Verbotene Bots"
            fill="#ef4444" 
            radius={[2, 2, 0, 0]}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="totalBots" 
            name="Anzahl Bots"
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default MonthlyStatsChart;
