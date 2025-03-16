
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LaunchpadHeader from './launchpad/LaunchpadHeader';
import PostContentEditor from './launchpad/PostContentEditor';
import LaunchpadTabs from './launchpad/LaunchpadTabs';

interface LaunchPadProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
  }>;
}

const LaunchPad: React.FC<LaunchPadProps> = ({
  isOpen,
  onClose,
  connectedAccounts
}) => {
  const [postContent, setPostContent] = useState('');
  const [selectedTab, setSelectedTab] = useState('create');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0">
        <DialogTitle className="sr-only">Create Post</DialogTitle>
        
        <LaunchpadHeader 
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          onClose={onClose}
        />

        <div className="flex flex-1 h-[600px]">
          <div className="w-3/5 border-r p-4">
            <PostContentEditor 
              postContent={postContent}
              setPostContent={setPostContent}
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              mediaPreviewUrls={mediaPreviewUrls}
              setMediaPreviewUrls={setMediaPreviewUrls}
              selectedAccounts={selectedAccounts}
            />
          </div>

          <div className="w-2/5 p-4">
            <LaunchpadTabs 
              postContent={postContent}
              mediaPreviewUrls={mediaPreviewUrls}
              connectedAccounts={connectedAccounts}
              selectedAccounts={selectedAccounts}
              setSelectedAccounts={setSelectedAccounts}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchPad;
