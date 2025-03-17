
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, MonitorSmartphone } from 'lucide-react';
import PostPreviewTab from './PostPreviewTab';
import AccountsTab from './AccountsTab';
import CommentsTab from './CommentsTab';

interface LaunchpadTabsProps {
  postContent: string;
  mediaPreviewUrls: string[];
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
  }>;
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
  return (
    <Tabs defaultValue="accounts" className="w-full">
      <TabsList className="space-x-4 mb-6">
        <TabsTrigger value="preview" className="rounded-full data-[state=active]:bg-gray-100 flex items-center gap-2">
          <MonitorSmartphone className="h-4 w-4" />
          Post Preview
        </TabsTrigger>
        <TabsTrigger value="comments" className="rounded-full data-[state=active]:bg-gray-100 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
        </TabsTrigger>
        <TabsTrigger value="accounts" className="rounded-full data-[state=active]:bg-gray-100 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Accounts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="mt-0">
        <PostPreviewTab 
          postContent={postContent}
          mediaPreviewUrls={mediaPreviewUrls}
        />
      </TabsContent>
      
      <TabsContent value="comments" className="mt-0">
        <CommentsTab />
      </TabsContent>
      
      <TabsContent value="accounts" className="mt-0">
        <AccountsTab 
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
        />
      </TabsContent>
    </Tabs>
  );
};

export default LaunchpadTabs;
