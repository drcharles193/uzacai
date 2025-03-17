
import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, MonitorSmartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  onSaveDraft: () => void;
  onSchedule: () => void;
  onPublish: () => void;
}

const LaunchpadTabs: React.FC<LaunchpadTabsProps> = ({
  postContent,
  mediaPreviewUrls,
  connectedAccounts,
  selectedAccounts,
  setSelectedAccounts,
  onSaveDraft,
  onSchedule,
  onPublish
}) => {
  const [activeTab, setActiveTab] = useState("accounts");
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsListRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      tabsListRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" onClick={() => scrollTabs('left')} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 overflow-hidden">
          <div ref={tabsListRef} className="overflow-x-auto hide-scrollbar flex">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="space-x-4 mb-6 flex-nowrap">
                <TabsTrigger value="accounts" className="rounded-full data-[state=active]:bg-gray-100 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Accounts
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-full data-[state=active]:bg-gray-100 flex items-center gap-2">
                  <MonitorSmartphone className="h-4 w-4" />
                  Post Preview
                </TabsTrigger>
                <TabsTrigger value="comments" className="rounded-full data-[state=active]:bg-gray-100 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={() => scrollTabs('right')} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 mb-4">
        {activeTab === "accounts" && (
          <AccountsTab 
            connectedAccounts={connectedAccounts}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={setSelectedAccounts}
          />
        )}
        
        {activeTab === "preview" && (
          <PostPreviewTab 
            postContent={postContent}
            mediaPreviewUrls={mediaPreviewUrls}
          />
        )}
        
        {activeTab === "comments" && (
          <CommentsTab />
        )}
      </ScrollArea>

      <div className="border-t pt-4 flex justify-between mt-auto">
        <Button variant="outline" onClick={onSaveDraft}>Save as Draft</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onSchedule}>Schedule</Button>
          <Button 
            disabled={!postContent || selectedAccounts.length === 0}
            onClick={onPublish}
          >
            Publish Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadTabs;
