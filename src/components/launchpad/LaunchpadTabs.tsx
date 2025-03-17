
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
      <TabsList className="space-x-4 mb-6 w-full flex justify-center bg-muted/50 p-1">
        <TabsTrigger value="accounts" className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-2">
          <Users className="h-4 w-4" />
          Accounts
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-2">
          <MonitorSmartphone className="h-4 w-4" />
          Post Preview
        </TabsTrigger>
        <TabsTrigger value="comments" className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2 py-2">
          <MessageSquare className="h-4 w-4" />
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="accounts" className="mt-0 bg-white rounded-lg p-4">
        <AccountsTab 
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
        />
      </TabsContent>
      
      <TabsContent value="preview" className="mt-0 bg-white rounded-lg p-4">
        <PostPreviewTab 
          postContent={postContent}
          mediaPreviewUrls={mediaPreviewUrls}
        />
      </TabsContent>
      
      <TabsContent value="comments" className="mt-0 bg-white rounded-lg p-4">
        <CommentsTab />
      </TabsContent>
    </Tabs>
  );
};

export default LaunchpadTabs;
