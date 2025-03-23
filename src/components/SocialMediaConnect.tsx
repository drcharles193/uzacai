import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Loader2 } from 'lucide-react';
import { useToast as useShadcnToast } from "@/hooks/use-toast";

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
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast: shadowToast } = useShadcnToast();

  const LINKEDIN_REDIRECT_URI = "https://uzacai.com/linkedin-callback.html";

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
    
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.log("Ignoring message from unknown origin:", event.origin);
        return;
      }
      
      console.log("Message received in parent window:", event.data);
      
      if (event.data.type === 'LINKEDIN_AUTH_CALLBACK' && event.data.code) {
        console.log("LinkedIn callback code received:", event.data.code.substring(0, 10) + "...");
        await processLinkedInCallback(event.data.code, event.data.redirectUri);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleConnectAccount = async (platform: string) => {
    if (!userId) {
      toast.error("You must be signed in to connect accounts");
      return;
    }
    
    try {
      setIsLoading(platform);
      
      if (platform === 'twitter') {
        const { data, error } = await supabase.functions.invoke('social-auth', {
          body: {
            platform: 'twitter',
            userId,
            action: 'auth-url'
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data.authUrl) {
          const width = 600;
          const height = 600;
          const left = window.screenX + (window.innerWidth - width) / 2;
          const top = window.screenY + (window.innerHeight - height) / 2;
          
          const popup = window.open(
            data.authUrl,
            'twitter-auth',
            `width=${width},height=${height},left=${left},top=${top}`
          );
          
          const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'TWITTER_AUTH_CALLBACK' && event.data.code) {
              if (popup) popup.close();
              window.removeEventListener('message', handleMessage);
              await processTwitterCallback(event.data.code);
            }
          };
          
          window.addEventListener('message', handleMessage);
        } else {
          throw new Error("Failed to get Twitter auth URL");
        }
      } else if (platform === 'linkedin') {
        console.log("Starting LinkedIn connection process...");
        
        console.log("Using LinkedIn redirect URI:", LINKEDIN_REDIRECT_URI);
        
        const { data, error } = await supabase.functions.invoke('social-auth', {
          body: {
            platform: 'linkedin',
            userId,
            action: 'auth-url',
            redirectUri: LINKEDIN_REDIRECT_URI
          }
        });
        
        if (error) {
          console.error("LinkedIn auth URL error:", error);
          throw error;
        }
        
        if (data && data.authUrl) {
          console.log("LinkedIn auth URL received:", data.authUrl);
          
          const width = 600;
          const height = 700;
          const left = window.screenX + (window.innerWidth - width) / 2;
          const top = window.screenY + (window.innerHeight - height) / 2;
          
          const popup = window.open(
            data.authUrl,
            'linkedin-auth',
            `width=${width},height=${height},left=${left},top=${top}`
          );
          
          if (!popup) {
            throw new Error("Failed to open popup. Please disable popup blocker and try again.");
          }
          
          console.log("LinkedIn auth popup opened");
        } else {
          throw new Error("Failed to get LinkedIn auth URL");
        }
      } else {
        await handleMockConnect(platform);
      }
    } catch (error: any) {
      console.error(`Error connecting to ${platform}:`, error);
      toast.error(`Failed to connect ${platform}: ${error.message}`);
    } finally {
      setIsLoading(null);
    }
  };

  const processTwitterCallback = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'twitter',
          userId,
          code,
          action: 'callback'
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Twitter account connected: ${data.accountName}`);
      
      if (onDone) {
        onDone();
      }
    } catch (error: any) {
      console.error("Error processing Twitter callback:", error);
      toast.error(`Failed to connect Twitter: ${error.message}`);
    }
  };

  const processLinkedInCallback = async (code: string, redirectUri?: string) => {
    try {
      console.log("Processing LinkedIn callback with code:", code.substring(0, 10) + "...");
      
      const exactRedirectUri = LINKEDIN_REDIRECT_URI;
      console.log("Using exact redirect URI for token exchange:", exactRedirectUri);
      
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          userId,
          code,
          action: 'callback',
          redirectUri: exactRedirectUri
        }
      });
      
      if (error) {
        console.error("LinkedIn callback error:", error);
        throw error;
      }
      
      console.log("LinkedIn connection successful:", data);
      toast.success(`LinkedIn account connected: ${data.accountName}`);
      
      if (onDone) {
        onDone();
      }
    } catch (error: any) {
      console.error("Error processing LinkedIn callback:", error);
      toast.error(`Failed to connect LinkedIn: ${error.message}`);
    }
  };

  const handleMockConnect = async (platform: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform,
          userId
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected: ${data.accountName}`);
      
      if (onDone) {
        onDone();
      }
    } catch (error: any) {
      console.error(`Error connecting to ${platform}:`, error);
      toast.error(`Failed to connect ${platform}: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Twitter className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Twitter</h3>
              <p className="text-sm text-muted-foreground">Connect your Twitter account</p>
            </div>
          </div>
          <div className="mt-auto">
            <Button 
              onClick={() => handleConnectAccount('twitter')} 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isLoading !== null}
            >
              {isLoading === 'twitter' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Twitter'
              )}
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-800/20 rounded-full">
              <Linkedin className="h-6 w-6 text-blue-800" />
            </div>
            <div>
              <h3 className="font-semibold">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">Connect your LinkedIn profile</p>
            </div>
          </div>
          <div className="mt-auto">
            <Button 
              onClick={() => handleConnectAccount('linkedin')} 
              className="w-full bg-blue-800 hover:bg-blue-900"
              disabled={isLoading !== null}
            >
              {isLoading === 'linkedin' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect LinkedIn'
              )}
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-600/20 rounded-full">
              <Facebook className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Facebook</h3>
              <p className="text-sm text-muted-foreground">Connect your Facebook page</p>
            </div>
          </div>
          <div className="mt-auto">
            <Button 
              onClick={() => handleConnectAccount('facebook')} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading !== null}
            >
              {isLoading === 'facebook' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Facebook'
              )}
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-tr from-yellow-400/30 via-red-500/30 to-purple-500/30 rounded-full">
              <Instagram className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Instagram</h3>
              <p className="text-sm text-muted-foreground">Connect your Instagram profile</p>
            </div>
          </div>
          <div className="mt-auto">
            <Button 
              onClick={() => handleConnectAccount('instagram')} 
              className="w-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:opacity-90"
              disabled={isLoading !== null}
            >
              {isLoading === 'instagram' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Instagram'
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        {isDialog && onClose && (
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
        )}
        {isDialog && onDone && (
          <Button onClick={onDone}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
};

export default SocialMediaConnect;
