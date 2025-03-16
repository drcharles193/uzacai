
import React, { useEffect, useState } from 'react';
import { MessageSquare, Grid, CalendarDays, BarChart3, Users, FileText, Inbox, Settings, UserRound, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SocialMediaConnect from '@/components/SocialMediaConnect';
import PublishingSummary from '@/components/PublishingSummary';
import ConnectedAccountsList from '@/components/ConnectedAccountsList';

interface SocialAccount {
  platform: string;
  account_name: string;
  account_type?: string;
  platform_account_id?: string;
}

const DashIn = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnectedAccounts = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase
          .from('social_accounts')
          .select('platform, account_name, account_type, platform_account_id')
          .eq('user_id', session.user.id);
          
        if (error) {
          throw error;
        }
        
        setConnectedAccounts(data || []);
      }
    } catch (error: any) {
      console.error("Error fetching connected accounts:", error);
      toast.error("Failed to load your connected accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch the current user data when component mounts
    const fetchUserData = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        // Get user metadata
        const userMeta = user.user_metadata;
        const firstName = userMeta?.firstName || userMeta?.first_name || 'User';
        setUserName(firstName);

        // Get trial end date from user metadata or calculate from created_at
        let endDate;
        if (userMeta?.trialEndsAt) {
          endDate = new Date(userMeta.trialEndsAt);
        } else {
          // Calculate 14 days from sign up
          const createdAt = new Date(user.created_at);
          endDate = new Date(createdAt);
          endDate.setDate(endDate.getDate() + 14);
        }
        setTrialEndDate(endDate);
      } else {
        // Redirect to home if no user is found
        navigate('/');
      }
    };
    
    fetchUserData();
    fetchConnectedAccounts();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const handleSocialConnectDone = () => {
    setShowConnectDialog(false);
    fetchConnectedAccounts();
  };

  const handleAccountDisconnected = (platformId: string) => {
    // Update connected accounts list when an account is disconnected
    fetchConnectedAccounts();
  };

  // Format the trial end date
  const formattedTrialEndDate = trialEndDate ? trialEndDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '...';

  const hasConnectedAccounts = connectedAccounts.length > 0;

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
          <Link to="/settings" className="text-gray-400 hover:text-white">
            <Settings size={20} />
          </Link>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top notification bar */}
        <div className="bg-gradient-to-r from-[#5A7D64] to-[#85A88E] text-white p-2 text-center flex justify-between items-center px-6">
          <div className="flex items-center gap-2">
            <span>🛈 Your Ultimate Trial Expires On {formattedTrialEndDate}.</span>
          </div>
          <Button variant="link" className="text-white hover:text-blue-200 p-0">
            Upgrade your account now
          </Button>
        </div>
        
        {/* Top navigation bar */}
        <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
          <div className="flex gap-6">
            <div className="text-lg font-semibold border-b-2 border-[#689675] text-black pb-1">Accounts</div>
            <div className="text-lg font-medium text-gray-500">
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Create Post button - only show when accounts are connected */}
            {hasConnectedAccounts && (
              <Button className="bg-[#689675] hover:bg-[#85A88EA8] flex items-center gap-2">
                <Plus size={18} />
                <span>Create Post</span>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="22" y1="6" x2="2" y2="6"></line></svg>
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            </Button>
            
            {/* Settings icon with link */}
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <Settings size={20} />
              </Button>
            </Link>
            
            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#689675] text-white">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings?tab=profile')}>
                  <UserRound className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings?tab=subscriptions')}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="22" y1="6" x2="2" y2="6"></line></svg>
                  <span>Subscription</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-100 p-10">
          {hasConnectedAccounts ? (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-700">Hey, {userName || 'there'}!</h1>
                <Button variant="outline" className="text-gray-600" onClick={() => setShowConnectDialog(true)}>
                  Connect Account
                </Button>
              </div>
              
              {/* Publishing Summary Component */}
              <PublishingSummary />
              
              {/* Connected Accounts List Component */}
              <ConnectedAccountsList 
                accounts={connectedAccounts} 
                onAccountDisconnected={handleAccountDisconnected}
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto flex">
              {/* Left content */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-700 mb-4">Hey, {userName || 'there'}!</h1>
                
                <p className="text-gray-600 mb-2">Welcome to SocialAI . . .</p>
                
                <p className="text-gray-600 mb-2">
                  This is your dashboard, where you will see a summary of your queued and published posts.
                </p>
                
                <p className="text-gray-600 mb-4">
                  Get started by connecting your first account.
                </p>
                
                <Button className="bg-[#689675] hover:bg-[#85A88EA8] mt-4" onClick={() => setShowConnectDialog(true)}>
                  <span>Connect Account</span>
                </Button>
              </div>
              
              {/* Right illustration */}
              <div className="w-[300px]">
                <img alt="Dashboard illustration" className="w-full h-auto" src="/lovable-uploads/13323779-e347-427f-b65f-61bb092752dc.png" />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Social Media Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Connect Your Social Accounts</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <SocialMediaConnect 
              isDialog={true} 
              onClose={() => setShowConnectDialog(false)}
              onDone={handleSocialConnectDone}
              onAccountDisconnected={handleAccountDisconnected}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default DashIn;
