
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { setApiKey } from "@/services/openai";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeyInput: string;
  setApiKeyInput: (key: string) => void;
  onSave: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ 
  open, 
  onOpenChange, 
  apiKeyInput, 
  setApiKeyInput,
  onSave
}) => {
  const { toast } = useToast();

  // This dialog is no longer needed as we're using Edge Functions
  // It's kept for backward compatibility but with simplified functionality
  
  const handleSaveApiKey = () => {
    toast({
      title: "Using Secure API Key",
      description: "Your application is now using a securely stored API key via Supabase Edge Functions.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Information</DialogTitle>
          <DialogDescription>
            Your application is now using a securely stored API key via Supabase Edge Functions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your OpenAI API key is now securely stored in Supabase and accessed only from backend Edge Functions.
            This provides better security as your API key is never exposed to the frontend.
          </p>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
