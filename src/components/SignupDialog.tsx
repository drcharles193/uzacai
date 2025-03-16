
import React, { useState } from 'react';
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

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
}

const SignupDialog: React.FC<SignupDialogProps> = ({ isOpen, onClose, planName }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            signupDate: new Date().toISOString(),
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
          }
        }
      });
      
      if (error) throw error;
      
      // Store user info in localStorage as well for the components that use it
      localStorage.setItem('socialAI_user', JSON.stringify({
        firstName,
        lastName,
        email,
        signupDate: new Date().toISOString()
      }));
      
      toast.success(`Account created for ${firstName} ${lastName}!`);
      
      // Close dialog before navigating
      onClose();
      
      // Important: Force a redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
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
            {isLoading ? 'Processing...' : 'Create My Account'}
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
  );
};

export default SignupDialog;
