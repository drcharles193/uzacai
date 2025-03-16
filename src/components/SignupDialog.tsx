
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
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
import SignInDialog from './SignInDialog';

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  prefillEmail?: string;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ isOpen, onClose, planName, prefillEmail }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  
  // Set the email if prefillEmail prop is provided
  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName || !lastName || !email || !password) {
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
      // Calculate trial end date (14 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            trialEndsAt: trialEndDate.toISOString()
          }
        }
      });
      
      if (error) throw error;
      
      // Success message
      toast.success(`Account created for ${firstName} ${lastName}!`);
      
      // Close signup dialog
      onClose();
      
      // Open the sign-in dialog with pre-filled email
      console.log("Opening sign-in dialog after successful signup");
      setShowSignIn(true);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseSignIn = () => {
    setShowSignIn(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md md:max-w-lg w-[90%]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Try all of SocialAI's <span className="text-primary">Premium Capabilities!</span>
            </DialogTitle>
            <button 
              onClick={onClose} 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>
          
          <p className="text-center mb-6">No credit card required. Just the basics.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-slate-50"
                />
              </div>
              <div>
                <Input
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-slate-50"
                />
              </div>
            </div>
            
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
            
            <Button type="submit" className="w-full bg-[#689675] hover:bg-[#85A88EA8]" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create My Account'}
            </Button>
            
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span>All Access</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span>Choose Plan Later</span>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show SignInDialog with the email pre-filled after successful signup */}
      <SignInDialog 
        isOpen={showSignIn} 
        onClose={handleCloseSignIn} 
        prefillEmail={email}
      />
    </>
  );
};

export default SignupDialog;
