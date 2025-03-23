
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

interface LinkedInApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (clientId: string, clientSecret: string, redirectUrl: string) => void;
}

const LinkedInApiKeyDialog: React.FC<LinkedInApiKeyDialogProps> = ({ 
  open, 
  onOpenChange,
  onSave
}) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('https://uzacai.com/');

  const handleSave = () => {
    if (!clientId.trim()) {
      toast.error("Please enter a LinkedIn Client ID");
      return;
    }
    
    if (!clientSecret.trim()) {
      toast.error("Please enter a LinkedIn Client Secret");
      return;
    }
    
    if (!redirectUrl.trim()) {
      toast.error("Please enter a LinkedIn Redirect URL");
      return;
    }
    
    onSave(clientId, clientSecret, redirectUrl);
    toast.success("LinkedIn API credentials saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>LinkedIn API Credentials</DialogTitle>
          <DialogDescription>
            Enter your LinkedIn API credentials to enable LinkedIn integration.
          </DialogDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input 
              id="clientId" 
              value={clientId} 
              onChange={e => setClientId(e.target.value)} 
              placeholder="Enter your LinkedIn Client ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <Input 
              id="clientSecret" 
              type="password"
              value={clientSecret} 
              onChange={e => setClientSecret(e.target.value)} 
              placeholder="Enter your LinkedIn Client Secret"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="redirectUrl">Redirect URL</Label>
            <Input 
              id="redirectUrl" 
              value={redirectUrl} 
              onChange={e => setRedirectUrl(e.target.value)} 
              placeholder="Enter your LinkedIn Redirect URL"
            />
            <p className="text-xs text-muted-foreground">
              Make sure this URL matches exactly what you've configured in LinkedIn Developer Console.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Credentials
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkedInApiKeyDialog;
