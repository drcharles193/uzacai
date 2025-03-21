
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LaunchpadHeaderProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const LaunchpadHeader: React.FC<LaunchpadHeaderProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  return (
    <div className="flex border-b">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex border-r">
        <TabsList className="h-auto bg-transparent border-b-0 p-0">
          <TabsTrigger 
            value="accounts" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Create Post
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Post Preview
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Comments
          </TabsTrigger>
          <TabsTrigger 
            value="drafts" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Drafts
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LaunchpadHeader;
