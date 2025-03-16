
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Calendar, AlertTriangle, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SummaryCardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, count, label }) => (
  <Card className="flex-1">
    <CardContent className="p-6 flex items-center gap-4">
      <div className="text-blue-500">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </CardContent>
  </Card>
);

const PublishingSummary: React.FC = () => {
  // Sample data for the chart
  const data = [
    { name: 'Feb 28', posts: 0 },
    { name: 'Mar 04', posts: 0 },
    { name: 'Mar 09', posts: 0 },
    { name: 'Mar 14', posts: 0 },
    { name: 'Mar 19', posts: 0 },
    { name: 'Mar 24', posts: 0 },
    { name: 'Mar 29', posts: 0 },
  ];

  return (
    <div className="w-full space-y-6">
      <h2 className="text-xl font-semibold">Publishing Summary</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          icon={<Clock size={24} />} 
          count={0} 
          label="Queued Posts" 
        />
        <SummaryCard 
          icon={<BarChart3 size={24} />} 
          count={0} 
          label="Delivered (30 Days)" 
        />
        <SummaryCard 
          icon={<Calendar size={24} />} 
          count={0} 
          label="Unscheduled Posts" 
        />
        <SummaryCard 
          icon={<AlertTriangle size={24} />} 
          count={0} 
          label="Error Posts" 
        />
      </div>
      
      {/* Chart */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Total Posts: 0</h3>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} domain={[0, 10]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="posts" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default PublishingSummary;
