
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LaunchpadHeader from './launchpad/LaunchpadHeader';
import PostContentEditor from './launchpad/PostContentEditor';
import LaunchpadTabs from './launchpad/LaunchpadTabs';
import PostPreviewTab from './launchpad/PostPreviewTab';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface SocialAccount {
  platform: string;
  account_name: string;
  account_type?: string;
  platform_account_id?: string;
}

interface LaunchPadProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccounts: SocialAccount[];
}

const LaunchPad: React.FC<LaunchPadProps> = ({ isOpen, onClose, connectedAccounts }) => {
  const [selectedTab, setSelectedTab] = useState('create');
  const [postContent, setPostContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);

  const handleContentChange = (content: string) => {
    setPostContent(content);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] p-0 gap-0 overflow-hidden max-h-[90vh]">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center border-b py-2 px-4">
            <div>
              <h2 className="text-lg font-semibold">Create Post</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <LaunchpadHeader selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          
          <div className="flex-1 overflow-auto">
            {selectedTab === 'create' && (
              <div className="flex divide-x h-full">
                <div className="w-2/3 p-4 overflow-auto">
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
                <div className="w-1/3 overflow-auto p-4">
                  <LaunchpadTabs
                    postContent={postContent}
                    mediaPreviewUrls={mediaPreviewUrls}
                    connectedAccounts={connectedAccounts}
                    selectedAccounts={selectedAccounts}
                    setSelectedAccounts={setSelectedAccounts}
                  />
                </div>
              </div>
            )}
            
            {selectedTab === 'drafts' && (
              <div className="p-4 h-full">
                <p className="text-center text-gray-500 p-8">No drafts saved yet.</p>
              </div>
            )}
            
            {selectedTab === 'content' && (
              <div className="flex divide-x h-full">
                <div className="w-1/2 p-4 overflow-auto">
                  <PostPreviewTab postContent={postContent} mediaPreviewUrls={mediaPreviewUrls} />
                </div>
                <div className="w-1/2 overflow-auto p-4">
                  <LaunchpadTabs
                    postContent={postContent}
                    mediaPreviewUrls={mediaPreviewUrls}
                    connectedAccounts={connectedAccounts}
                    selectedAccounts={selectedAccounts}
                    setSelectedAccounts={setSelectedAccounts}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t p-4 flex justify-between">
            <Button variant="outline">Save as Draft</Button>
            <div className="space-x-2">
              <Button variant="outline">Schedule</Button>
              <Button disabled={!postContent || selectedAccounts.length === 0}>Publish Now</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchPad;
