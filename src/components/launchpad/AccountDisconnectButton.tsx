
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AccountDisconnectButtonProps {
  platform: string;
  onDisconnect?: (platform: string) => void;
}

const AccountDisconnectButton: React.FC<AccountDisconnectButtonProps> = ({ 
  platform, 
  onDisconnect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      
      // Get the current user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Not authenticated");
      }
      
      const userId = sessionData.session.user.id;
      
      // Call the disconnect-social edge function
      const { data, error } = await supabase.functions.invoke('disconnect-social', {
        body: {
          userId,
          provider: platform
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account Disconnected",
        description: `Your ${platform} account has been successfully disconnected.`
      });
      
      if (onDisconnect) {
        onDisconnect(platform);
      }
      
    } catch (error: any) {
      console.error("Error disconnecting account:", error);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {platform}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect your {platform} account? 
              You'll need to reconnect it to post content to this platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDisconnect();
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDisconnecting}
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountDisconnectButton;
