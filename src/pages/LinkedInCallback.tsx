import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract code and state from URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('Authorization code not found in callback URL');
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user found. Please sign in again.');
        }

        setStatus('loading');
        setErrorMessage(null);

        console.log("Processing LinkedIn callback with code:", code);

        // Use the hardcoded redirect URI
        const redirectUri = `https://uzacai.com/`;

        // Call the social-auth edge function to process the callback
        const response = await supabase.functions.invoke('social-auth', {
          body: {
            platform: 'linkedin',
            action: 'callback', // Critical parameter that was missing
            code: code,
            state: state,
            userId: user.id,
            redirectUri: redirectUri // Make sure this matches exactly what was used in auth-url
          }
        });

        console.log("LinkedIn callback response:", response);

        if (response.error) {
          throw new Error(response.error.message || 'Failed to process LinkedIn authentication');
        }

        if (!response.data || !response.data.success) {
          throw new Error(response.data?.error || 'Failed to connect LinkedIn account');
        }

        setStatus('success');
        
        // Redirect back to settings page after a short delay
        setTimeout(() => {
          navigate('/settings?tab=security');
        }, 2000);
      } catch (error: any) {
        console.error('Error processing LinkedIn callback:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Something went wrong connecting your LinkedIn account');
        
        // Redirect back to settings page after a delay even if there's an error
        setTimeout(() => {
          navigate('/settings?tab=security');
        }, 3000);
      }
    };

    processCallback();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' ? 'Connecting LinkedIn' : 
             status === 'success' ? 'LinkedIn Connected' : 
             'Connection Error'}
          </h1>
          
          <div className="flex justify-center my-4">
            {status === 'loading' ? (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            ) : status === 'success' ? (
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">
            {status === 'loading' ? 'Please wait while we connect your LinkedIn account...' : 
             status === 'success' ? 'Your LinkedIn account has been successfully connected!' : 
             errorMessage || 'There was an error connecting your LinkedIn account.'}
          </p>
          
          {status !== 'loading' && (
            <p className="text-sm text-gray-500 mt-4">
              Redirecting you back to settings in a few seconds...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkedInCallback;
