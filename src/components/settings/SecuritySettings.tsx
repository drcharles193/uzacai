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
  const [linkedinWindow, setLinkedInWindow] = useState<Window | null>(null);
  const [twitterWindow, setTwitterWindow] = useState<Window | null>(null);
  const [platformToDisconnect, setPlatformToDisconnect] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [linkedInCallbackReceived, setLinkedInCallbackReceived] = useState(false);
  const linkedInStartTime = useRef<number | null>(null);
  const [linkedInCallbackStatus, setLinkedInCallbackStatus] = useState<string>('');
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  useEffect(() => {
    console.log('[DIAG-STEP2] SecuritySettings component mounted', {
      timestamp: new Date().toISOString(),
      location: window.location.href,
      contextPath: 'settings/security'
    });
    
    fetchConnectedIdentities();
  }, []);

  useEffect(() => {
    if (messageListenerRef.current) {
      window.removeEventListener('message', messageListenerRef.current);
      console.log('[DIAG-STEP2] Removed existing postMessage event listener');
    }

    console.log('[DIAG-STEP2] Setting up new postMessage event listener in SecuritySettings', {
      timestamp: new Date().toISOString()
    });
    
    const handleOAuthCallback = (event: MessageEvent) => {
      console.log('[DIAG-STEP2] SecuritySettings received message event:', {
        origin: event.origin,
        data: event.data,
        eventType: event.data?.type || 'unknown type',
        hasData: !!event.data,
        timestamp: new Date().toISOString(),
        timeElapsed: linkedInStartTime.current ? `${Date.now() - linkedInStartTime.current}ms` : 'unknown'
      });
      
      if (event.data && event.data.type === 'test-message') {
        console.log('[DIAG-STEP2] Test message received in SecuritySettings', {
          time: event.data.time,
          receivedAt: new Date().toISOString()
        });
      }
      
      if (event.data && event.data.type === 'twitter-oauth-callback') {
        const { code, state } = event.data;
        console.log('[DIAG-STEP2] Received Twitter callback:', {
          codePrefix: code ? code.substring(0, 5) + '...' : 'missing',
          state,
          timestamp: new Date().toISOString()
        });
        
        completeTwitterConnection(code, state);
      }
      else if (event.data && event.data.type === 'linkedin-oauth-callback') {
        const { code, state, timestamp } = event.data;
        
        console.log('[DIAG-STEP2] Received LinkedIn callback in SecuritySettings:', {
          codePrefix: code ? code.substring(0, 5) + '...' : 'missing',
          codeLength: code ? code.length : 0,
          state,
          messageTimestamp: timestamp,
          receivedAt: new Date().toISOString(),
          timeElapsed: linkedInStartTime.current ? `${Date.now() - linkedInStartTime.current}ms` : 'unknown'
        });
        
        setLinkedInCallbackReceived(true);
        setLinkedInCallbackStatus('received');
        
        try {
          if (linkedinWindow && !linkedinWindow.closed) {
            linkedinWindow.postMessage({ 
              type: 'linkedin-callback-received',
              timestamp: new Date().toISOString()
            }, '*');
            console.log('[DIAG-STEP2] Sent acknowledgment to LinkedIn popup');
          }
        } catch (e) {
          console.error('[DIAG-STEP2] Error sending acknowledgment to LinkedIn popup:', e);
        }
        
        setTimeout(() => {
          setLinkedInCallbackStatus('processing');
          completeLinkedInConnection(code, state);
        }, 100);
      }
    };

    messageListenerRef.current = handleOAuthCallback;
    
    console.log('[DIAG-STEP2] Adding postMessage event listener for OAuth callbacks');
    window.addEventListener('message', handleOAuthCallback);
    
    return () => {
      console.log('[DIAG-STEP2] Removing postMessage event listener');
      
      if (messageListenerRef.current) {
        window.removeEventListener('message', messageListenerRef.current);
      }
      
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
        
        console.log('[DIAG-STEP2] User connected accounts:', {
          providers,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("[DIAG-STEP2] Error fetching connected identities:", error);
    }
  };

  const connectGoogle = async () => {
    try {
      setIsConnecting(true);
      
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
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      toast.success("Google Connected: Your Google account has been connected successfully.");
      
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error("Error connecting Google account:", error);
      toast.error("Failed to connect Google account: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectTwitter = async () => {
    try {
      setIsConnecting(true);
      
      const origin = window.location.origin;
      const redirectTo = `${origin}/settings?tab=security`;
      
      console.log("Starting Twitter OAuth flow with redirect to:", redirectTo);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        return;
      }
      
      console.log("Calling social-auth edge function for Twitter auth URL");
      
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
      
      console.log("Opening Twitter auth popup with URL:", response.data.authUrl);
      
      const twitterPopup = window.open(
        response.data.authUrl,
        'twitter-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!twitterPopup) {
        throw new Error("Could not open Twitter auth popup. Please disable popup blocker.");
      }
      
      console.log("Twitter popup opened successfully");
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
      
      console.log("[DIAG-STEP2] Starting LinkedIn OAuth flow", {
        timestamp: new Date().toISOString()
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        setLinkedInCallbackStatus('no-session');
        return;
      }
      
      console.log("[DIAG-STEP2] Calling social-auth edge function for LinkedIn auth URL");
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: session.user.id
        }
      });
      
      console.log("[DIAG-STEP2] LinkedIn auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start LinkedIn connection");
      }
      
      if (!response.data || !response.data.authUrl) {
        throw new Error("No LinkedIn auth URL returned");
      }
      
      linkedInStartTime.current = Date.now();
      setLinkedInCallbackStatus('opening-popup');
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      console.log("[DIAG-STEP2] Opening LinkedIn auth popup with URL:", response.data.authUrl, {
        timestamp: new Date().toISOString()
      });
      
      const linkedinPopup = window.open(
        response.data.authUrl,
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!linkedinPopup) {
        throw new Error("Could not open LinkedIn auth popup. Please disable popup blocker.");
      }
      
      console.log("[DIAG-STEP2] LinkedIn popup opened successfully", {
        timestamp: new Date().toISOString()
      });
      
      setLinkedInWindow(linkedinPopup);
      setLinkedInCallbackStatus('awaiting-callback');
      
      const popupChecker = setInterval(() => {
        if (linkedinPopup.closed) {
          console.log("[DIAG-STEP2] LinkedIn popup was closed by user", {
            timestamp: new Date().toISOString(),
            timeElapsed: `${Date.now() - (linkedInStartTime.current || 0)}ms`,
            callbackReceived: linkedInCallbackReceived
          });
          
          clearInterval(popupChecker);
          
          if (!linkedInCallbackReceived) {
            console.log("[DIAG-STEP2] LinkedIn popup closed without callback", {
              timestamp: new Date().toISOString()
            });
            setIsConnecting(false);
            setLinkedInCallbackStatus('popup-closed-no-callback');
            toast.error("LinkedIn connection failed. The authentication window was closed before completion.");
          }
        } else {
          try {
            const url = linkedinPopup.location.href;
            console.log("[DIAG-STEP2] LinkedIn popup check - still open", {
              timestamp: new Date().toISOString(),
              urlAvailable: !!url,
              timeElapsed: `${Date.now() - (linkedInStartTime.current || 0)}ms`
            });
          } catch (e) {
            // Cannot access location due to cross-origin restrictions - this is normal
          }
        }
      }, 1000);
      
      setTimeout(() => {
        if (isConnecting) {
          console.log("[DIAG-STEP2] LinkedIn connection timeout - no callback received", {
            timestamp: new Date().toISOString(),
            timeElapsed: `${Date.now() - (linkedInStartTime.current || 0)}ms`,
            callbackReceived: linkedInCallbackReceived
          });
          
          setIsConnecting(false);
          setLinkedInCallbackStatus('timeout');
          
          clearInterval(popupChecker);
          
          toast.error("LinkedIn connection timed out. Please try again.");
          
          if (linkedinPopup && !linkedinPopup.closed) {
            try {
              linkedinPopup.close();
            } catch (e) {
              console.error("Error closing LinkedIn popup:", e);
            }
          }
        }
      }, 90000); // 90-second timeout
      
    } catch (error: any) {
      console.error("[DIAG-STEP2] Error connecting LinkedIn account:", error);
      toast.error("Failed to connect LinkedIn account: " + error.message);
      setIsConnecting(false);
      setLinkedInCallbackStatus('error-' + error.message.substring(0, 20));
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
      console.log("[DIAG-STEP3] Entering completeLinkedInConnection function", {
        timestamp: new Date().toISOString(),
        codePrefix: code ? code.substring(0, 5) + '...' : 'missing',
        codeLength: code ? code.length : 0,
        statePrefix: state ? state.substring(0, 5) + '...' : 'missing',
        timeElapsed: linkedInStartTime.current ? `${Date.now() - linkedInStartTime.current}ms` : 'unknown'
      });
      
      setLinkedInCallbackStatus('completing');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("[DIAG-STEP3] No session found for LinkedIn callback");
        toast.error("Authentication required. Please sign in to connect social accounts.");
        setIsConnecting(false);
        setLinkedInCallbackStatus('complete-no-session');
        return;
      }
      
      console.log("[DIAG-STEP3] Session found for LinkedIn callback completion", {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      });
      
      const payload = {
        platform: 'linkedin',
        action: 'callback',
        code: code,
        state: state,
        userId: session.user.id
      };
      
      console.log("[DIAG-STEP3] Sending payload to social-auth edge function:", {
        platform: payload.platform,
        action: payload.action,
        codePrefix: code ? code.substring(0, 5) + '...' : 'missing',
        codeLength: code ? code.length : 0,
        statePrefix: state ? state.substring(0, 5) + '...' : 'missing',
        userId: payload.userId,
        timestamp: new Date().toISOString()
      });
      
      const response = await supabase.functions.invoke('social-auth', {
        body: payload
      });
      
      console.log("[DIAG-STEP3] LinkedIn callback edge function response:", {
        success: !response.error && response.data?.success,
        error: response.error,
        dataError: response.data?.error,
        dataKeys: response.data ? Object.keys(response.data) : [],
        timestamp: new Date().toISOString(),
        timeElapsed: linkedInStartTime.current ? `${Date.now() - linkedInStartTime.current}ms` : 'unknown'
      });
      
      if (response.error) {
        console.error("[DIAG-STEP3] LinkedIn callback error from edge function:", {
          error: response.error,
          errorMessage: response.error.message,
          timestamp: new Date().toISOString()
        });
        
        throw new Error(response.error.message || "Failed to connect LinkedIn account");
      }
      
      if (!response.data || !response.data.success) {
        console.error("[DIAG-STEP3] LinkedIn connection failed - no success in response", {
          data: response.data,
          timestamp: new Date().toISOString()
        });
        throw new Error("LinkedIn connection failed");
      }
      
      console.log("[DIAG-STEP3] LinkedIn connection successful");
      toast.success("LinkedIn Connected: Your LinkedIn account has been connected successfully.");
      
      await fetchConnectedIdentities();
      
    } catch (error: any) {
      console.error("[DIAG-STEP3] Error completing LinkedIn connection:", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        timeElapsed: linkedInStartTime.current ? `${Date.now() - linkedInStartTime.current}ms` : 'unknown'
      });
      
      setLinkedInCallbackStatus('complete-error');
      toast.error("Failed to connect LinkedIn account: " + error.message);
    } finally {
      setIsConnecting(false);
      
      if (linkedinWindow && !linkedinWindow.closed) {
        try {
          console.log("[DIAG-STEP3] Closing LinkedIn popup", {
            timestamp: new Date().toISOString()
          });
          
          linkedinWindow.close();
        } catch (e) {
          console.error("[DIAG-STEP3] Error closing LinkedIn popup:", e);
        }
      }
      
      setLinkedInWindow(null);
      linkedInStartTime.current = null;
      
      setTimeout(() => {
        console.log("[DIAG-STEP3] Final LinkedIn connection status:", {
          status: linkedInCallbackStatus,
          isConnecting: isConnecting,
          timestamp: new Date().toISOString()
        });
      }, 500);
    }
  };

  const disconnectAccount = async (provider: string) => {
    try {
      setIsDisconnecting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No user found. Please sign in again.");
      }
      
      console.log(`Attempting to disconnect ${provider} account for user ${user.id}`);
      
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
      console.error(`Error disconnecting ${provider} account:`, error);
      toast.error(`Failed to disconnect ${provider} account: ${error.message}`);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const openDisconnectConfirmation = (id: string) => {
    setPlatformToDisconnect(id);
    setConfirmDialogOpen(true);
  };

  const isGoogleConnected = connectedAccounts.includes('google');
  const isTwitterConnected = connectedAccounts.includes('twitter');
  const isLinkedInConnected = connectedAccounts.includes('linkedin');

  useEffect(() => {
    console.log('[DIAG-STEP2] LinkedIn connection state changed:', {
      isConnecting,
      linkedInCallbackReceived,
      linkedInCallbackStatus,
      timestamp: new Date().toISOString()
    });
  }, [isConnecting, linkedInCallbackReceived, linkedInCallbackStatus]);

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
                  {linkedInCallbackStatus && (
                    <p className="text-xs text-blue-500 mt-1">
                      Status: {linkedInCallbackStatus} {linkedInStartTime.current ? `(${Math.floor((Date.now() - linkedInStartTime.current)/1000)}s)` : ''}
                    </p>
                  )}
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
                  {isConnecting === true ? (
                    <>
                      <span className="animate-spin mr-2">⭮</span> 
                      Connecting...
                    </>
                  ) : "Connect"}
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
