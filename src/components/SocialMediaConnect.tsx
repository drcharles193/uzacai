
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import AccountDisconnectButton from './launchpad/AccountDisconnectButton';

interface SocialMediaConnectProps {
  trigger?: React.ReactNode;
  userId?: string;
  onConnect?: () => void;
  isDialog?: boolean;
  onClose?: () => void;
  onDone?: () => void;
  onAccountDisconnected?: (platformId: string) => void;
}

const SocialMediaConnect: React.FC<SocialMediaConnectProps> = ({ 
  trigger, 
  userId,
  onConnect,
  isDialog,
  onClose,
  onDone,
  onAccountDisconnected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<{ [key: string]: boolean }>({
    twitter: false,
    linkedin: false,
    facebook: false,
    instagram: false
  });
  const { toast } = useToast();
  
  // Get user ID from session if not provided
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  
  useEffect(() => {
    if (!currentUserId) {
      // Fetch user ID from session if not provided as prop
      const getUserId = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
        }
      };
      getUserId();
    }
  }, [currentUserId]);
  
  // Check connected accounts when dialog opens
  useEffect(() => {
    if ((isOpen || isDialog) && currentUserId) {
      checkConnectedAccounts();
    }
  }, [isOpen, isDialog, currentUserId]);
  
  // Get current connected accounts
  const checkConnectedAccounts = async () => {
    try {
      if (!currentUserId) return;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('platform')
        .eq('user_id', currentUserId);
        
      if (error) throw error;
      
      // Reset all connections to false
      const newConnectionState = {
        twitter: false,
        linkedin: false,
        facebook: false,
        instagram: false
      };
      
      // Set true for connected platforms
      data.forEach(account => {
        if (account.platform in newConnectionState) {
          newConnectionState[account.platform] = true;
        }
      });
      
      console.log("Connected accounts state:", newConnectionState);
      setConnected(newConnectionState);
    } catch (error: any) {
      console.error("Error checking connected accounts:", error);
    }
  };
  
  // Twitter connection handler
  const connectTwitter = async () => {
    try {
      setLoading('twitter');
      setError(null);
      
      if (!currentUserId) return;
      
      // Call our edge function to get Twitter auth URL
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          action: 'auth-url',
          userId: currentUserId
        }
      });
      
      if (error) throw error;
      
      const { url, state } = data;
      
      // Open Twitter auth in popup
      const popup = window.open(url, 'twitterAuthPopup', 'width=800,height=600');
      
      // Poll for popup closure and handle callback
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            
            // Refresh connected accounts after popup closes
            await checkConnectedAccounts();
            setLoading(null);
            
            // If Twitter is now connected, show success toast
            if (!connected.twitter && (await isTwitterConnected())) {
              toast({
                title: "Twitter Connected",
                description: "Your Twitter account has been successfully connected."
              });
              if (onConnect) onConnect();
              if (onDone) onDone();
            }
          }
        } catch (error) {
          console.error("Error checking popup:", error);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Error connecting to Twitter:", error);
      setError(`Failed to connect: ${error.message}`);
      setLoading(null);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Twitter. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // LinkedIn connection handler
  const connectLinkedIn = async () => {
    try {
      setLoading('linkedin');
      setError(null);
      
      if (!currentUserId) return;
      
      // Call our edge function to get LinkedIn auth URL
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: currentUserId
        }
      });
      
      if (error) throw error;
      
      const { url, state } = data;
      
      // Open LinkedIn auth in popup
      const popup = window.open(url, 'linkedinAuthPopup', 'width=800,height=600');
      
      // Poll for popup closure and handle callback
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            
            // Refresh connected accounts after popup closes
            await checkConnectedAccounts();
            setLoading(null);
            
            // If LinkedIn is now connected, show success toast
            if (!connected.linkedin && (await isLinkedInConnected())) {
              toast({
                title: "LinkedIn Connected",
                description: "Your LinkedIn account has been successfully connected."
              });
              if (onConnect) onConnect();
              if (onDone) onDone();
            }
          }
        } catch (error) {
          console.error("Error checking popup:", error);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Error connecting to LinkedIn:", error);
      setError(`Failed to connect: ${error.message}`);
      setLoading(null);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to LinkedIn. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Facebook connection handler
  const connectFacebook = async () => {
    try {
      setLoading('facebook');
      setError(null);
      
      if (!currentUserId) return;
      
      // Call our edge function to get Facebook auth URL
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'facebook',
          action: 'auth-url',
          userId: currentUserId
        }
      });
      
      if (error) throw error;
      
      const { url, state } = data;
      console.log("Got Facebook auth URL:", url);
      
      // Open Facebook auth in popup
      const popup = window.open(url, 'facebookAuthPopup', 'width=800,height=600');
      
      // Poll for popup closure and handle callback
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            console.log("Facebook popup closed, checking connection status");
            
            // Refresh connected accounts after popup closes
            await checkConnectedAccounts();
            setLoading(null);
            
            // If Facebook is now connected, show success toast
            const isFBConnected = await isFacebookConnected();
            console.log("Is Facebook connected:", isFBConnected);
            
            if (!connected.facebook && isFBConnected) {
              toast({
                title: "Facebook Connected",
                description: "Your Facebook page has been successfully connected."
              });
              if (onConnect) onConnect();
              if (onDone) onDone();
            }
          }
        } catch (error) {
          console.error("Error checking popup:", error);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Error connecting to Facebook:", error);
      setError(`Failed to connect: ${error.message}`);
      setLoading(null);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Facebook. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Instagram connection handler
  const connectInstagram = async () => {
    try {
      setLoading('instagram');
      setError(null);
      
      if (!currentUserId) return;
      
      // Call our edge function to get Instagram auth URL
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'instagram',
          action: 'auth-url',
          userId: currentUserId
        }
      });
      
      if (error) throw error;
      
      const { url, state } = data;
      console.log("Got Instagram auth URL:", url);
      
      // Open Instagram auth in popup
      const popup = window.open(url, 'instagramAuthPopup', 'width=800,height=600');
      
      // Poll for popup closure and handle callback
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            console.log("Instagram popup closed, checking connection status");
            
            // Refresh connected accounts after popup closes
            await checkConnectedAccounts();
            setLoading(null);
            
            // If Instagram is now connected, show success toast
            const isIGConnected = await isInstagramConnected();
            console.log("Is Instagram connected:", isIGConnected);
            
            if (!connected.instagram && isIGConnected) {
              toast({
                title: "Instagram Connected",
                description: "Your Instagram Business account has been successfully connected."
              });
              if (onConnect) onConnect();
              if (onDone) onDone();
            }
          }
        } catch (error) {
          console.error("Error checking popup:", error);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Error connecting to Instagram:", error);
      setError(`Failed to connect: ${error.message}`);
      setLoading(null);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Instagram. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle account disconnection
  const handleAccountDisconnected = (platform: string) => {
    console.log(`${platform} account disconnected`);
    checkConnectedAccounts();
    if (onAccountDisconnected) {
      onAccountDisconnected(platform);
    }
  };
  
  // Check if Twitter is connected
  const isTwitterConnected = async () => {
    try {
      if (!currentUserId) return false;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('platform', 'twitter')
        .limit(1);
        
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking Twitter connection:", error);
      return false;
    }
  };
  
  // Check if LinkedIn is connected
  const isLinkedInConnected = async () => {
    try {
      if (!currentUserId) return false;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('platform', 'linkedin')
        .limit(1);
        
      if (error) throw error;
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
      return false;
    }
  };

  // Check if Facebook is connected
  const isFacebookConnected = async () => {
    try {
      if (!currentUserId) return false;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('platform', 'facebook')
        .limit(1);
        
      if (error) throw error;
      
      console.log("Facebook connection check result:", data);
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking Facebook connection:", error);
      return false;
    }
  };

  // Check if Instagram is connected
  const isInstagramConnected = async () => {
    try {
      if (!currentUserId) return false;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('platform', 'instagram')
        .limit(1);
        
      if (error) throw error;
      
      console.log("Instagram connection check result:", data);
      return data && data.length > 0;
    } catch (error) {
      console.error("Error checking Instagram connection:", error);
      return false;
    }
  };
  
  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError(null);
      if (onClose) onClose();
    }
  };
  
  // Custom trigger or default button
  const dialogTrigger = trigger || (
    <Button variant="outline" className="gap-2">
      Connect Accounts
    </Button>
  );

  // Render the connection buttons without the disconnect buttons in the same line
  const renderConnectionButton = (
    platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram',
    connect: () => void,
    icon: React.ReactNode,
    bgColor: string
  ) => {
    const isConnected = connected[platform];
    const isLoading = loading === platform;
    const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
    const platformLabel = platform === 'facebook' ? 'Facebook page' : 
                         platform === 'instagram' ? 'Instagram Business account' : 
                         `${platformName} account`;

    return (
      <div className="flex flex-col w-full">
        <Button
          variant="outline"
          className={`w-full justify-start gap-3 py-6 ${isConnected ? 'border-green-500 bg-green-50' : ''}`}
          disabled={loading !== null}
          onClick={connect}
        >
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <>
              <div className={`${bgColor} rounded-full p-2 text-white`}>
                {icon}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{isConnected ? `Connected to ${platformName}` : `Connect ${platformName}`}</span>
                <span className="text-xs text-muted-foreground">
                  {isConnected ? `Your ${platformLabel} is connected` : `Connect your ${platformLabel} to post content`}
                </span>
              </div>
              {isConnected && (
                <div className="ml-auto bg-green-100 rounded-full p-1">
                  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              )}
            </>
          )}
        </Button>
        {isConnected && (
          <div className="mt-1 text-right">
            <Button
              variant="link"
              size="sm" 
              className="text-red-500 hover:text-red-600 p-0"
              onClick={() => handleAccountDisconnected(platform)}
            >
              Disconnect
            </Button>
          </div>
        )}
      </div>
    );
  };

  // If isDialog is true, don't render the Dialog wrapper
  return isDialog ? (
    <div className="flex flex-col gap-4 mt-4">
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-700 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Twitter Connection Button */}
      {renderConnectionButton(
        'twitter',
        connectTwitter,
        <Twitter className="h-5 w-5" />,
        'bg-[#1DA1F2]'
      )}
      
      {/* LinkedIn Connection Button */}
      {renderConnectionButton(
        'linkedin',
        connectLinkedIn,
        <Linkedin className="h-5 w-5" />,
        'bg-[#0A66C2]'
      )}

      {/* Facebook Connection Button */}
      {renderConnectionButton(
        'facebook',
        connectFacebook,
        <Facebook className="h-5 w-5" />,
        'bg-[#4267B2]'
      )}

      {/* Instagram Connection Button */}
      {renderConnectionButton(
        'instagram',
        connectInstagram,
        <Instagram className="h-5 w-5" />,
        'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        <p>Connect your social media accounts to post and schedule content directly from the platform.</p>
      </div>
    </div>
  ) : (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Connect Your Social Accounts</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {/* Twitter Connection Button */}
          {renderConnectionButton(
            'twitter',
            connectTwitter,
            <Twitter className="h-5 w-5" />,
            'bg-[#1DA1F2]'
          )}
          
          {/* LinkedIn Connection Button */}
          {renderConnectionButton(
            'linkedin',
            connectLinkedIn,
            <Linkedin className="h-5 w-5" />,
            'bg-[#0A66C2]'
          )}

          {/* Facebook Connection Button */}
          {renderConnectionButton(
            'facebook',
            connectFacebook,
            <Facebook className="h-5 w-5" />,
            'bg-[#4267B2]'
          )}

          {/* Instagram Connection Button */}
          {renderConnectionButton(
            'instagram',
            connectInstagram,
            <Instagram className="h-5 w-5" />,
            'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            <p>Connect your social media accounts to post and schedule content directly from the platform.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaConnect;
