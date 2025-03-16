
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import SignInDialog from '@/components/SignInDialog';

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // First check localStorage for dev/testing purposes
        const userData = localStorage.getItem('socialAI_user');
        if (userData) {
          navigate('/dashboard');
          return;
        }
        
        // Then check actual session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          // User is authenticated, redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session found, set loading to false to show login options
          setLoading(false);
        }
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    handleAuthRedirect();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-opacity-50 mx-auto mb-4"></div>
          <p className="text-lg">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h1>
          <p className="mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please sign in to access this section.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => setShowSignInDialog(true)}>Sign In</Button>
          <Button onClick={() => navigate('/')}>Return to Home</Button>
        </div>
      </div>

      <SignInDialog 
        isOpen={showSignInDialog} 
        onClose={() => setShowSignInDialog(false)} 
      />
    </div>
  );
};

export default Auth;
