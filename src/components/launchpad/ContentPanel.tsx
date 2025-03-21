
import React from 'react';
import PostPreviewTab from './PostPreviewTab';
import LaunchpadTabs from './LaunchpadTabs';

interface ContentPanelProps {
  postContent: string;
  mediaPreviewUrls: string[];
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
    account_type?: string;
    platform_account_id?: string;
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
  return (
    <div className="flex divide-x h-full">
      <div className="w-1/2 p-4 overflow-auto">
        <PostPreviewTab 
          postContent={postContent} 
          mediaPreviewUrls={mediaPreviewUrls}
          selectedAccounts={selectedAccounts}
          connectedAccounts={connectedAccounts}
        />
      </div>
      <div className="w-1/2 overflow-auto p-4">
        <LaunchpadTabs
          postContent={postContent}
          mediaPreviewUrls={mediaPreviewUrls}
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
          activeTab="preview"
        />
      </div>
    </div>
  );
};

export default ContentPanel;
