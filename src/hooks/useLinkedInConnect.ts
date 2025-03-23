
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseLinkedInConnectProps {
  onSuccess?: (accountName: string) => void;
  onError?: (error: string) => void;
  credentials?: {
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
  } | null;
}

export const useLinkedInConnect = ({
  onSuccess,
  onError,
  credentials
}: UseLinkedInConnectProps = {}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [authUrl, setAuthUrl] = useState('');

  // Function to handle code parameter from URL
  const handleAuthCallback = useCallback(async (code: string) => {
    if (!code) {
      console.error('No authorization code found in URL');
      onError?.('No authorization code found');
      return;
    }

    try {
      setIsConnecting(true);

      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to connect LinkedIn');
      }

      // Call the Supabase Edge Function to handle the callback
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'callback',
          code,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('LinkedIn connection successful:', data);
      onSuccess?.(data.accountName || 'LinkedIn Account');
    } catch (error: any) {
      console.error('Error connecting LinkedIn:', error);
      onError?.(error.message || 'Failed to connect LinkedIn');
    } finally {
      setIsConnecting(false);
    }
  }, [onSuccess, onError]);

  // Function to initiate LinkedIn OAuth flow
  const connectLinkedIn = useCallback(async () => {
    try {
      setIsConnecting(true);

      // Call Supabase Edge Function to get authorization URL - no credentials needed
      const { data, error } = await supabase.functions.invoke('social-auth', {
        body: {
          platform: 'linkedin',
          action: 'auth-url'
          // No need to pass credentials here anymore, using the secrets
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('LinkedIn auth response:', { data, error });

      if (data.authUrl) {
        setAuthUrl(data.authUrl);
        // Redirect to LinkedIn authorization URL
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (error: any) {
      console.error('Error initiating LinkedIn connection:', error);
      onError?.(error.message || 'Failed to initiate LinkedIn connection');
      setIsConnecting(false);
    }
  }, [onError]);

  return {
    connectLinkedIn,
    isConnecting,
    authUrl,
    handleAuthCallback
  };
};
