
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const LogoutButton = ({ variant = "default" }: { variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Remove user data from localStorage
      localStorage.removeItem('socialAI_user');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
      });
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button variant={variant} onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
