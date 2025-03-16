
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar';
import { Bell, Settings, Info } from 'lucide-react';
import { Button } from './ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  signupDate: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('socialAI_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  // If no user data found, redirect to home
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Calculate trial expiry date (30 days from signup)
  const signupDate = new Date(user.signupDate);
  const expiryDate = new Date(signupDate);
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  // Format date to display
  const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top notification bar */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-2 text-center flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <Info size={16} />
              <span>Your Ultimate Trial Expires On {formattedExpiryDate}.</span>
            </div>
            <Button variant="outline" size="sm" className="text-white border-white hover:bg-blue-700">
              Upgrade your account now
            </Button>
          </div>
          
          {/* Top navigation bar */}
          <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
            <div className="text-lg font-medium">SocialPilot</div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                {user.firstName.charAt(0)}
              </div>
            </div>
          </div>
          
          {/* Main content with overflow scroll */}
          <div className="flex-1 p-8 bg-slate-100 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
