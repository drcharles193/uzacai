
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Configure the redirect URI here
const LINKEDIN_REDIRECT_URI = "https://uzacai.com/";

export type LinkedInConnectionState = {
  isConnecting: boolean;
  isConnected: boolean;
  accountName: string | null;
};

export const useLinkedInConnect = () => {
  const { toast } = useToast();
  const [state, setState] = useState<LinkedInConnectionState>({
    isConnecting: false,
    isConnected: false,
    accountName: null
  });
  
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
          setState(prev => ({
            ...prev,
            isConnected: true,
            accountName: event.data.accountName || 'LinkedIn Account',
            isConnecting: false
          }));
          
          toast({
            title: "LinkedIn Connected",
            description: `Your LinkedIn account has been connected successfully.`
          });
          
          // Clear temporary userId from localStorage
          localStorage.removeItem('linkedin_auth_user_id');
        } else if (event.data.error) {
          // Handle error from callback
          setState(prev => ({
            ...prev,
            isConnecting: false
          }));
          
          toast({
            title: "LinkedIn Connection Failed",
            description: event.data.error || "Failed to connect LinkedIn account",
            variant: "destructive"
          });
          
          // Clear temporary userId from localStorage
          localStorage.removeItem('linkedin_auth_user_id');
        }
      }
    };
    
    window.addEventListener('message', handleLinkedInCallback);
    return () => window.removeEventListener('message', handleLinkedInCallback);
  }, [toast]);

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
          setState(prev => ({
            ...prev,
            isConnected: true,
            accountName: data.account_name
          }));
        }
      }
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
    }
  };

  const connectLinkedIn = async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect your LinkedIn account.",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, isConnecting: false }));
        return;
      }
      
      // Store the user ID for the callback to use
      localStorage.setItem('linkedin_auth_user_id', session.user.id);
      
      console.log("Starting LinkedIn OAuth flow with redirect URI:", LINKEDIN_REDIRECT_URI);
      
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
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnectLinkedIn = async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to disconnect your LinkedIn account.",
          variant: "destructive"
        });
        setState(prev => ({ ...prev, isConnecting: false }));
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
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        accountName: null,
        isConnecting: false
      }));
      
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
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  return {
    ...state,
    connectLinkedIn,
    disconnectLinkedIn
  };
};
