
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface LaunchpadHeaderProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
}

const LaunchpadHeader: React.FC<LaunchpadHeaderProps> = ({
  selectedTab,
  setSelectedTab,
  onClose
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
      <div className="flex items-center gap-2 px-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LaunchpadHeader;
