
import React from 'react';
import PostPreviewTab from './PostPreviewTab';
import LaunchpadTabs from './LaunchpadTabs';
import { useIsMobile } from "@/hooks/use-mobile";

interface ContentPanelProps {
  postContent: string;
  mediaPreviewUrls: string[];
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
  }>;
  selectedAccounts: string[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}

const ContentPanel: React.FC<ContentPanelProps> = ({
  postContent,
  mediaPreviewUrls,
  connectedAccounts,
  selectedAccounts,
  setSelectedAccounts
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'divide-x'} h-full`}>
      <div className={`${isMobile ? 'w-full' : 'w-1/2'} p-4 overflow-auto`}>
        <PostPreviewTab postContent={postContent} mediaPreviewUrls={mediaPreviewUrls} />
      </div>
      <div className={`${isMobile ? 'w-full' : 'w-1/2'} overflow-auto p-4`}>
        <LaunchpadTabs
          postContent={postContent}
          mediaPreviewUrls={mediaPreviewUrls}
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
        />
      </div>
    </div>
  );
};

export default ContentPanel;
