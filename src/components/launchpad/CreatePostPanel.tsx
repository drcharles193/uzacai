
import React from 'react';
import PostContentEditor from './PostContentEditor';
import LaunchpadTabs from './LaunchpadTabs';
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatePostPanelProps {
  postContent: string;
  setPostContent: React.Dispatch<React.SetStateAction<string>>;
  mediaFiles: File[];
  setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>;
  mediaPreviewUrls: string[];
  setMediaPreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAccounts: string[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
  }>;
}

const CreatePostPanel: React.FC<CreatePostPanelProps> = ({
  postContent,
  setPostContent,
  mediaFiles,
  setMediaFiles,
  mediaPreviewUrls,
  setMediaPreviewUrls,
  selectedAccounts,
  setSelectedAccounts,
  connectedAccounts
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'divide-x'} h-full`}>
      <div className={`${isMobile ? 'w-full' : 'w-1/2'} p-4 overflow-auto`}>
        <PostContentEditor
          postContent={postContent}
          setPostContent={setPostContent}
          mediaFiles={mediaFiles}
          setMediaFiles={setMediaFiles}
          mediaPreviewUrls={mediaPreviewUrls}
          setMediaPreviewUrls={setMediaPreviewUrls}
          selectedAccounts={selectedAccounts}
        />
      </div>
      <div className={`${isMobile ? 'w-full' : 'w-1/2'} overflow-auto p-4`}>
        <LaunchpadTabs
          postContent={postContent}
          mediaPreviewUrls={mediaPreviewUrls}
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
        />
      </div>
    </div>
  );
};

export default CreatePostPanel;
