
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AppSidebar from '@/components/AppSidebar';

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract page name from the URL path
  const getPageName = () => {
    const path = location.pathname.substring(1); // Remove the leading slash
    return path.charAt(0).toUpperCase() + path.slice(1); // Capitalize first letter
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b px-6 py-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashin')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold ml-2">{getPageName()}</h1>
        </div>
        
        <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
          <div className="bg-[#689675]/10 rounded-full p-8 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#689675" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
          <p className="text-gray-600 max-w-md mb-8">
            We're working hard to bring you the {getPageName()} feature.
            It will be available in the near future.
          </p>
          <Button onClick={() => navigate('/dashin')} className="bg-[#689675] hover:bg-[#5a8164]">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
