import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle, X as XIcon, Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  connected: boolean;
  accountName?: string;
}

interface SocialMediaConnectProps {
  isDialog?: boolean;
  onClose?: () => void;
  onDone?: () => void;
  onAccountDisconnected?: (platformId: string) => void;
}

const SocialMediaConnect: React.FC<SocialMediaConnectProps> = ({ 
  isDialog = false, 
  onClose,
  onDone,
  onAccountDisconnected
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [twitterWindow, setTwitterWindow] = useState<Window | null>(null);
  const [linkedinWindow, setLinkedInWindow] = useState<Window | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [platformToDisconnect, setPlatformToDisconnect] = useState<string | null>(null);
  const [linkedInCallbackReceived, setLinkedInCallbackReceived] = useState(false);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'twitter',
      name: 'Twitter / X',
      color: '#1DA1F2',
      icon: (
        <Twitter className="w-5 h-5" />
      ),
      connected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0077B5',
      icon: (
        <Linkedin className="w-5 h-5" />
      ),
      connected: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      color: '#E1306C',
      icon: (
        <Instagram className="w-5 h-5" />
      ),
      connected: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: '#4267B2',
      icon: (
        <Facebook className="w-5 h-5" />
      ),
      connected: false
    },
    {
      id: 'youtube',
      name: 'YouTube',
      color: '#FF0000',
      icon: (
        <Youtube className="w-5 h-5" />
      ),
      connected: false
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      color: '#E60023',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
      ),
      connected: false
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      color: '#000000',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
          <path d="M15 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
          <path d="M15 8v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-4a4 4 0 0 1 4-4h8"></path>
        </svg>
      ),
      connected: false
    },
    {
      id: 'threads',
      name: 'Threads',
      color: '#000000',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M6 12a6 6 0 0 0 12 0v-4a6 6 0 0 0-12 0v4z"></path>
          <path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"></path>
          <path d="M12 22v-6"></path>
        </svg>
      ),
      connected: false
    },
    {
      id: 'google',
      name: 'Google',
      color: '#4285F4',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="m2 12 10-7v14l-10-7" />
          <path d="M12 5v14" />
          <path d="M22 12H12" />
        </svg>
      ),
      connected: false
    },
    {
      id: 'tumblr',
      name: 'Tumblr',
      color: '#36465D',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M9 3c-4 0-5 4-5 4v3h2v4H4v5c4 2 7 1 8-1v-8h3v-3s-3-1-3-3v2c0 0-0-3-3-3z"></path>
        </svg>
      ),
      connected: false
    }
  ]);

  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase
          .from('social_accounts')
          .select('platform, account_name')
          .eq('user_id', session.user.id);
          
        if (error) {
          console.error("Error fetching social accounts:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setPlatforms(prev => prev.map(platform => {
            const connectedAccount = data.find(acc => acc.platform === platform.id);
            if (connectedAccount) {
              return {
                ...platform, 
                connected: true,
                accountName: connectedAccount.account_name
              };
            }
            return platform;
          }));
        }
      }
    };
    
    fetchConnectedAccounts();

    const handleOAuthCallback = (event: MessageEvent) => {
      console.log('SocialMediaConnect received message:', event.origin, event.data?.type || 'unknown type');
      
      if (event.data && event.data.type === 'twitter-oauth-callback') {
        const { code, state } = event.data;
        console.log('Received Twitter callback in SocialMediaConnect:', 
          code ? code.substring(0, 5) + '...' : 'missing', 
          state);
        
        completeTwitterConnection(code, state);
      }
      else if (event.data && event.data.type === 'linkedin-oauth-callback') {
        const { code, state } = event.data;
        console.log('Received LinkedIn callback in SocialMediaConnect:', 
          code ? code.substring(0, 5) + '...' : 'missing', 
          state);
        
        setLinkedInCallbackReceived(true);
        completeLinkedInConnection(code, state);
      }
    };

    console.log('SocialMediaConnect: Adding postMessage event listener for OAuth callbacks');
    window.addEventListener('message', handleOAuthCallback);
    
    return () => {
      console.log('SocialMediaConnect: Removing postMessage event listener');
      window.removeEventListener('message', handleOAuthCallback);
      
      // Close any open popup windows
      if (twitterWindow && !twitterWindow.closed) {
        twitterWindow.close();
      }
      if (linkedinWindow && !linkedinWindow.closed) {
        linkedinWindow.close();
      }
    };
  }, []);

  const completeTwitterConnection = async (code: string, state: string) => {
    try {
      setIsConnecting('twitter');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        setConnectionError('twitter');
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
      
      setPlatforms(platforms.map(platform => {
        if (platform.id === 'twitter') {
          return { 
            ...platform, 
            connected: true,
            accountName: response.data.accountName || 'Twitter Account'
          };
        }
        return platform;
      }));
      
      setConnectionSuccess('twitter');
      
      toast({
        title: "Twitter Connected",
        description: `Your Twitter account has been connected successfully.`
      });
      
    } catch (error: any) {
      console.error("Error connecting Twitter:", error);
      setConnectionError('twitter');
      toast({
        title: "Twitter Connection Failed",
        description: error.message || "Failed to connect Twitter account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
      
      setTimeout(() => {
        setConnectionSuccess(null);
        setConnectionError(null);
      }, 3000);
    }
  };

  const completeLinkedInConnection = async (code: string, state: string) => {
    try {
      console.log("SocialMediaConnect: Starting LinkedIn connection completion with code:", 
        code ? code.substring(0, 5) + "..." : "missing");
      setIsConnecting('linkedin');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("SocialMediaConnect: No session found for LinkedIn callback");
        toast({
          title: "Authentication required",
          description: "Please sign in to connect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        setConnectionError('linkedin');
        return;
      }
      
      console.log("SocialMediaConnect: Calling social-auth edge function for LinkedIn callback");
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'callback',
          code: code,
          state: state,
          userId: session.user.id
        }
      });
      
      console.log("SocialMediaConnect: LinkedIn callback response:", response);
      
      if (response.error) {
        console.error("SocialMediaConnect: LinkedIn callback error:", response.error);
        throw new Error(response.error.message || "Failed to connect LinkedIn account");
      }
      
      if (!response.data || !response.data.success) {
        console.error("SocialMediaConnect: LinkedIn connection failed", response.data);
        throw new Error("LinkedIn connection failed");
      }
      
      console.log("SocialMediaConnect: LinkedIn connection successful");
      
      setPlatforms(platforms.map(platform => {
        if (platform.id === 'linkedin') {
          return { 
            ...platform, 
            connected: true,
            accountName: response.data.accountName || 'LinkedIn Account'
          };
        }
        return platform;
      }));
      
      setConnectionSuccess('linkedin');
      
      toast({
        title: "LinkedIn Connected",
        description: `Your LinkedIn account has been connected successfully.`
      });
      
      if (onDone) onDone();
      
    } catch (error: any) {
      console.error("SocialMediaConnect: Error connecting LinkedIn:", error);
      setConnectionError('linkedin');
      toast({
        title: "LinkedIn Connection Failed",
        description: error.message || "Failed to connect LinkedIn account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
      
      // Close the popup window
      setTimeout(() => {
        if (linkedinWindow && !linkedinWindow.closed) {
          try {
            linkedinWindow.close();
          } catch (e) {
            console.error("Error closing LinkedIn popup:", e);
          }
        }
        setLinkedInWindow(null);
      }, 1000);
      
      setTimeout(() => {
        setConnectionSuccess(null);
        setConnectionError(null);
      }, 3000);
    }
  };

  const connectPlatform = async (id: string) => {
    try {
      setIsConnecting(id);
      setConnectionSuccess(null);
      setConnectionError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        setConnectionError(id);
        return;
      }
      
      if (id === 'twitter') {
        console.log("Starting Twitter OAuth flow...");
        
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
        
        return;
      } 
      else if (id === 'linkedin') {
        console.log("Starting LinkedIn OAuth flow...");
        
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
        
        return;
      }
      
      const response = await supabase.functions.invoke('social-auth', {
        body: JSON.stringify({
          platform: id,
          userId: session.user.id
        })
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to connect account");
      }
      
      setPlatforms(platforms.map(platform => {
        if (platform.id === id) {
          return { 
            ...platform, 
            connected: true,
            accountName: response.data.accountName || `${platform.name} Account`
          };
        }
        return platform;
      }));
      
      setConnectionSuccess(id);
      
      toast({
        title: "Account Connected",
        description: `Your ${platforms.find(p => p.id === id)?.name} account has been connected successfully.`
      });
      
    } catch (error: any) {
      console.error("Error connecting platform:", error);
      setConnectionError(id);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      if (id !== 'twitter' && id !== 'linkedin') {
        setIsConnecting(null);
        
        setTimeout(() => {
          setConnectionSuccess(null);
          setConnectionError(null);
        }, 3000);
      }
    }
  };

  const openDisconnectConfirmation = (id: string) => {
    setPlatformToDisconnect(id);
    setConfirmDialogOpen(true);
  };

  const handleCancelDisconnect = () => {
    setConfirmDialogOpen(false);
    setPlatformToDisconnect(null);
  };

  const disconnectPlatform = async (id: string) => {
    try {
      setIsConnecting(id);
      setConnectionSuccess(null);
      setConnectionError(null);
      setConfirmDialogOpen(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to disconnect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        setConnectionError(id);
        return;
      }
      
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', session.user.id)
        .eq('platform', id);
        
      if (error) {
        throw new Error(error.message || "Failed to disconnect account");
      }
      
      setPlatforms(platforms.map(platform => {
        if (platform.id === id) {
          return { ...platform, connected: false, accountName: undefined };
        }
        return platform;
      }));
      
      toast({
        title: "Account Disconnected",
        description: `Your ${platforms.find(p => p.id === id)?.name} account has been disconnected.`
      });
      
      if (onAccountDisconnected) {
        onAccountDisconnected(id);
      }
      
    } catch (error: any) {
      console.error("Error disconnecting platform:", error);
      setConnectionError(id);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
      setPlatformToDisconnect(null);
      
      setTimeout(() => {
        setConnectionSuccess(null);
        setConnectionError(null);
      }, 3000);
    }
  };

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleDone = () => {
    closeDialog();
    if (onDone) onDone();
  };

  const connectTwitter = async () => {
    try {
      setIsConnecting('twitter');
      setConnectionSuccess(null);
      setConnectionError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        setConnectionError('twitter');
        return;
      }
      
      console.log("Starting Twitter OAuth flow...");
      
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
      setIsConnecting(null);
      setConnectionError('twitter');
      toast({
        title: "Twitter Connection Failed",
        description: error.message || "Failed to connect Twitter account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const connectLinkedIn = async () => {
    try {
      setIsConnecting('linkedin');
      setConnectionSuccess(null);
      setConnectionError(null);
      
      console.log("SocialMediaConnect: Starting LinkedIn OAuth flow");
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        setConnectionError('linkedin');
        return;
      }
      
      console.log("SocialMediaConnect: Calling social-auth edge function for LinkedIn auth URL");
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: session.user.id
        }
      });
      
      console.log("SocialMediaConnect: LinkedIn auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start LinkedIn connection");
      }
      
      if (!response.data || !response.data.authUrl) {
        throw new Error("No LinkedIn auth URL returned");
      }
      
      const width = 600, height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      console.log("SocialMediaConnect: Opening LinkedIn auth popup with URL:", response.data.authUrl);
      setLinkedInCallbackReceived(false);
      
      const linkedinPopup = window.open(
        response.data.authUrl,
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!linkedinPopup) {
        throw new Error("Could not open LinkedIn auth popup. Please disable popup blocker.");
      }
      
      console.log("SocialMediaConnect: LinkedIn popup opened successfully");
      setLinkedInWindow(linkedinPopup);
      
      // Add a safety timeout to stop the connecting spinner if we don't get a callback
      setTimeout(() => {
        if (isConnecting === 'linkedin' && !linkedInCallbackReceived) {
          console.log("SocialMediaConnect: LinkedIn connection timeout - no callback received");
          setIsConnecting(null);
          setConnectionError('linkedin');
          toast({
            title: "LinkedIn Connection Failed",
            description: "Connection timed out. Please try again.",
            variant: "destructive"
          });
        }
      }, 90000); // 90-second timeout
      
    } catch (error: any) {
      console.error("SocialMediaConnect: Error connecting LinkedIn account:", error);
      setIsConnecting(null);
      setConnectionError('linkedin');
      toast({
        title: "LinkedIn Connection Failed",
        description: error.message || "Failed to connect LinkedIn account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const PlatformList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {platforms.map((platform) => (
        <div 
          key={platform.id}
          className={`p-4 rounded-lg border ${platform.connected ? `border-[${platform.color}]/30 bg-[${platform.color}]/5` : 'border-border bg-background/60'} transition-all duration-300 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${platform.connected ? `bg-[${platform.color}]/10 text-[${platform.color}]` : 'bg-secondary text-foreground/70'}`} style={{ 
              color: platform.connected ? platform.color : undefined,
              backgroundColor: platform.connected ? `${platform.color}10` : undefined
            }}>
              {platform.icon}
            </div>
            <div>
              <div className="font-medium">{platform.name}</div>
              <div className="text-xs text-muted-foreground">
                {platform.connected 
                  ? `Connected${platform.accountName ? ` as ${platform.accountName}` : ''}` 
                  : 'Not connected'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {connectionSuccess === platform.id && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
            {connectionError === platform.id && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            
            <Button
              variant={platform.connected ? "outline" : "default"}
              size="sm"
              onClick={() => platform.connected 
                ? openDisconnectConfirmation(platform.id) 
                : connectPlatform(platform.id)
              }
              disabled={isConnecting !== null}
              className={platform.connected ? 'border-[#689675]/50 text-[#689675] hover:bg-[#689675]/5' : ''}
              style={{
                borderColor: platform.connected ? '#689675' : undefined,
                color: platform.connected ? '#689675' : undefined,
              }}
            >
              {isConnecting === platform.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : platform.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  if (isDialog) {
    return (
      <>
        <Button onClick={openDialog} className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Connect Account
        </Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md lg:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Connect Your Social Media Accounts</DialogTitle>
              <DialogDescription>
                Link your accounts to publish content across multiple platforms at once.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-4">
              <PlatformList />
              
              <div className="pt-6 border-t border-border mt-6">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span className="font-medium">Your account data is secure</span>
                  </div>
                  <p>We use official APIs and never store your passwords. Connect once and publish everywhere.</p>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Need help? </span>
                    <Button variant="link" className="p-0 h-auto text-primary">View our guide</Button>
                  </div>
                  
                  {platforms.some(p => p.connected) && (
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleDone}
                      className="ml-auto"
                    >
                      Done
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-[#689675]" />
                Disconnect Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disconnect your {platformToDisconnect ? platforms.find(p => p.id === platformToDisconnect)?.name : ''} account? 
                This will remove the connection between your account and this platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDisconnect}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => platformToDisconnect && disconnectPlatform(platformToDisconnect)}
                className="bg-[#689675] hover:bg-[#85A88E]"
              >
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Non-dialog rendering
  return (
    <div className="space-y-6">
      <PlatformList />
    </div>
  );
};

export default SocialMediaConnect;
