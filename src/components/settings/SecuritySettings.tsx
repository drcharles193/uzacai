import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Key, Shield, Mail, Twitter, Linkedin } from 'lucide-react';
import DeleteAccountSection from './DeleteAccountSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [linkedinWindow, setLinkedInWindow] = useState<Window | null>(null);
  const [twitterWindow, setTwitterWindow] = useState<Window | null>(null);

  useEffect(() => {
    fetchConnectedIdentities();
  }, []);

  useEffect(() => {
    const handleOAuthCallback = (event: MessageEvent) => {
      if (event.data && event.data.type === 'twitter-oauth-callback') {
        const { code, state } = event.data;
        console.log('Received Twitter callback:', code, state);
        
        completeTwitterConnection(code, state);
      }
      else if (event.data && event.data.type === 'linkedin-oauth-callback') {
        const { code, state } = event.data;
        console.log('Received LinkedIn callback:', code, state);
        
        completeLinkedInConnection(code, state);
      }
    };

    window.addEventListener('message', handleOAuthCallback);
    
    return () => {
      window.removeEventListener('message', handleOAuthCallback);
      if (twitterWindow && !twitterWindow.closed) {
        twitterWindow.close();
      }
      if (linkedinWindow && !linkedinWindow.closed) {
        linkedinWindow.close();
      }
    };
  }, []);

  const fetchConnectedIdentities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.identities) {
        const providers = user.identities.map(identity => identity.provider);
        setConnectedAccounts(providers);
      }
    } catch (error) {
      console.error("Error fetching connected identities:", error);
    }
  };

  const connectGoogle = async () => {
    try {
      setIsConnecting(true);
      
      // Get the current URL to use in the redirect
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("Starting Google OAuth flow with redirect to:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          scopes: 'email profile',
        }
      });
      
      if (error) throw error;
      
      // User will be redirected to Google for authentication
      // No need to set isConnecting to false as the page will reload after redirect
      
    } catch (error: any) {
      console.error("Error connecting Google account:", error);
      toast.error("Failed to connect Google account: " + error.message);
      setIsConnecting(false);
    }
  };

  const connectTwitter = async () => {
    try {
      setIsConnecting(true);
      
      // Get the current URL to use in the redirect
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("Starting Twitter OAuth flow with redirect to:", redirectTo);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          action: 'auth-url',
          userId: session.user.id
        }
      });
      
      console.log("Twitter auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start Twitter connection");
      }
      
      if (!response.data.authUrl) {
        throw new Error("No Twitter auth URL returned");
      }
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const twitterPopup = window.open(
        response.data.authUrl,
        'twitter-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!twitterPopup) {
        throw new Error("Could not open Twitter auth popup. Please disable popup blocker.");
      }
      
      setTwitterWindow(twitterPopup);
      
    } catch (error: any) {
      console.error("Error connecting Twitter account:", error);
      toast.error("Failed to connect Twitter account: " + error.message);
      setIsConnecting(false);
    }
  };

  const connectLinkedIn = async () => {
    try {
      setIsConnecting(true);
      
      // Get the current URL to use in the redirect
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("Starting LinkedIn OAuth flow...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: session.user.id
        }
      });
      
      console.log("LinkedIn auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start LinkedIn connection");
      }
      
      if (!response.data.authUrl) {
        throw new Error("No LinkedIn auth URL returned");
      }
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      const linkedinPopup = window.open(
        response.data.authUrl,
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!linkedinPopup) {
        throw new Error("Could not open LinkedIn auth popup. Please disable popup blocker.");
      }
      
      setLinkedInWindow(linkedinPopup);
      
    } catch (error: any) {
      console.error("Error connecting LinkedIn account:", error);
      toast.error("Failed to connect LinkedIn account: " + error.message);
      setIsConnecting(false);
    }
  };

  const completeTwitterConnection = async (code: string, state: string) => {
    try {
      setIsConnecting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("Completing Twitter connection with code:", code.substring(0, 5) + "...");
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          action: 'callback',
          code: code,
          userId: session.user.id
        }
      });
      
      if (response.error) {
        console.error("Twitter callback error:", response.error);
        throw new Error(response.error.message || "Failed to connect Twitter account");
      }
      
      toast.success("Twitter Connected: Your Twitter/X account has been connected successfully.");
      
      // Refresh the connected accounts list
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error("Error connecting Twitter:", error);
      toast.error("Failed to connect Twitter account: " + error.message);
    } finally {
      setIsConnecting(false);
      
      setTimeout(() => {
        if (twitterWindow && !twitterWindow.closed) {
          twitterWindow.close();
        }
      }, 1000);
    }
  };

  const completeLinkedInConnection = async (code: string, state: string) => {
    try {
      setIsConnecting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("Completing LinkedIn connection with code:", code.substring(0, 5) + "...");
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'callback',
          code: code,
          userId: session.user.id
        }
      });
      
      if (response.error) {
        console.error("LinkedIn callback error:", response.error);
        throw new Error(response.error.message || "Failed to connect LinkedIn account");
      }
      
      toast.success("LinkedIn Connected: Your LinkedIn account has been connected successfully.");
      
      // Refresh the connected accounts list
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error("Error connecting LinkedIn:", error);
      toast.error("Failed to connect LinkedIn account: " + error.message);
    } finally {
      setIsConnecting(false);
      
      setTimeout(() => {
        if (linkedinWindow && !linkedinWindow.closed) {
          linkedinWindow.close();
        }
      }, 1000);
    }
  };

  const disconnectAccount = async (provider: string) => {
    try {
      setIsDisconnecting(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found. Please sign in again.");
      }
      
      console.log(`Attempting to disconnect ${provider} account for user ${user.id}`);
      
      // Call the edge function to disconnect the account
      const { data, error } = await supabase.functions.invoke('disconnect-social', {
        body: {
          userId: user.id,
          provider: provider
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success(data.message || `${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully`);
      
      // Refresh the connected accounts list
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error(`Error disconnecting ${provider} account:`, error);
      toast.error(`Failed to disconnect ${provider} account: ${error.message}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const openDisconnectConfirmation = (id: string) => {
    // Implementation of openDisconnectConfirmation
  };

  const isGoogleConnected = connectedAccounts.includes('google');
  const isTwitterConnected = connectedAccounts.includes('twitter');
  const isLinkedInConnected = connectedAccounts.includes('linkedin');

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
          Password & Authentication
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Key size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your password to keep your account secure</p>
                </div>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Shield size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <h3 className="text-lg font-medium mb-4 pb-1 border-b border-primary w-fit">
          Connected Accounts
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    width="18" 
                    height="18" 
                    className="text-primary"
                  >
                    <path 
                      fill="currentColor" 
                      d="M12 11h8.533c.044.385.067.773.067 1.167 0 2.272-.586 4.33-1.59 5.973-1.04 1.703-2.585 3.025-4.659 3.386A9.98 9.98 0 0 1 12 22 9.958 9.958 0 0 1 7.649 21.526c-2.074-.361-3.62-1.683-4.66-3.386-1.003-1.643-1.589-3.7-1.589-5.973C1.4 6.175 6.13 1.4 12 1.4c2.539 0 4.844.852 6.66 2.263a9.949 9.949 0 0 1 3.14 4.679h-5.517A5.381 5.381 0 0 0 12 6.6a5.388 5.388 0 0 0-5.384 5.384A5.388 5.388 0 0 0 12 17.368a5.375 5.375 0 0 0 4.391-2.241 5.379 5.379 0 0 0 .926-3.043H12V11Z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium">Google Account</h4>
                  <p className="text-sm text-muted-foreground">
                    {isGoogleConnected 
                      ? "Your Google account is connected" 
                      : "Connect your Google account for easier sign-in"}
                  </p>
                </div>
              </div>
              {isGoogleConnected ? (
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => disconnectAccount('google')}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={connectGoogle}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Twitter size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Twitter / X Account</h4>
                  <p className="text-sm text-muted-foreground">
                    {isTwitterConnected 
                      ? "Your Twitter/X account is connected" 
                      : "Connect your Twitter/X account for easier sign-in"}
                  </p>
                </div>
              </div>
              {isTwitterConnected ? (
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => disconnectAccount('twitter')}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={connectTwitter}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          </div>
          
          <div className="border rounded-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Linkedin size={18} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">LinkedIn Account</h4>
                  <p className="text-sm text-muted-foreground">
                    {isLinkedInConnected 
                      ? "Your LinkedIn account is connected" 
                      : "Connect your LinkedIn account for professional networking"}
                  </p>
                </div>
              </div>
              {isLinkedInConnected ? (
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={() => disconnectAccount('linkedin')}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={connectLinkedIn}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <DeleteAccountSection />
    </div>
  );
};

export default SecuritySettings;
