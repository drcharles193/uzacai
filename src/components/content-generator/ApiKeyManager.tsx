
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { hasApiKey, setApiKey, removeApiKey } from "@/services/openai";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { LockIcon, KeyIcon } from 'lucide-react';

interface ApiKeyManagerProps {
  hasKey: boolean;
  setHasKey: (hasKey: boolean) => void;
  onOpenDialog: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ hasKey, setHasKey, onOpenDialog }) => {
  const { toast } = useToast();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      setApiKey(apiKey.trim());
      setHasKey(true);
      setShowApiKeyInput(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved and will be used for content generation."
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      {hasKey ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-center text-muted-foreground">
            <KeyIcon className="h-4 w-4 text-green-500" />
            <span>Using your OpenAI API key for content generation</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              removeApiKey();
              setHasKey(false);
              toast({
                title: "API Key Removed",
                description: "Your OpenAI API key has been removed."
              });
            }}
          >
            Remove API Key
          </Button>
        </div>
      ) : showApiKeyInput ? (
        <div className="w-full max-w-md space-y-2">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveKey}>Save</Button>
            <Button 
              variant="outline" 
              onClick={() => setShowApiKeyInput(false)}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your API key is stored locally on your device and never sent to our servers.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-center text-muted-foreground">
            <LockIcon className="h-4 w-4" />
            <span>Using secure API key via Supabase Edge Functions</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowApiKeyInput(true)}
          >
            Use Your Own OpenAI API Key
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManager;
