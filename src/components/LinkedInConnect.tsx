
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Linkedin } from 'lucide-react';

// Configure your specific redirect URI here
const LINKEDIN_REDIRECT_URI = "https://uzacai.com/linkedin-callback.html";

const LinkedInConnect: React.FC = () => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
    // Store important config values for the callback page
    localStorage.setItem('supabaseUrl', import.meta.env.VITE_SUPABASE_URL || "https://gvmiaosmypgxrkjwvtbx.supabase.co");
    localStorage.setItem('supabaseKey', import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bWlhb3NteXBneHJrand2dGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwODk4MjIsImV4cCI6MjA1NzY2NTgyMn0.g18SHNPhtHZWzvqNe-XIflpXusypIhaPUgweQzYcUg4");
    
    // Check if the user has already connected LinkedIn
    checkLinkedInConnection();
    
    // Add listener for the callback message
    const handleLinkedInCallback = (event: MessageEvent) => {
      if (event.data && event.data.type === 'linkedin-oauth-callback') {
        console.log('Received LinkedIn callback:', event.data);
        
        if (event.data.success) {
          setIsConnected(true);
          setAccountName(event.data.accountName || 'LinkedIn Account');
          setIsConnecting(false);
          
          toast({
            title: "LinkedIn Connected",
            description: `Your LinkedIn account has been connected successfully.`
          });
        }
      }
    };
    
    window.addEventListener('message', handleLinkedInCallback);
    return () => window.removeEventListener('message', handleLinkedInCallback);
  }, []);

  const checkLinkedInConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase
          .from('social_accounts')
          .select('account_name')
          .eq('user_id', session.user.id)
          .eq('platform', 'linkedin')
          .single();
        
        if (data) {
          setIsConnected(true);
          setAccountName(data.account_name);
        }
      }
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
    }
  };

  const connectLinkedIn = async () => {
    try {
      setIsConnecting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect your LinkedIn account.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }
      
      console.log("Starting LinkedIn OAuth flow with redirect URI:", LINKEDIN_REDIRECT_URI);
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: session.user.id
          // No need to send the redirect URI, the function now uses a fixed one
        }
      });
      
      console.log("LinkedIn auth response:", response);
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start LinkedIn connection");
      }
      
      if (!response.data.authUrl) {
        throw new Error("No LinkedIn auth URL returned");
      }
      
      const width = 600, height = 700;
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
      
      // The popup will handle the rest of the flow
      
    } catch (error: any) {
      console.error("Error connecting LinkedIn:", error);
      toast({
        title: "LinkedIn Connection Failed",
        description: error.message || "Failed to connect LinkedIn account. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const disconnectLinkedIn = async () => {
    try {
      setIsConnecting(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to disconnect your LinkedIn account.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }
      
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', session.user.id)
        .eq('platform', 'linkedin');
        
      if (error) {
        throw new Error(error.message || "Failed to disconnect account");
      }
      
      setIsConnected(false);
      setAccountName(null);
      
      toast({
        title: "LinkedIn Disconnected",
        description: "Your LinkedIn account has been disconnected."
      });
      
    } catch (error: any) {
      console.error("Error disconnecting LinkedIn:", error);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center">
            <Linkedin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">LinkedIn</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? `Connected as ${accountName}` 
                : "Connect your LinkedIn account"}
            </p>
          </div>
        </div>
        
        <Button
          variant={isConnected ? "outline" : "default"}
          size="sm"
          onClick={isConnected ? disconnectLinkedIn : connectLinkedIn}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {isConnecting 
            ? "Processing..." 
            : (isConnected ? "Disconnect" : "Connect")}
        </Button>
      </div>
    </div>
  );
};

export default LinkedInConnect;
