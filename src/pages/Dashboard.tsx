
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('socialAI_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-4">Hey, {user.firstName}!</h1>
            <p className="text-gray-600 mb-2">Welcome to SocialPilot.</p>
            <p className="text-gray-600 mb-1">
              This is your dashboard, where you will see a summary of your queued and published posts.
            </p>
            <p className="text-gray-600">
              Get started by connecting your first account.
            </p>
            
            <Button className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <span>Connect Account</span>
            </Button>
          </div>
          
          <div className="flex-shrink-0">
            <img 
              src="/lovable-uploads/4df2de78-9efe-4a28-b1c0-e1a6887e82ad.png" 
              alt="Dashboard illustration" 
              className="w-64 h-auto"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Connect Your Accounts</h3>
              <p className="text-gray-500 text-sm">Link your social media profiles to schedule and post content.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Create Your First Post</h3>
              <p className="text-gray-500 text-sm">Start creating and scheduling content across your platforms.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2">Explore Analytics</h3>
              <p className="text-gray-500 text-sm">Track performance metrics for your social media accounts.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
