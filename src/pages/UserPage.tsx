
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  signupDate: string;
}

const UserPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('socialAI_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Change firstName to Charles to match the image
      const modifiedUser = {
        ...parsedUser,
        firstName: "Charles"
      };
      setUser(modifiedUser);
      // Also update localStorage for consistency
      localStorage.setItem('socialAI_user', JSON.stringify(modifiedUser));
    }
    
    console.log("UserPage mounted");
  }, []);
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <DashboardLayout>
      <div className="flex flex-col max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Hey, {user.firstName}!</h1>
              <p className="text-gray-600 mb-2">Welcome to SocialPilot.</p>
              <p className="text-gray-600 mb-1">
                This is your dashboard, where you will see a summary of your queued and published posts.
              </p>
              <p className="text-gray-600 mb-4">
                Get started by connecting your first account.
              </p>
              
              <Button 
                className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <span>Connect Account</span>
              </Button>
            </div>
            
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/1abe9bda-c44f-4d9e-b9c1-d046bbb9d0d3.png" 
                alt="Dashboard illustration" 
                className="w-64 h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserPage;
