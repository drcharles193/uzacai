
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from './AppSidebar';
import { Bell, Settings, Info, Calendar, Calendar } from 'lucide-react';
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
  const location = useLocation();
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('socialAI_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    console.log("DashboardLayout mounted, current path:", location.pathname);
  }, [location.pathname]);
  
  // If no user data found, redirect to home
  if (!user) {
    return <Navigate to="/" />;
  }
  
  // Calculate trial expiry date (30 days from signup)
  const signupDate = new Date(user.signupDate);
  const expiryDate = new Date(signupDate);
  expiryDate.setDate(expiryDate.getDate() + 30);
  
  // Format date to display (29th Mar, 2025 format)
  const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // Add ordinal suffix to day
  const day = expiryDate.getDate();
  const ordinalSuffix = 
    day % 10 === 1 && day !== 11 ? 'st' :
    day % 10 === 2 && day !== 12 ? 'nd' :
    day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const formattedDay = `${day}${ordinalSuffix}`;
  const finalFormattedDate = formattedExpiryDate.replace(
    day.toString(), 
    formattedDay
  );
  
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Top notification bar - matching the blue bar in the image */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 text-center flex justify-between items-center px-4">
            <div className="flex items-center gap-2">
              <Info size={16} />
              <span>Your Ultimate Trial Expires On {finalFormattedDate}.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white hover:underline">Upgrade your account now</a>
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-blue-700">
                Schedule a demo
              </Button>
            </div>
          </div>
          
          {/* Top navigation bar */}
          <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-lg font-medium mr-6">SocialPilot</div>
              <div className="flex border-b-2 border-yellow-400 pb-1">
                <a href="#" className="font-medium">Reviews</a>
              </div>
            </div>
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
          
          {/* Main content */}
          <div className="flex-1 p-8 bg-slate-100">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
