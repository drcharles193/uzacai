
import React from 'react';
import { KeyIcon } from 'lucide-react';

const ApiKeyManager: React.FC = () => {
  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-center text-muted-foreground">
        <KeyIcon className="h-4 w-4 text-green-500" />
        <span>Using a preset OpenAI API key for content generation</span>
      </div>
    </div>
  );
};

export default ApiKeyManager;
