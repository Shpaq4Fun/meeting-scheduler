import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { User } from '../types';
import { getCitationDataForUsers, type CitationData } from '../services/scholarService';
import './ChartView.css';
// import { curveCatmullRomOpen } from 'd3-shape';

interface ChartViewProps {
  selectedUsers: User[];
}

// Map Tailwind color classes to Hex colors for Recharts
const colorMap: Record<string, string> = {
  'bg-gray-700': '#374151',
  'bg-pink-600': '#ff0080ff',
  'bg-pink-500': '#ec4899',
  'bg-blue-900': '#1e3a8a',
  'bg-red-900': '#7f1d1d',
  'bg-green-900': '#064e3b',
  'bg-cyan-900': '#164e63',
  'bg-indigo-900': '#312e81',
  'bg-pink-900': '#831843',
  'bg-purple-700': '#7e22ce',
  'bg-teal-900': '#134e4a',
  'bg-cyan-500': '#06b6d4',
  'bg-pink-700': '#be185d',
  'bg-teal-700': '#0f766e',
  'bg-cyan-700': '#0e7490',
  'bg-yellow-900': '#713f12',
  'bg-indigo-500': '#6366f1',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const filteredPayload = payload.filter((entry) => entry.name !== 'None');
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Rok: ${label}`}</p>
        {filteredPayload.map((entry: any, index: number) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartView: React.FC<ChartViewProps> = ({ selectedUsers }) => {
  const [data, setData] = React.useState<CitationData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Filter users who actually have citation data (scholarID !== 'None')
  const usersWithCharts = useMemo(() => {
    return selectedUsers.filter(user => user.scholarID && user.scholarID !== 'None');
  }, [selectedUsers]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (usersWithCharts.length === 0) {
        setData([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await getCitationDataForUsers(selectedUsers);
        setData(result);
      } catch (error) {
        console.error("Failed to fetch citation data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedUsers, usersWithCharts]);

  if (usersWithCharts.length === 0) {
    return (
      <div className="chart-container flex items-center justify-center">
        <p className="text-gray-400 text-xl">Select users to see citation data.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="chart-container flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400 text-xl">Fetching citation data from Google Scholar...</p>
      </div>
    );
  }

  // const cardinal = curveCatmullRomOpen.alpha(0.5);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">Citations from Google Scholar</h2>
      </div>
      <div className="flex-grow w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={true} />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {usersWithCharts.map(user => (
              <Line
                key={user.id}
                type="basisOpen"
                dataKey={user.id}
                name={"None"}
                stroke={colorMap[user.color] || '#849ad8ff'}
                strokeWidth={3}
                animationDuration={1500}
                legendType='none'
              />
            ))}
            
            {usersWithCharts.map(user => (
              <Line
                key={user.id}
                type="linear"
                dataKey={user.id}
                name={user.name}
                stroke={colorMap[user.color] || '#849ad8ff'}
                strokeWidth={1}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
