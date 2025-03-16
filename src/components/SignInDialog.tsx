
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import SignupDialog from './SignupDialog';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message === "Email not confirmed") {
          toast.info("Your email is not confirmed yet. For testing purposes, we'll let you in anyway.");
          
          // Manually set user data for testing
          localStorage.setItem('socialAI_user', JSON.stringify({
            email,
            firstName: "Test",
            lastName: "User",
            signupDate: new Date().toISOString()
          }));
          
          // Close dialog before navigating
          onClose();
          
          // Use navigate instead of direct window.location for SPA navigation
          navigate('/dashboard');
          return;
        }
        throw error;
      }
      
      // Get user metadata
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user && userData.user.user_metadata) {
        // Store in localStorage for components that use it
        localStorage.setItem('socialAI_user', JSON.stringify({
          firstName: userData.user.user_metadata.firstName || '',
          lastName: userData.user.user_metadata.lastName || '',
          email: userData.user.email,
          signupDate: userData.user.user_metadata.signupDate || new Date().toISOString()
        }));
      }
      
      toast.success("Successfully signed in!");
      
      // Close dialog before navigating
      onClose();
      
      // Use navigate instead of direct window.location for SPA navigation
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };
  
  const openSignupDialog = () => {
    // Close the current sign-in dialog
    onClose();
    // Open the signup dialog
    setIsSignupDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md md:max-w-lg w-[90%]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Welcome back!
            </DialogTitle>
            <button 
              onClick={onClose} 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-yellow-50"
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-yellow-50"
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Sign In'}
            </Button>
            
            <div className="flex justify-center text-sm">
              <button 
                type="button" 
                onClick={openSignupDialog} 
                className="text-primary hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <SignupDialog 
        isOpen={isSignupDialogOpen} 
        onClose={() => setIsSignupDialogOpen(false)} 
      />
    </>
  );
};

export default SignInDialog;
