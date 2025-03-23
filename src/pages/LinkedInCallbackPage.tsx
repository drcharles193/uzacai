
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LinkedInCallbackPage = () => {
  useEffect(() => {
    const processCallback = async () => {
      // Parse URL parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      // Log debug information
      console.log('LinkedIn callback received:', { code, error, errorDescription });
      
      // Check if there's an error from LinkedIn
      if (error) {
        console.error('LinkedIn auth error:', errorDescription || error);
        
        // Notify opener window about the error
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'linkedin-oauth-callback',
            success: false,
            error: errorDescription || error
          }, '*');
        }
        
        // Close window after a short delay
        setTimeout(() => window.close(), 3000);
        return;
      }
      
      // Check for authorization code
      if (!code) {
        console.error('Missing authorization code in callback');
        
        // Notify opener window about the error
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'linkedin-oauth-callback',
            success: false,
            error: 'Missing authorization code'
          }, '*');
        }
        
        // Close window after a short delay
        setTimeout(() => window.close(), 3000);
        return;
      }
      
      try {
        // Get user ID from localStorage
        const userId = localStorage.getItem('linkedin_auth_user_id');
        
        if (!userId) {
          throw new Error('User ID not found. Please sign in again.');
        }
        
        console.log('Processing LinkedIn callback with user ID:', userId);
        
        // Prepare the data to send to the server
        const callbackData = {
          platform: 'linkedin',
          action: 'callback',
          code: code,
          userId: userId
        };
        
        // Call the social-auth function
        const { data, error } = await supabase.functions.invoke('social-auth', {
          body: callbackData
        });
        
        if (error) {
          throw new Error(`Server error: ${error.message}`);
        }
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        console.log('LinkedIn connection successful:', data);
        
        // Notify opener window about the success
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'linkedin-oauth-callback',
            success: true,
            accountName: data.accountName || 'LinkedIn Account',
            platform: 'linkedin'
          }, '*');
        }
        
        // Close window after success
        setTimeout(() => window.close(), 2000);
        
      } catch (error) {
        console.error('Error processing LinkedIn callback:', error);
        
        // Notify opener window about the error
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'linkedin-oauth-callback',
            success: false,
            error: error.message || 'Unknown error during LinkedIn connection'
          }, '*');
        }
        
        // Close window after error
        setTimeout(() => window.close(), 3000);
      }
    };
    
    processCallback();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">LinkedIn Connection</h1>
        <p className="text-center mb-4">Processing your LinkedIn authentication...</p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInCallbackPage;
