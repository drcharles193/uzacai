
import React, { useState, useEffect } from 'react';
import { KeyIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ApiKeyDialog from './ApiKeyDialog';
import { hasApiKey, removeApiKey } from '@/services/openai';

const ApiKeyManager: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keyStatus, setKeyStatus] = useState<'present' | 'absent'>('absent');

  // Check if API key is present on component mount
  useEffect(() => {
    setKeyStatus(hasApiKey() ? 'present' : 'absent');
  }, []);

  const handleSaveComplete = () => {
    setKeyStatus('present');
  };

  const handleRemoveKey = () => {
    removeApiKey();
    setKeyStatus('absent');
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-center text-muted-foreground mb-2">
        <KeyIcon className={`h-4 w-4 ${keyStatus === 'present' ? 'text-green-500' : 'text-amber-500'}`} />
        <span>
          {keyStatus === 'present' 
            ? 'Using your OpenAI API key for content generation' 
            : 'Please add your OpenAI API key to generate content'}
        </span>
      </div>
      
      {keyStatus === 'present' ? (
        <Button variant="outline" size="sm" onClick={handleRemoveKey}>
          Remove API Key
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          Add API Key
        </Button>
      )}

      <ApiKeyDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        apiKeyInput={apiKeyInput} 
        setApiKeyInput={setApiKeyInput} 
        onSave={handleSaveComplete}
      />
    </div>
  );
};

export default ApiKeyManager;
