
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';

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
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
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
              src="/lovable-uploads/f84b90e0-797b-47ee-813b-d628b15a655c.png" 
              alt="Dashboard illustration" 
              className="w-64 h-auto"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
