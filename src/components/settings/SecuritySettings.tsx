
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Key, Shield, Mail, Twitter, Linkedin } from 'lucide-react';
import DeleteAccountSection from './DeleteAccountSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SecuritySettings = () => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const linkedinWindowRef = useRef<Window | null>(null);
  const twitterWindowRef = useRef<Window | null>(null);
  const listenersSetupRef = useRef(false);

  useEffect(() => {
    fetchConnectedIdentities();
    
    if (!listenersSetupRef.current) {
      console.log("[SecuritySettings] Setting up OAuth callback message listeners");
      
      const handleOAuthCallback = (event: MessageEvent) => {
        console.log("[SecuritySettings] Received message event:", event.data);
        
        if (event.data && event.data.type === 'twitter-oauth-callback') {
          console.log("[SecuritySettings] Processing Twitter callback:", event.data);
          const { code, state } = event.data;
          if (code && state) {
            completeTwitterConnection(code, state);
          } else {
            console.error("[SecuritySettings] Invalid Twitter callback data:", event.data);
            toast.error("Invalid Twitter callback data received");
            setIsConnecting(false);
          }
        }
        else if (event.data && event.data.type === 'linkedin-oauth-callback') {
          console.log("[SecuritySettings] Processing LinkedIn callback:", event.data);
          const { code, state } = event.data;
          if (code && state) {
            completeLinkedInConnection(code, state);
          } else {
            console.error("[SecuritySettings] Invalid LinkedIn callback data:", event.data);
            toast.error("Invalid LinkedIn callback data received");
            setIsConnecting(false);
          }
        }
      };

      window.addEventListener('message', handleOAuthCallback);
      listenersSetupRef.current = true;
      
      return () => {
        console.log("[SecuritySettings] Removing OAuth callback message listeners");
        window.removeEventListener('message', handleOAuthCallback);
        closePopups();
      };
    }
  }, []);

  const closePopups = () => {
    if (twitterWindowRef.current && !twitterWindowRef.current.closed) {
      twitterWindowRef.current.close();
    }
    if (linkedinWindowRef.current && !linkedinWindowRef.current.closed) {
      linkedinWindowRef.current.close();
    }
  };

  const fetchConnectedIdentities = async () => {
    try {
      console.log("[SecuritySettings] Fetching connected identities");
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.identities) {
        const providers = user.identities.map(identity => identity.provider);
        console.log("[SecuritySettings] Connected providers:", providers);
        setConnectedAccounts(providers);
      }
    } catch (error) {
      console.error("[SecuritySettings] Error fetching connected identities:", error);
    }
  };

  const connectGoogle = async () => {
    try {
      setIsConnecting(true);
      
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("[SecuritySettings] Starting Google OAuth flow with redirect to:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          scopes: 'email profile',
        }
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error("[SecuritySettings] Error connecting Google account:", error);
      toast.error("Failed to connect Google account: " + error.message);
      setIsConnecting(false);
    }
  };

  const connectTwitter = async () => {
    try {
      setIsConnecting(true);
      
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("[SecuritySettings] Starting Twitter OAuth flow with redirect to:", redirectTo);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("[SecuritySettings] Invoking social-auth edge function for Twitter");
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          action: 'auth-url',
          userId: session.user.id
        }
      });
      
      console.log("[SecuritySettings] Twitter auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start Twitter connection");
      }
      
      if (!response.data || !response.data.authUrl) {
        throw new Error("No Twitter auth URL returned");
      }
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      console.log("[SecuritySettings] Opening Twitter popup with URL:", response.data.authUrl);
      if (twitterWindowRef.current && !twitterWindowRef.current.closed) {
        twitterWindowRef.current.close();
      }
      
      const twitterPopup = window.open(
        response.data.authUrl,
        'twitter-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!twitterPopup) {
        throw new Error("Could not open Twitter auth popup. Please disable popup blocker.");
      }
      
      twitterWindowRef.current = twitterPopup;
      
      const checkPopupInterval = setInterval(() => {
        if (twitterPopup.closed) {
          clearInterval(checkPopupInterval);
          console.log("[SecuritySettings] Twitter popup was closed by user");
          setIsConnecting(false);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("[SecuritySettings] Error connecting Twitter account:", error);
      toast.error("Failed to connect Twitter account: " + error.message);
      setIsConnecting(false);
    }
  };

  const connectLinkedIn = async () => {
    try {
      setIsConnecting(true);
      
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("[SecuritySettings] Starting LinkedIn OAuth flow with redirect to:", redirectTo);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("[SecuritySettings] Invoking social-auth edge function for LinkedIn");
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: session.user.id
        }
      });
      
      console.log("[SecuritySettings] LinkedIn auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start LinkedIn connection");
      }
      
      if (!response.data || !response.data.authUrl) {
        throw new Error("No LinkedIn auth URL returned");
      }
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      console.log("[SecuritySettings] Opening LinkedIn popup with URL:", response.data.authUrl);
      
      // Close any existing LinkedIn popup
      if (linkedinWindowRef.current && !linkedinWindowRef.current.closed) {
        linkedinWindowRef.current.close();
      }
      
      // Open the LinkedIn authorization window
      const linkedinPopup = window.open(
        response.data.authUrl,
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!linkedinPopup) {
        throw new Error("Could not open LinkedIn auth popup. Please disable popup blocker.");
      }
      
      linkedinWindowRef.current = linkedinPopup;
      
      // Monitor the popup window status
      const checkPopupInterval = setInterval(() => {
        if (linkedinPopup.closed) {
          clearInterval(checkPopupInterval);
          console.log("[SecuritySettings] LinkedIn popup was closed by user");
          setIsConnecting(false);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("[SecuritySettings] Error connecting LinkedIn account:", error);
      toast.error("Failed to connect LinkedIn account: " + error.message);
      setIsConnecting(false);
    }
  };

  const completeTwitterConnection = async (code: string, state: string) => {
    try {
      console.log("[SecuritySettings] Starting Twitter connection completion with code:", code.substring(0, 5) + "...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("[SecuritySettings] Invoking social-auth callback for Twitter");
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          action: 'callback',
          code: code,
          userId: session.user.id
        }
      });
      
      console.log("[SecuritySettings] Twitter callback response:", response);
      
      if (response.error) {
        console.error("[SecuritySettings] Twitter callback error:", response.error);
        throw new Error(response.error.message || "Failed to connect Twitter account");
      }
      
      toast.success("Twitter Connected: Your Twitter/X account has been connected successfully.");
      
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error("[SecuritySettings] Error connecting Twitter:", error);
      toast.error("Failed to connect Twitter account: " + error.message);
    } finally {
      setIsConnecting(false);
      
      if (twitterWindowRef.current && !twitterWindowRef.current.closed) {
        twitterWindowRef.current.close();
        twitterWindowRef.current = null;
      }
    }
  };

  const completeLinkedInConnection = async (code: string, state: string) => {
    try {
      console.log("[SecuritySettings] Starting LinkedIn connection completion with code:", code.substring(0, 5) + "...");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("[SecuritySettings] Invoking social-auth callback for LinkedIn with userId:", session.user.id);
      
      const payload = {
        platform: 'linkedin',
        action: 'callback',
        code: code,
        userId: session.user.id
      };
      
      console.log("[SecuritySettings] LinkedIn callback payload:", payload);
      
      const response = await supabase.functions.invoke('social-auth', {
        body: payload
      });
      
      console.log("[SecuritySettings] LinkedIn callback response:", response);
      
      if (response.error) {
        console.error("[SecuritySettings] LinkedIn callback error:", response.error);
        throw new Error(response.error.message || "Failed to connect LinkedIn account");
      }
      
      toast.success("LinkedIn Connected: Your LinkedIn account has been connected successfully.");
      
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error("[SecuritySettings] Error connecting LinkedIn:", error);
      toast.error("Failed to connect LinkedIn account: " + error.message);
    } finally {
      setIsConnecting(false);
      
      // Ensure popup is closed
      if (linkedinWindowRef.current && !linkedinWindowRef.current.closed) {
        linkedinWindowRef.current.close();
        linkedinWindowRef.current = null;
      }
    }
  };

  const disconnectAccount = async (provider: string) => {
    try {
      setIsDisconnecting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found. Please sign in again.");
      }
      
      console.log(`[SecuritySettings] Attempting to disconnect ${provider} account for user ${user.id}`);
      
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
      
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error(`[SecuritySettings] Error disconnecting ${provider} account:`, error);
      toast.error(`Failed to disconnect ${provider} account: ${error.message}`);
    } finally {
      setIsDisconnecting(false);
    }
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
