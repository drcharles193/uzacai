
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Edit3, 
  Eye, 
  MessageCircle, 
  Archive 
} from 'lucide-react';

interface LaunchpadHeaderProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const LaunchpadHeader: React.FC<LaunchpadHeaderProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  return (
    <div className="border-b bg-white">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="h-auto bg-transparent border-b-0 p-0 w-full justify-start">
          <TabsTrigger 
            value="accounts" 
            className="flex items-center gap-2 rounded-none py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium transition-all duration-200"
          >
            <Users className="h-4 w-4" />
            <span>Accounts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="flex items-center gap-2 rounded-none py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium transition-all duration-200"
          >
            <Edit3 className="h-4 w-4" />
            <span>Create Post</span>
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="flex items-center gap-2 rounded-none py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium transition-all duration-200"
          >
            <Eye className="h-4 w-4" />
            <span>Post Preview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="comments" 
            className="flex items-center gap-2 rounded-none py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comments</span>
          </TabsTrigger>
          <TabsTrigger 
            value="drafts" 
            className="flex items-center gap-2 rounded-none py-4 px-6 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#689675] data-[state=active]:font-medium transition-all duration-200"
          >
            <Archive className="h-4 w-4" />
            <span>Drafts</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LaunchpadHeader;
