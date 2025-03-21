
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
      setApiKey(apiKeyInput.trim());
      onSave();
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved and will be used for content generation.",
      });
      onOpenChange(false);
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Your OpenAI API Key</DialogTitle>
          <DialogDescription>
            Your API key will be stored securely in your browser and used only for generating content in this application.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <Input 
            id="apiKey" 
            type="password" 
            value={apiKeyInput} 
            onChange={e => setApiKeyInput(e.target.value)} 
            placeholder="sk-..." 
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Your API key is stored locally on your device and never sent to our servers.
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary block mt-1 hover:underline"
            >
              Get your API key from OpenAI
            </a>
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
