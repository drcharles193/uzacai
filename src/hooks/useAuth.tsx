
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedSession = localStorage.getItem('auth_session');
        if (savedSession) {
          const userData = JSON.parse(savedSession);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call to your auth provider
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo: Basic validation
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }

      if (password.length < 6) {
        throw new Error('Password is too short');
      }
      
      // Mock successful sign-in
      const userData = {
        id: '123456',
        email: email,
        name: email.split('@')[0],
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(email.split('@')[0])
      };
      
      // Save session
      localStorage.setItem('auth_session', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Sign in successful",
        description: `Welcome back, ${userData.name}!`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful sign-in
      const userData = {
        id: 'g123456',
        email: 'user@gmail.com',
        name: 'Google User',
        avatar: 'https://ui-avatars.com/api/?name=Google+User'
      };
      
      localStorage.setItem('auth_session', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Google Sign In Successful",
        description: `Welcome, ${userData.name}!`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful sign-in
      const userData = {
        id: 'a123456',
        email: 'user@icloud.com',
        name: 'Apple User',
        avatar: 'https://ui-avatars.com/api/?name=Apple+User'
      };
      
      localStorage.setItem('auth_session', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Apple Sign In Successful",
        description: `Welcome, ${userData.name}!`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple sign in failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Basic validation
      if (!email.includes('@')) {
        throw new Error('Invalid email format');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Mock successful sign-up
      const userData = {
        id: 'new' + Date.now().toString(),
        email: email,
        name: name,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name)
      };
      
      localStorage.setItem('auth_session', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Account Created",
        description: `Welcome to Social Automator AI, ${name}!`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed. Please try again.';
      setError(errorMessage);
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('auth_session');
      setUser(null);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists with this email, you'll receive a reset link shortly."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signInWithGoogle,
      signInWithApple,
      signUp,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
