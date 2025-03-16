
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2 } from "lucide-react";

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  accountName?: string;
}

interface SocialMediaConnectProps {
  isDialog?: boolean;
  onClose?: () => void;
}

const SocialMediaConnect: React.FC<SocialMediaConnectProps> = ({ 
  isDialog = false, 
  onClose 
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'twitter',
      name: 'Twitter',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      ),
      connected: false
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      ),
      connected: false
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
      connected: false
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
      ),
      connected: false
    }
  ]);

  useEffect(() => {
    // Fetch user's connected accounts from Supabase
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
  }, []);

  const connectPlatform = async (id: string) => {
    try {
      setIsConnecting(id);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        return;
      }
      
      // In a real app, this would initiate OAuth flow
      // For this demo, we'll simulate the OAuth flow by directly calling our edge function
      const response = await supabase.functions.invoke('social-auth', {
        body: JSON.stringify({
          platform: id,
          userId: session.user.id
        })
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to connect account");
      }
      
      // Update platforms state with the connected account
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
      
      toast({
        title: "Account Connected",
        description: `Your ${platforms.find(p => p.id === id)?.name} account has been connected successfully.`
      });
      
    } catch (error: any) {
      console.error("Error connecting platform:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const disconnectPlatform = async (id: string) => {
    try {
      setIsConnecting(id);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to disconnect social accounts.",
          variant: "destructive"
        });
        setIsConnecting(null);
        return;
      }
      
      // Delete the connection from database
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', session.user.id)
        .eq('platform', id);
        
      if (error) {
        throw new Error(error.message || "Failed to disconnect account");
      }
      
      // Update local state
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
      
    } catch (error: any) {
      console.error("Error disconnecting platform:", error);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const PlatformList = () => (
    <div className="space-y-4">
      {platforms.map((platform) => (
        <div 
          key={platform.id}
          className={`p-4 rounded-lg border ${platform.connected ? 'border-primary/50 bg-primary/5' : 'border-border bg-background/60'} transition-all duration-300 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${platform.connected ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground/70'}`}>
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
          
          <Button
            variant={platform.connected ? "outline" : "default"}
            size="sm"
            onClick={() => platform.connected 
              ? disconnectPlatform(platform.id) 
              : connectPlatform(platform.id)
            }
            disabled={isConnecting !== null}
            className={platform.connected ? 'border-primary/50 text-primary hover:bg-primary/5' : ''}
          >
            {isConnecting === platform.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : platform.connected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      ))}
    </div>
  );

  // Component can be used either as a section or in a dialog
  if (isDialog) {
    return (
      <>
        <Button onClick={openDialog}>Connect Account</Button>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Connect Your Social Accounts</DialogTitle>
            </DialogHeader>
            
            <div className="p-4">
              <PlatformList />
              
              <div className="pt-4 border-t border-border mt-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    <span>Your account data is secure</span>
                  </div>
                  <p>We use official APIs and never store your passwords.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full section component for landing page
  return (
    <section id="social-connect" className="py-16 md:py-24 bg-secondary/30">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="glass-card rounded-xl shadow-md overflow-hidden animate-scale">
              <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-semibold mb-4">Connect Your Accounts</h3>
                
                <PlatformList />
                
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      <span>Your account data is secure</span>
                    </div>
                    <p>We use official APIs and never store your passwords.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="mb-6 animate-slide-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <span>Simple Integration</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Connect Once, Post Everywhere
              </h2>
              <p className="text-lg text-muted-foreground">
                Seamlessly connect all your social media accounts and manage them from a single dashboard. No more switching between apps.
              </p>
            </div>
            
            <div className="space-y-4 animate-slide-up">
              {[
                {
                  title: "Secure Authentication",
                  description: "Connect securely using official APIs with full data protection."
                },
                {
                  title: "Cross-Platform Posting",
                  description: "Create once and publish to multiple platforms simultaneously."
                },
                {
                  title: "Platform-Specific Formatting",
                  description: "Content automatically optimized for each social network's requirements."
                }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaConnect;
