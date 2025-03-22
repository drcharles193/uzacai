
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostPreviewTab from './PostPreviewTab';
import AccountsTab from './AccountsTab';
import CommentsTab from './CommentsTab';
import FacebookComments from './FacebookComments';
import { SocialAccount } from './types';

interface LaunchpadTabsProps {
  postContent: string;
  mediaPreviewUrls: string[];
  connectedAccounts: SocialAccount[];
  selectedAccounts: string[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}

const LaunchpadTabs: React.FC<LaunchpadTabsProps> = ({
  postContent,
  mediaPreviewUrls,
  connectedAccounts,
  selectedAccounts,
  setSelectedAccounts
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  
  // Check if any Facebook accounts are selected
  const hasFacebookAccounts = connectedAccounts.some(
    account => account.platform === 'facebook' && selectedAccounts.includes(account.account_name)
  );
  
  // Get the first Facebook account ID if any are selected
  const getSelectedFacebookAccountId = () => {
    const facebookAccount = connectedAccounts.find(
      account => account.platform === 'facebook' && selectedAccounts.includes(account.account_name)
    );
    return facebookAccount?.id || '';
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
        <TabsTrigger value="comments">Engagement</TabsTrigger>
        {hasFacebookAccounts && (
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="preview">
        <PostPreviewTab 
          postContent={postContent} 
          mediaPreviewUrls={mediaPreviewUrls} 
          selectedAccounts={selectedAccounts}
          connectedAccounts={connectedAccounts}
        />
      </TabsContent>
      
      <TabsContent value="accounts">
        <AccountsTab 
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
        />
      </TabsContent>
      
      <TabsContent value="comments">
        <CommentsTab 
          selectedAccounts={selectedAccounts}
          connectedAccounts={connectedAccounts}
        />
      </TabsContent>
      
      {hasFacebookAccounts && (
        <TabsContent value="facebook">
          <FacebookComments
            accountId={getSelectedFacebookAccountId()}
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default LaunchpadTabs;
