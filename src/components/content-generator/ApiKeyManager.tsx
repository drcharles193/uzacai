
import React from 'react';
import { Button } from "@/components/ui/button";
import { hasApiKey } from "@/services/openai";
import { useToast } from "@/components/ui/use-toast";

interface ApiKeyManagerProps {
  hasKey: boolean;
  setHasKey: (hasKey: boolean) => void;
  onOpenDialog: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ hasKey, setHasKey, onOpenDialog }) => {
  const { toast } = useToast();

  return (
    <div className="mt-4 flex justify-center">
      <div className="text-sm text-center text-muted-foreground">
        Using secure API key via Supabase Edge Functions
      </div>
    </div>
  );
};

export default ApiKeyManager;
