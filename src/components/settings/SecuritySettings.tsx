
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [user, setUser] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [facebookWindow, setFacebookWindow] = useState(null);

  useEffect(() => {
    fetchUserAndConnectedAccounts();

    const handleOAuthCallback = (event) => {
      console.log("[SecuritySettings] Received message:", event.data);
      
      if (event.data && event.data.type === 'facebook-oauth-callback') {
        const { code, state } = event.data;
        console.log('[SecuritySettings] Received Facebook code:', code);
        completeFacebookConnection(code);
      }
      else if (event.data && event.data.type === 'facebook-oauth-callback-error') {
        const { error, errorDescription } = event.data;
        console.error('[SecuritySettings] Facebook auth error:', error, errorDescription);
        
        toast.error('Facebook Connection Failed', {
          description: errorDescription || "Failed to connect Facebook account"
        });
        setIsConnecting(false);
      }
    };

    window.addEventListener('message', handleOAuthCallback);
    
    return () => {
      window.removeEventListener('message', handleOAuthCallback);
      if (facebookWindow && !facebookWindow.closed) {
        facebookWindow.close();
      }
    };
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

  const handleFacebookConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Get auth URL from our edge function
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'facebook',
          action: 'auth-url',
          userId: user.id
        }
      });
      
      console.log("Facebook auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start Facebook connection");
      }
      
      if (!response.data?.authUrl) {
        throw new Error("No Facebook auth URL returned");
      }
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const fbWindow = window.open(
        response.data.authUrl,
        'facebook-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!fbWindow) {
        throw new Error("Could not open Facebook auth popup. Please disable popup blocker.");
      }
      
      setFacebookWindow(fbWindow);
      
      // Monitor popup for close
      const checkClosed = setInterval(() => {
        if (fbWindow.closed) {
          clearInterval(checkClosed);
          console.log("[SecuritySettings] Facebook popup was closed");
          // Only reset isConnecting if we haven't received a successful callback
          if (isConnecting) {
            setIsConnecting(false);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error starting Facebook connection:", error);
      toast.error('Facebook Connection Failed', {
        description: error.message || "Failed to connect Facebook account"
      });
      setIsConnecting(false);
    }
  };

  const completeFacebookConnection = async (code) => {
    try {
      console.log("[SecuritySettings] Completing Facebook connection with code:", code.substring(0, 5) + "...");
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'facebook',
          action: 'callback',
          code: code,
          userId: user.id
        }
      });
      
      console.log("[SecuritySettings] Facebook callback response:", response);
      
      if (response.error) {
        console.error("Facebook callback error:", response.error);
        throw new Error(response.error.message || "Failed to connect Facebook account");
      }
      
      toast.success('Facebook Account Connected', {
        description: 'Your Facebook account has been connected successfully.'
      });
      
      // Refresh connected accounts
      fetchUserAndConnectedAccounts();
    } catch (error) {
      console.error("Error connecting Facebook:", error);
      toast.error('Facebook Connection Failed', {
        description: error.message || "Failed to connect Facebook account"
      });
    } finally {
      setIsConnecting(false);
      
      if (facebookWindow && !facebookWindow.closed) {
        facebookWindow.close();
        setFacebookWindow(null);
      }
    }
  };

  const handleDisconnectFacebook = async () => {
    // Show loading state
    setIsDisconnecting(true);
    
    try {
      // Call the disconnect-social edge function instead of using unlinkProvider
      const { data, error } = await supabase.functions.invoke('disconnect-social', {
        body: {
          userId: user.id,
          provider: 'facebook'
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Facebook account disconnected');
      // Refresh user data to update the UI
      fetchUserAndConnectedAccounts();
    } catch (error) {
      toast.error('Failed to disconnect Facebook', {
        description: error.message
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isFacebookConnected = connectedAccounts.some(acc => acc.platform === 'facebook');

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">Connected Accounts</h3>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Facebook</h4>
              <p className="text-xs text-muted-foreground">
                {isFacebookConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
            {isFacebookConnected ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDisconnectFacebook}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleFacebookConnect}
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
