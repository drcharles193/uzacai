
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const DeleteAccountSection = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const openConfirmDialog = () => setIsConfirmOpen(true);
  const closeConfirmDialog = () => {
    setIsConfirmOpen(false);
    setConfirmation('');
  };

  const handleDeleteAccount = async () => {
    if (confirmation !== 'delete my account') return;
    
    setIsLoading(true);
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Call the edge function to delete all user data
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: user.id }
      });
      
      if (error) throw error;
      
      // Sign out the user after successful deletion
      await supabase.auth.signOut();
      
      toast.success("Account successfully deleted");
      navigate('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(`Failed to delete account: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      closeConfirmDialog();
    }
  };

  return (
    <section className="mt-12 border-t pt-6">
      <h3 className="text-lg font-medium mb-4 pb-1 border-b border-destructive w-fit text-destructive">
        Delete Account
      </h3>
      
      <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-destructive flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-destructive mb-1">Warning: This action cannot be undone</h4>
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc pl-4">
              <li>All post drafts</li>
              <li>Scheduled posts</li>
              <li>Connected social media accounts</li>
              <li>Account settings and preferences</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              If you're having issues with the app, consider reaching out to support instead.
            </p>
          </div>
        </div>
      </div>
      
      <Button 
        variant="destructive" 
        onClick={openConfirmDialog}
      >
        Delete Account
      </Button>
      
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please type <strong>delete my account</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="delete my account"
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeConfirmDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount} 
              disabled={confirmation !== 'delete my account' || isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default DeleteAccountSection;
