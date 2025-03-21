
import React from 'react';
import DraftsList from './DraftsList';
import LaunchpadTabs from './LaunchpadTabs';
import { PostDraft } from './types';

interface DraftsPanelProps {
  drafts: PostDraft[];
  isLoading: boolean;
  postContent: string;
  mediaPreviewUrls: string[];
  connectedAccounts: Array<{
    platform: string;
    account_name: string;
  }>;
  selectedAccounts: string[];
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
  onLoadDraft: (draft: PostDraft) => void;
  onDeleteDraft: (id: string) => void;
  onCreatePost: () => void;
}

const DraftsPanel: React.FC<DraftsPanelProps> = ({
  drafts,
  isLoading,
  postContent,
  mediaPreviewUrls,
  connectedAccounts,
  selectedAccounts,
  setSelectedAccounts,
  onLoadDraft,
  onDeleteDraft,
  onCreatePost
}) => {
  return (
    <div className="flex divide-x h-full">
      <div className="w-1/2 p-4 overflow-auto">
        <DraftsList 
          drafts={drafts}
          isLoading={isLoading}
          onLoadDraft={onLoadDraft}
          onDeleteDraft={onDeleteDraft}
          onCreatePost={onCreatePost}
        />
      </div>
      <div className="w-1/2 overflow-auto p-4">
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

export default DraftsPanel;
