
import React, { useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import LinkedInButton from './LinkedInButton';
import { useLinkedInConnect } from '@/hooks/useLinkedInConnect';

const LinkedInConnect: React.FC = () => {
  const { 
    isConnecting, 
    isConnected, 
    accountName, 
    connectLinkedIn, 
    disconnectLinkedIn,
    checkConnection
  } = useLinkedInConnect();

  // Check connection status when component mounts
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleButtonClick = () => {
    if (isConnected) {
      disconnectLinkedIn();
    } else {
      connectLinkedIn();
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0077B5]/10 text-[#0077B5] flex items-center justify-center">
            <Linkedin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium">LinkedIn</h3>
            <p className="text-sm text-muted-foreground">
              {isConnected 
                ? `Connected as ${accountName}` 
                : "Connect your LinkedIn account"}
            </p>
          </div>
        </div>
        
        <LinkedInButton 
          isConnected={isConnected}
          isConnecting={isConnecting}
          onClick={handleButtonClick}
        />
      </div>
    </div>
  );
};

export default LinkedInConnect;
