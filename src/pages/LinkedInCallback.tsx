
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const LinkedInCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse the URL to get the code and state parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        // Log the parameters for debugging
        console.log('LinkedIn callback triggered. Current URL:', window.location.href);
        console.log('LinkedIn callback parameters:', { 
          code: code ? `${code.substring(0, 5)}...` : null,
          state,
          error: errorParam,
          errorDescription
        });

        if (errorParam) {
          throw new Error(`LinkedIn authentication error: ${errorDescription || errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from LinkedIn');
        }

        // Get the current user to associate the LinkedIn account with
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('You must be logged in to connect a LinkedIn account');
        }

        console.log('Calling social-auth edge function with code and state');
        
        // Call our edge function to exchange the code for tokens and complete the OAuth flow
        const response = await supabase.functions.invoke('social-auth', {
          body: {
            platform: 'linkedin',
            action: 'callback',
            code,
            state,
            userId: user.id
          }
        });

        console.log('LinkedIn auth processing response:', response);

        if (response.error) {
          throw new Error(response.error.message || 'Failed to connect LinkedIn account');
        }

        setSuccess(true);
        toast.success('LinkedIn account successfully connected!');
        
        // Wait a bit before redirecting to make sure toast is visible
        setTimeout(() => {
          navigate('/settings?tab=security', { replace: true });
        }, 2000);
      } catch (err: any) {
        console.error('LinkedIn callback error:', err);
        setError(err.message || 'An error occurred while connecting your LinkedIn account');
        toast.error(err.message || 'Failed to connect LinkedIn account');
        
        // Still navigate away after a delay even if there's an error
        setTimeout(() => navigate('/settings?tab=security', { replace: true }), 3000);
      } finally {
        setLoading(false);
      }
    };

    console.log('LinkedInCallback component mounted');
    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Connecting your LinkedIn account...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-semibold text-red-700 mb-2">Connection Error</h1>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-gray-600">Redirecting you back to settings page...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-semibold text-green-700 mb-2">LinkedIn Connected!</h1>
          <p className="text-gray-600">Your LinkedIn account has been successfully connected.</p>
          <p className="mt-4 text-gray-600">Redirecting you back to settings page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-4 text-lg">Processing LinkedIn authorization...</p>
    </div>
  );
};

export default LinkedInCallback;
