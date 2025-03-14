
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

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      onSave();
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your OpenAI API Key</DialogTitle>
          <DialogDescription>
            Your API key will be stored locally in your browser. It's never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="apiKey">API Key</Label>
          <Input 
            id="apiKey" 
            value={apiKeyInput} 
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="sk-..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-2">
            You can get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI's dashboard</a>.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveApiKey}>Save API Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
