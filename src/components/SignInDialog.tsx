
import React, { useState, useEffect } from 'react';
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

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prefillEmail?: string;
}

const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose, prefillEmail = '' }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Update email if prefillEmail changes
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);
  
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
    
    // Password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days from now
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName: email.split('@')[0], // Default first name from email
              trialEndsAt: trialEndDate.toISOString() // 14 days from now
            }
          }
        });
        
        if (error) throw error;
        
        toast.success("Account created! Please check your email to confirm your registration.");
        onClose();
        console.log("Navigating to /dashin after signup");
        navigate('/dashin', { replace: true }); // Redirect to DashIn page
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast.success("Successfully signed in!");
        onClose();
        console.log("Navigating to /dashin after signin");
        navigate('/dashin', { replace: true }); // Redirect to DashIn page
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg w-[90%]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {isSignUp ? 'Create an account' : 'Welcome back!'}
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
            {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
          
          <div className="flex justify-center text-sm">
            <button 
              type="button" 
              onClick={toggleMode} 
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
