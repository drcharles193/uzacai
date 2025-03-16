
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, FileCheck, Clock, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for the chart
const getChartData = () => {
  const today = new Date();
  const data = [];
  
  // Generate dates for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Create random data point, with one spike on day 15
    let posts = 0;
    if (i === 15) posts = 1; // Single post on day 15
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      posts
    });
  }
  
  return data;
};

const chartData = getChartData();

const PublishingSummary: React.FC = () => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4">Publishing Summary</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Queued Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-gray-500">Delivered (30 Days)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Unscheduled Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Error Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Trending Chart */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Total Posts: 1</h3>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  tickMargin={10}
                  minTickGap={20}
                />
                <YAxis 
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="#689675" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8, fill: "#689675" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishingSummary;
