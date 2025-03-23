
import React from 'react';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { useLinkedInConnect } from '@/hooks/useLinkedInConnect';

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
  const { connectLinkedIn, isConnecting } = useLinkedInConnect({
    onSuccess: (accountName) => {
      toast.success(`LinkedIn account connected: ${accountName}`);
      onSuccess?.(accountName);
    },
    onError: (error) => {
      toast.error(`Failed to connect LinkedIn: ${error}`);
      onError?.(error);
    }
  });

  return (
    <Button
      variant={buttonVariant}
      size={buttonSize}
      onClick={connectLinkedIn}
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
  );
};

export default LinkedInConnect;
