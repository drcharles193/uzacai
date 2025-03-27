
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [user, setUser] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    fetchUserAndConnectedAccounts();
  }, []);

  const fetchUserAndConnectedAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Fetch connected accounts from social_accounts table
      const { data, error } = await supabase
        .from('social_accounts')
        .select('platform, account_name')
        .eq('user_id', user.id);
        
      if (!error && data) {
        setConnectedAccounts(data);
      }
    }
  };

  const handleDisconnectTwitter = async () => {
    // Show loading state
    setIsDisconnecting(true);
    
    try {
      // Call the disconnect-social edge function
      const { data, error } = await supabase.functions.invoke('disconnect-social', {
        body: {
          userId: user.id,
          provider: 'twitter'
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Twitter account disconnected');
      // Refresh user data to update the UI
      fetchUserAndConnectedAccounts();
    } catch (error) {
      toast.error('Failed to disconnect Twitter', {
        description: error.message
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleDisconnectLinkedin = async () => {
    // Show loading state
    setIsDisconnecting(true);
    
    try {
      // Call the disconnect-social edge function
      const { data, error } = await supabase.functions.invoke('disconnect-social', {
        body: {
          userId: user.id,
          provider: 'linkedin'
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('LinkedIn account disconnected');
      // Refresh user data to update the UI
      fetchUserAndConnectedAccounts();
    } catch (error) {
      toast.error('Failed to disconnect LinkedIn', {
        description: error.message
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isTwitterConnected = connectedAccounts.some(acc => acc.platform === 'twitter');
  const isLinkedinConnected = connectedAccounts.some(acc => acc.platform === 'linkedin');

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">Connected Accounts</h3>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Twitter</h4>
              <p className="text-xs text-muted-foreground">
                {isTwitterConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            {isTwitterConnected ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnectTwitter}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {}} // Kept placeholder for Twitter connection
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : 'Connect'}
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">LinkedIn</h4>
              <p className="text-xs text-muted-foreground">
                {isLinkedinConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            {isLinkedinConnected ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnectLinkedin}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {}} // Kept placeholder for LinkedIn connection
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : 'Connect'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
