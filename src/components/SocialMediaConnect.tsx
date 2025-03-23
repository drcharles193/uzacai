
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

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };
    
    getUserId();
  }, []);

  const handleConnectAccount = async (platform: string) => {
    if (!userId) {
      toast.error("You must be signed in to connect accounts");
      return;
    }
    
    try {
      setIsLoading(platform);
      
      if (platform === 'twitter') {
        // Get Twitter auth URL from edge function
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
          // Open Twitter auth URL in a popup
          const width = 600;
          const height = 600;
          const left = window.screenX + (window.innerWidth - width) / 2;
          const top = window.screenY + (window.innerHeight - height) / 2;
          
          const popup = window.open(
            data.authUrl,
            'twitter-auth',
            `width=${width},height=${height},left=${left},top=${top}`
          );
          
          // Handle the callback with a window message listener
          const handleMessage = async (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'TWITTER_AUTH_CALLBACK' && event.data.code) {
              // Close the popup
              if (popup) popup.close();
              
              // Remove the listener
              window.removeEventListener('message', handleMessage);
              
              // Process the authorization code
              await processTwitterCallback(event.data.code);
            }
          };
          
          window.addEventListener('message', handleMessage);
        } else {
          throw new Error("Failed to get Twitter auth URL");
        }
      } else if (platform === 'linkedin') {
        // Get LinkedIn auth URL from edge function
        const { data, error } = await supabase.functions.invoke('social-auth', {
          body: {
            platform: 'linkedin',
            userId,
            action: 'auth-url',
            redirectUri: encodeURIComponent(window.location.origin + '/linkedin-callback.html')
          }
        });
        
        if (error) {
          throw error;
        }
        
        if (data && data.authUrl) {
          // Open LinkedIn auth URL in a popup
          const width = 600;
          const height = 700;
          const left = window.screenX + (window.innerWidth - width) / 2;
          const top = window.screenY + (window.innerHeight - height) / 2;
          
          const popup = window.open(
            data.authUrl,
            'linkedin-auth',
            `width=${width},height=${height},left=${left},top=${top}`
          );
          
          // Handle the callback with a window message listener
          const handleMessage = async (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'LINKEDIN_AUTH_CALLBACK' && event.data.code) {
              // Close the popup
              if (popup) popup.close();
              
              // Remove the listener
              window.removeEventListener('message', handleMessage);
              
              // Process the authorization code
              await processLinkedInCallback(event.data.code);
            }
          };
          
          window.addEventListener('message', handleMessage);
        } else {
          throw new Error("Failed to get LinkedIn auth URL");
        }
      } else {
        // Mock other platforms for now
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

  const processLinkedInCallback = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          userId,
          code,
          action: 'callback',
          redirectUri: window.location.origin + '/linkedin-callback.html'
        }
      });
      
      if (error) {
        throw error;
      }
      
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
      // Call the social-auth function to set up the mock account
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
