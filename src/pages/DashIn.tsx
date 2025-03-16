import React from 'react';
import { MessageSquare, Grid, CalendarDays, BarChart3, Users, FileText, Inbox, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const DashIn = () => {
  return <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="bg-[#1A2238] w-[60px] flex flex-col items-center py-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mb-12">
          <MessageSquare size={16} className="text-white" />
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col gap-8">
          <Link to="/dashin" className="text-white hover:text-yellow-400">
            <Grid size={20} />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white">
            <MessageSquare size={20} />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white">
            <CalendarDays size={20} />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white">
            <Users size={20} />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white">
            <BarChart3 size={20} />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white">
            <Inbox size={20} />
          </Link>
          <Link to="#" className="text-gray-400 hover:text-white">
            <FileText size={20} />
          </Link>
        </div>
        
        {/* Settings at bottom */}
        <div className="mt-auto mb-6">
          <Link to="#" className="text-gray-400 hover:text-white">
            <Settings size={20} />
          </Link>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top notification bar */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-2 text-center flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <span>🛈 Your Ultimate Trial Expires On 29th Mar, 2025.</span>
          </div>
          <Button variant="link" className="text-white hover:text-blue-200 p-0">
            Upgrade your account now
          </Button>
        </div>
        
        {/* Top navigation bar */}
        
        
        {/* Main content */}
        <div className="flex-1 bg-gray-100 p-10">
          <div className="max-w-5xl mx-auto flex">
            {/* Left content */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-700 mb-4">Hey, Charles!</h1>
              
              <p className="text-gray-600 mb-2">Welcome to SocialPilot.</p>
              
              <p className="text-gray-600 mb-2">
                This is your dashboard, where you will see a summary of your queued and published posts.
              </p>
              
              <p className="text-gray-600 mb-4">
                Get started by connecting your first account.
              </p>
              
              <Button className="bg-blue-600 hover:bg-blue-700 mt-4">
                <span>Connect Account</span>
              </Button>
            </div>
            
            {/* Right illustration */}
            <div className="w-[300px]">
              
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default DashIn;