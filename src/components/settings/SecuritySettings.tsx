
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [user, setUser] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    fetchUserAndConnectedAccounts();
  }, []);

  const fetchUserAndConnectedAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    // Add logic to fetch connected accounts if needed
  };

  const handleFacebookConnect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: 'https://uzacai.com/facebook-callback.html',
        scopes: 'email,public_profile'
      }
    });

    if (error) {
      toast.error('Facebook connection failed', {
        description: error.message
      });
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

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">Connected Accounts</h3>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Facebook</h4>
              <p className="text-xs text-muted-foreground">
                {user?.app_metadata?.identities?.some(identity => identity.provider === 'facebook') 
                  ? 'Connected' 
                  : 'Not Connected'}
              </p>
            </div>
            {user?.app_metadata?.identities?.some(identity => identity.provider === 'facebook') ? (
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
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
