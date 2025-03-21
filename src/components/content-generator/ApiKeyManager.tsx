
import React from 'react';
import { Button } from "@/components/ui/button";
import { hasApiKey } from "@/services/openai";
import { useToast } from "@/components/ui/use-toast";
import { LockIcon } from 'lucide-react';

interface ApiKeyManagerProps {
  hasKey: boolean;
  setHasKey: (hasKey: boolean) => void;
  onOpenDialog: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ hasKey, setHasKey, onOpenDialog }) => {
  const { toast } = useToast();

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-center text-muted-foreground">
        <LockIcon className="h-4 w-4" />
        <span>Using secure API key via Supabase Edge Functions</span>
      </div>
    </div>
  );
};

export default ApiKeyManager;
