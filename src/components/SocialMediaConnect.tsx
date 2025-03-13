
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  authUrl: string;
}

const SocialMediaConnect: React.FC = () => {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);
  
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    {
      id: 'twitter',
      name: 'Twitter',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
        </svg>
      ),
      connected: false,
      authUrl: 'https://twitter.com/i/oauth2/authorize'
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
      connected: false,
      authUrl: 'https://api.instagram.com/oauth/authorize'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
        </svg>
      ),
      connected: false,
      authUrl: 'https://www.facebook.com/v16.0/dialog/oauth'
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
      connected: false,
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization'
    }
  ]);

  // Check for OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: `Error connecting account: ${error}`,
          variant: "destructive"
        });
        return;
      }
      
      if (code && state) {
        // Find which platform this is for based on state
        const platformId = state.split('-')[0];
        const platform = platforms.find(p => p.id === platformId);
        
        if (platform) {
          try {
            // In a real app, you'd send this code to your backend to exchange for tokens
            // Simulate API call
            setIsAuthenticating(platformId);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Update platform status
            setPlatforms(platforms.map(p => 
              p.id === platformId ? { ...p, connected: true } : p
            ));
            
            toast({
              title: "Account Connected",
              description: `Your ${platform.name} account has been connected successfully.`
            });
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (error) {
            console.error('Error exchanging code for token:', error);
            toast({
              title: "Connection Error",
              description: `Failed to connect your ${platform.name} account. Please try again.`,
              variant: "destructive"
            });
          } finally {
            setIsAuthenticating(null);
          }
        }
      }
    };
    
    handleOAuthCallback();
  }, []);
  
  // Load connection status from localStorage on component mount
  useEffect(() => {
    const loadConnectionStatus = () => {
      const savedConnections = localStorage.getItem('socialConnections');
      if (savedConnections) {
        try {
          const connections = JSON.parse(savedConnections);
          setPlatforms(platforms.map(platform => ({
            ...platform,
            connected: connections[platform.id] || false
          })));
        } catch (error) {
          console.error('Error loading connection status:', error);
        }
      }
    };
    
    loadConnectionStatus();
  }, []);
  
  // Save connection status to localStorage when it changes
  useEffect(() => {
    const saveConnectionStatus = () => {
      const connections = platforms.reduce((acc, platform) => {
        acc[platform.id] = platform.connected;
        return acc;
      }, {} as Record<string, boolean>);
      
      localStorage.setItem('socialConnections', JSON.stringify(connections));
    };
    
    saveConnectionStatus();
  }, [platforms]);

  const initiateOAuth = (platform: SocialPlatform) => {
    // Generate a random state for security
    const state = `${platform.id}-${Math.random().toString(36).substring(2, 15)}`;
    
    // In a real app, these would be environment variables
    const clientId = platform.id === 'twitter' ? 'YOUR_TWITTER_CLIENT_ID' :
                    platform.id === 'facebook' ? 'YOUR_FACEBOOK_CLIENT_ID' :
                    platform.id === 'instagram' ? 'YOUR_INSTAGRAM_CLIENT_ID' : 'YOUR_LINKEDIN_CLIENT_ID';
    
    // Construct redirect URI - this should match what you've registered with the OAuth provider
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    
    // Construct the full auth URL
    const scope = platform.id === 'twitter' ? 'tweet.read%20users.read%20offline.access' :
                 platform.id === 'facebook' ? 'public_profile,email' :
                 platform.id === 'instagram' ? 'user_profile,user_media' : 'r_liteprofile,r_emailaddress,w_member_social';
    
    const authUrl = `${platform.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=${scope}`;
    
    // In a real implementation, you would redirect to this URL
    // For demo purposes, we'll simulate a successful connection
    simulateOAuthFlow(platform);
  };

  const simulateOAuthFlow = async (platform: SocialPlatform) => {
    try {
      setIsAuthenticating(platform.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Toggle the connection status
      const newConnectedState = !platform.connected;
      
      setPlatforms(platforms.map(p => {
        if (p.id === platform.id) {
          return { ...p, connected: newConnectedState };
        }
        return p;
      }));
      
      toast({
        title: newConnectedState ? "Account Connected" : "Account Disconnected",
        description: `Your ${platform.name} account has been ${newConnectedState ? 'connected' : 'disconnected'} successfully.`
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: `Failed to ${platform.connected ? 'disconnect' : 'connect'} your ${platform.name} account. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(null);
    }
  };

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-secondary/30">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="glass-card rounded-xl shadow-md overflow-hidden animate-scale">
              <div className="p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-semibold mb-4">Connect Your Accounts</h3>
                
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
                            {platform.connected ? 'Connected' : 'Not connected'}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={platform.connected ? "outline" : "default"}
                        size="sm"
                        onClick={() => initiateOAuth(platform)}
                        disabled={isAuthenticating === platform.id}
                        className={platform.connected ? 'border-primary/50 text-primary hover:bg-primary/5' : ''}
                      >
                        {isAuthenticating === platform.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          platform.connected ? 'Disconnect' : 'Connect'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                
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
