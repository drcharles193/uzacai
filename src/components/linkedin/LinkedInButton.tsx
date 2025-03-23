
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface LinkedInButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

const LinkedInButton: React.FC<LinkedInButtonProps> = ({ 
  isConnected, 
  isConnecting, 
  onClick 
}) => {
  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      size="sm"
      onClick={onClick}
      disabled={isConnecting}
    >
      {isConnecting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {isConnecting 
        ? "Processing..." 
        : (isConnected ? "Disconnect" : "Connect")}
    </Button>
  );
};

export default LinkedInButton;
