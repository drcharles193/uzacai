
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
            value="create" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Create Post
          </TabsTrigger>
          <TabsTrigger 
            value="drafts" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="rounded-none py-3 px-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium"
          >
            Feed Content
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LaunchpadHeader;
