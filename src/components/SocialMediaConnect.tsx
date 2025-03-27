import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { LoadingDots } from "@/components/ui/loading-dots";

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
  
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(userId);
  const [connectedAccountNames, setConnectedAccountNames] = useState<{ [key: string]: string }>({});
  
  useEffect(() => {
    if (!currentUserId) {
      const getUserId = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
        }
      };
      getUserId();
    }
  }, [currentUserId]);
  
  useEffect(() => {
    if ((isOpen || isDialog) && currentUserId) {
      checkConnectedAccounts();
    }
  }, [isOpen, isDialog, currentUserId]);
  
  const checkConnectedAccounts = async () => {
    try {
      if (!currentUserId) return;
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('platform, account_name')
        .eq('user_id', currentUserId);
        
      if (error) throw error;
      
      const newConnectionState = {
        twitter: false,
        linkedin: false,
        facebook: false,
        instagram: false
      };
      
      const newAccountNames = {};
      
      data.forEach(account => {
        if (account.platform in newConnectionState) {
          newConnectionState[account.platform] = true;
          newAccountNames[account.platform] = account.account_name;
        }
      });
      
      console.log("Connected accounts state:", newConnectionState);
      setConnected(newConnectionState);
      setConnectedAccountNames(newAccountNames);
    } catch (error: any) {
      console.error("Error checking connected accounts:", error);
    }
  };
  
  const connectTwitter = async () => {
    try {
      setLoading('twitter');
      setError(null);
      
      if (!currentUserId) return;
      
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          action: 'auth-url',
          userId: currentUserId
        }
      });
      
      if (error) throw error;
      
      const { url, state } = data;
      
      const popup = window.open(url, 'twitterAuthPopup', 'width=800,height=600');
      
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            
            await checkConnectedAccounts();
            setLoading(null);
            
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
  
  const connectLinkedIn = async () => {
    try {
      setLoading('linkedin');
      setError(null);
      
      if (!currentUserId) return;
      
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: currentUserId
        }
      });
      
      if (error) throw error;
      
      const { url, state } = data;
      
      const popup = window.open(url, 'linkedinAuthPopup', 'width=800,height=600');
      
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            
            await checkConnectedAccounts();
            setLoading(null);
            
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

  const connectFacebook = async () => {
    try {
      setLoading('facebook');
      setError(null);
      
      if (!currentUserId) return;
      
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
      
      const popup = window.open(url, 'facebookAuthPopup', 'width=800,height=600');
      
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            console.log("Facebook popup closed, checking connection status");
            
            await checkConnectedAccounts();
            setLoading(null);
            
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

  const connectInstagram = async () => {
    try {
      setLoading('instagram');
      setError(null);
      
      if (!currentUserId) return;
      
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
      
      const popup = window.open(url, 'instagramAuthPopup', 'width=800,height=600');
      
      const pollInterval = setInterval(async () => {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollInterval);
            console.log("Instagram popup closed, checking connection status");
            
            await checkConnectedAccounts();
            setLoading(null);
            
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
  
  const handleDisconnect = async (platform: string) => {
    try {
      setLoading(platform);
      
      const { data, error } = await supabase.functions.invoke('disconnect-social', {
        body: {
          userId: currentUserId,
          provider: platform
        }
      });
      
      if (error) throw error;
      
      toast({
        title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Disconnected`,
        description: `Your ${platform} account has been successfully disconnected.`
      });
      
      await checkConnectedAccounts();
      
      if (onAccountDisconnected) {
        onAccountDisconnected(platform);
      }
      
    } catch (error: any) {
      console.error(`Error disconnecting ${platform}:`, error);
      toast({
        title: "Disconnection Failed",
        description: error.message || `Failed to disconnect ${platform}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError(null);
      if (onClose) onClose();
    }
  };
  
  const dialogTrigger = trigger || (
    <Button variant="outline" className="gap-2">
      Connect Accounts
    </Button>
  );

  const renderSocialAccount = (platform: string, name: string, icon: React.ReactNode) => {
    const isConnected = connected[platform];
    const accountName = connectedAccountNames[platform];
    
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? `Connected as ${accountName}` 
                : 'Not connected'}
            </p>
          </div>
        </div>
        
        {loading === platform ? (
          <div className="w-24 flex justify-center">
            <LoadingDots color="#10b981" />
          </div>
        ) : isConnected ? (
          <Button 
            variant="outline" 
            className="text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800"
            onClick={() => handleDisconnect(platform)}
          >
            Disconnect
          </Button>
        ) : (
          <Button 
            className="bg-[#689675] hover:bg-[#85A88EA8]"
            onClick={() => {
              if (platform === 'twitter') connectTwitter();
              if (platform === 'linkedin') connectLinkedIn();
              if (platform === 'facebook') connectFacebook();
              if (platform === 'instagram') connectInstagram();
            }}
          >
            Connect
          </Button>
        )}
      </div>
    );
  };

  return isDialog ? (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-700 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Connect Your Social Media Accounts</h2>
        <p className="text-muted-foreground mb-6">
          Link your accounts to publish content across multiple platforms at once.
        </p>
        
        <div className="space-y-6">
          {renderSocialAccount(
            'twitter', 
            'Twitter / X', 
            <div className="text-[#1DA1F2]">
              <Twitter className="h-5 w-5" />
            </div>
          )}
          
          {renderSocialAccount(
            'linkedin', 
            'LinkedIn', 
            <div className="text-[#0A66C2]">
              <Linkedin className="h-5 w-5" />
            </div>
          )}
          
          {renderSocialAccount(
            'facebook', 
            'Facebook', 
            <div className="text-[#4267B2]">
              <Facebook className="h-5 w-5" />
            </div>
          )}
          
          {renderSocialAccount(
            'instagram', 
            'Instagram', 
            <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white p-1 rounded-full">
              <Instagram className="h-3 w-3" />
            </div>
          )}
          
          <div className="pt-4 border-t mt-4">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mt-0.5"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <div>
                <p>Your account data is secure</p>
                <p className="mt-1">We use official APIs and never store your passwords. Connect once and publish everywhere.</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              Need help? <a href="#" className="text-[#689675] hover:underline">View our guide</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button onClick={onClose} variant="outline" className="mr-2">Done</Button>
      </div>
    </div>
  ) : (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">Connect Your Social Media Accounts</h2>
          <p className="text-muted-foreground mb-6">
            Link your accounts to publish content across multiple platforms at once.
          </p>
          
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm bg-red-50 text-red-700 rounded-md mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-6">
            {renderSocialAccount(
              'twitter', 
              'Twitter / X', 
              <div className="text-[#1DA1F2]">
                <Twitter className="h-5 w-5" />
              </div>
            )}
            
            {renderSocialAccount(
              'linkedin', 
              'LinkedIn', 
              <div className="text-[#0A66C2]">
                <Linkedin className="h-5 w-5" />
              </div>
            )}
            
            {renderSocialAccount(
              'facebook', 
              'Facebook', 
              <div className="text-[#4267B2]">
                <Facebook className="h-5 w-5" />
              </div>
            )}
            
            {renderSocialAccount(
              'instagram', 
              'Instagram', 
              <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white p-1 rounded-full">
                <Instagram className="h-3 w-3" />
              </div>
            )}
            
            <div className="pt-4 border-t mt-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mt-0.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <div>
                  <p>Your account data is secure</p>
                  <p className="mt-1">We use official APIs and never store your passwords. Connect once and publish everywhere.</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm">
                Need help? <a href="#" className="text-[#689675] hover:underline">View our guide</a>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleOpenChange.bind(null, false)} variant="outline">Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaConnect;
