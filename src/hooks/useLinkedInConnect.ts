
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export type LinkedInConnectionState = {
  isConnecting: boolean;
  isConnected: boolean;
  accountName: string | null;
};

type UseLinkedInConnectOptions = {
  onSuccess?: (accountName: string) => void;
  onError?: (error: string) => void;
};

// Define our LinkedIn redirect URI consistently
const LINKEDIN_REDIRECT_URI = "https://www.uzacai.com/auth/linkedin/callback";

export const useLinkedInConnect = (options?: UseLinkedInConnectOptions) => {
  const { toast } = useToast();
  const [state, setState] = useState<LinkedInConnectionState>({
    isConnecting: false,
    isConnected: false,
    accountName: null
  });
  
  // Checks if the user has a LinkedIn account connected
  const checkLinkedInConnection = useCallback(async () => {
    try {
      console.log("Checking LinkedIn connection status...");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found when checking LinkedIn connection");
        return false;
      }
      
      const { data, error } = await supabase
        .from('social_accounts')
        .select('account_name')
        .eq('user_id', session.user.id)
        .eq('platform', 'linkedin')
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error("Error checking LinkedIn connection:", error);
        }
        return false;
      }
      
      if (data) {
        console.log("LinkedIn account found:", data.account_name);
        setState(prev => ({
          ...prev,
          isConnected: true,
          accountName: data.account_name
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
      return false;
    }
  }, []);

  useEffect(() => {
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

          if (options?.onSuccess) {
            options.onSuccess(event.data.accountName || 'LinkedIn Account');
          }
          
          // Clear temporary userId from localStorage
          localStorage.removeItem('linkedin_auth_user_id');
        } else if (event.data.error) {
          // Handle error from callback
          setState(prev => ({
            ...prev,
            isConnecting: false
          }));
          
          const errorMessage = event.data.error || "Failed to connect LinkedIn account";
          toast({
            title: "LinkedIn Connection Failed",
            description: errorMessage,
            variant: "destructive"
          });

          if (options?.onError) {
            options.onError(errorMessage);
          }
          
          // Clear temporary userId from localStorage
          localStorage.removeItem('linkedin_auth_user_id');
        }
      }
    };
    
    window.addEventListener('message', handleLinkedInCallback);
    return () => window.removeEventListener('message', handleLinkedInCallback);
  }, [toast, options, checkLinkedInConnection]);

  const connectLinkedIn = useCallback(async () => {
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
      
      console.log("Starting LinkedIn OAuth flow");
      
      // Store the Supabase URL and key for the callback page
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gvmiaosmypgxrkjwvtbx.supabase.co";
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bWlhb3NteXBneHJrand2dGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwODk4MjIsImV4cCI6MjA1NzY2NTgyMn0.g18SHNPhtHZWzvqNe-XIflpXusypIhaPUgweQzYcUg4";
      
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseKey', supabaseKey);
      
      // Store the redirect URI in localStorage for consistency
      localStorage.setItem('linkedinRedirectUri', LINKEDIN_REDIRECT_URI);
      
      // Log the redirect URI being used
      console.log("Starting LinkedIn OAuth flow with redirect URI:", LINKEDIN_REDIRECT_URI);
      
      const response = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url',
          userId: session.user.id,
          redirectUri: LINKEDIN_REDIRECT_URI
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
      
      if (options?.onError) {
        options.onError(error.message || "Failed to connect LinkedIn account");
      }
    }
  }, [toast, options]);

  const disconnectLinkedIn = useCallback(async () => {
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
        accountName: null
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
      
      if (options?.onError) {
        options.onError(error.message || "Failed to disconnect account");
      }
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [toast, options]);

  return {
    ...state,
    checkConnection: checkLinkedInConnection,
    connectLinkedIn,
    disconnectLinkedIn
  };
};
