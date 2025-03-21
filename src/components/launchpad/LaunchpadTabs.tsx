
import React from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import PostPreviewTab from './PostPreviewTab';
import AccountsTab from './AccountsTab';
import CommentsTab from './CommentsTab';

interface LaunchpadTabsProps {
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
  activeTab: string;
}

const LaunchpadTabs: React.FC<LaunchpadTabsProps> = ({
  postContent,
  mediaPreviewUrls,
  connectedAccounts,
  selectedAccounts,
  setSelectedAccounts,
  activeTab
}) => {
  return (
    <div className="w-full">
      <div className="mt-0">
        {activeTab === 'accounts' && (
          <AccountsTab 
            connectedAccounts={connectedAccounts}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
          />
        )}
        
        {activeTab === 'preview' && (
          <PostPreviewTab 
            postContent={postContent}
            mediaPreviewUrls={mediaPreviewUrls}
            selectedAccounts={selectedAccounts}
            connectedAccounts={connectedAccounts}
          />
        )}
        
        {activeTab === 'comments' && (
          <CommentsTab 
            selectedAccounts={selectedAccounts}
            connectedAccounts={connectedAccounts}
          />
        )}
      </div>
    </div>
  );
};

export default LaunchpadTabs;
