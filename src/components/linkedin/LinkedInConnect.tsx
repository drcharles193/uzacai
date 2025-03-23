
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { useLinkedInConnect } from '@/hooks/useLinkedInConnect';
import LinkedInApiKeyDialog from './LinkedInApiKeyDialog';

interface LinkedInConnectProps {
  onSuccess?: (accountName: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

const LinkedInConnect: React.FC<LinkedInConnectProps> = ({
  onSuccess,
  onError,
  buttonText = "Connect LinkedIn",
  buttonVariant = "default",
  buttonSize = "default",
  showIcon = true
}) => {
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<{
    clientId: string;
    clientSecret: string;
    redirectUrl: string;
  } | null>(null);

  const { connectLinkedIn, isConnecting } = useLinkedInConnect({
    onSuccess: (accountName) => {
      toast.success(`LinkedIn account connected: ${accountName}`);
      onSuccess?.(accountName);
    },
    onError: (error) => {
      toast.error(`Failed to connect LinkedIn: ${error}`);
      onError?.(error);
    },
    credentials
  });

  const handleConnect = () => {
    if (!credentials) {
      setIsApiKeyDialogOpen(true);
    } else {
      connectLinkedIn();
    }
  };

  const handleSaveCredentials = (clientId: string, clientSecret: string, redirectUrl: string) => {
    setCredentials({ clientId, clientSecret, redirectUrl });
    // Automatically attempt to connect after saving credentials
    setTimeout(() => {
      connectLinkedIn();
    }, 500);
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          "Connecting..."
        ) : (
          <>
            {showIcon && <Linkedin className="h-4 w-4 mr-2" />}
            {buttonText}
          </>
        )}
      </Button>

      <LinkedInApiKeyDialog
        open={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
        onSave={handleSaveCredentials}
      />
    </>
  );
};

export default LinkedInConnect;
