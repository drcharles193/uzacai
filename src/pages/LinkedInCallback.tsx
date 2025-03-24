
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LinkedInCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Simulate a successful connection with a delay
    setTimeout(() => {
      setStatus('success');
      
      // Redirect back to settings page after a short delay
      setTimeout(() => {
        navigate('/settings?tab=security');
      }, 2000);
    }, 1500);
  }, [navigate]);

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
