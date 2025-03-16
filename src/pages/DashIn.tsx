import React from 'react';
import { MessageSquare, Grid, CalendarDays, BarChart3, Users, FileText, Inbox, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const DashIn = () => {
  return <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <div className="bg-[#1A2238] w-[60px] flex flex-col items-center py-4">
        <div className="w-8 h-8 rounded-full bg-[#689675] flex items-center justify-center mb-12">
          <MessageSquare size={16} className="text-white" />
        </div>
        
        {/* Navigation Icons */}
        <div className="flex flex-col gap-8">
          <Link to="/dashin" className="text-white hover:text-[#85A88E]">
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
        <div className="bg-gradient-to-r from-[#5A7D64] to-[#85A88E] text-white p-2 text-center flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <span>🛈 Your Ultimate Trial Expires On 29th Mar, 2025.</span>
          </div>
          <Button variant="link" className="text-white hover:text-blue-200 p-0">
            Upgrade your account now
          </Button>
        </div>
        
        {/* Top navigation bar */}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
          <div className="flex gap-6">
            <div className="text-lg font-semibold border-b-2 border-[#689675] text-black pb-1">SocialPilot</div>
            <div className="text-lg font-medium text-gray-500">Reviews</div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="22" y1="6" x2="2" y2="6"></line></svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-100 p-10">
          <div className="max-w-5xl mx-auto flex">
            {/* Left content */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-700 mb-4">Hey, Charles!</h1>
              
              <p className="text-gray-600 mb-2">Welcome  to SocialAI . . .
            </p>
              
              <p className="text-gray-600 mb-2">
                This is your dashboard, where you will see a summary of your queued and published posts.
              </p>
              
              <p className="text-gray-600 mb-4">
                Get started by connecting your first account.
              </p>
              
              <Button className="bg-[#689675] hover:bg-[#85A88EA8] mt-4">
                <span>Connect Account</span>
              </Button>
            </div>
            
            {/* Right illustration */}
            <div className="w-[300px]">
              <img src="/lovable-uploads/8655d9cc-3470-4541-a4e6-4212d8f2094e.png" alt="Dashboard illustration" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default DashIn;