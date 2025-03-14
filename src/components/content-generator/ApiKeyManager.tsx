
import React from 'react';
import { Button } from "@/components/ui/button";
import { hasApiKey, removeApiKey } from "@/services/openai";
import { useToast } from "@/components/ui/use-toast";

interface ApiKeyManagerProps {
  hasKey: boolean;
  setHasKey: (hasKey: boolean) => void;
  onOpenDialog: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ hasKey, setHasKey, onOpenDialog }) => {
  const { toast } = useToast();

  const handleRemoveApiKey = () => {
    removeApiKey();
    setHasKey(false);
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed.",
    });
  };

  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button 
        variant="outline" 
        onClick={onOpenDialog}
        className="mt-2"
      >
        {hasKey ? "Change API Key" : "Set OpenAI API Key"}
      </Button>
      {hasKey && (
        <Button 
          variant="outline" 
          onClick={handleRemoveApiKey}
          className="mt-2"
        >
          Remove API Key
        </Button>
      )}
    </div>
  );
};

export default ApiKeyManager;
