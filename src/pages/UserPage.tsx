
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const UserPage = () => {
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">SocialPilot</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              Reviews
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-100 min-h-[500px] rounded-md p-8 flex flex-col items-center justify-center">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-medium text-gray-700 mb-4">Hey, {user.firstName}!</h2>
            
            <p className="text-gray-600 mb-3">Welcome to SocialPilot.</p>
            
            <p className="text-gray-600 mb-2">
              This is your dashboard, where you will see a summary of your queued and published posts.
            </p>
            
            <p className="text-gray-600 mb-8">
              Get started by connecting your first account.
            </p>
            
            <div className="flex justify-center mb-8">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Connect Account
              </Button>
            </div>
            
            <div className="flex justify-center">
              <img 
                src="/lovable-uploads/1b1a4bed-f4c5-4cbf-92f9-6d5f40d14fd7.png" 
                alt="Dashboard illustration" 
                className="w-72 h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserPage;
