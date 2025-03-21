
import React from 'react';
import PostContentEditor from './PostContentEditor';
import LaunchpadTabs from './LaunchpadTabs';

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
  return (
    <div className="flex divide-x h-full bg-gray-50">
      <div className="w-1/2 overflow-auto">
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
      <div className="w-1/2 overflow-auto">
        <LaunchpadTabs
          postContent={postContent}
          mediaPreviewUrls={mediaPreviewUrls}
          connectedAccounts={connectedAccounts}
          selectedAccounts={selectedAccounts}
          setSelectedAccounts={setSelectedAccounts}
          activeTab="preview"
        />
      </div>
    </div>
  );
};

export default CreatePostPanel;
