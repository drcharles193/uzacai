
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from "@/integrations/supabase/client";
import { SocialAccount } from './launchpad/types';
import { useToast } from "@/components/ui/use-toast";

// Import refactored components
import LaunchpadHeader from './launchpad/LaunchpadHeader';
import CreatePostPanel from './launchpad/CreatePostPanel';
import DraftsPanel from './launchpad/DraftsPanel';
import ContentPanel from './launchpad/ContentPanel';
import LaunchpadFooter from './launchpad/LaunchpadFooter';

// Import custom hooks
import { useDrafts } from './launchpad/hooks/useDrafts';
import { useScheduling } from './launchpad/hooks/useScheduling';

interface LaunchPadProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAccounts: SocialAccount[];
}

const LaunchPad: React.FC<LaunchPadProps> = ({ isOpen, onClose, connectedAccounts }) => {
  // State management
  const [selectedTab, setSelectedTab] = useState('create');
  const [postContent, setPostContent] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();

  // Custom hooks
  const { drafts, isLoading: isDraftsLoading, saveDraft, deleteDraft } = useDrafts(currentUser, selectedTab);
  const {
    isSchedulePopoverOpen,
    setIsSchedulePopoverOpen,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    schedulePost,
    isLoading: isSchedulingLoading
  } = useScheduling(currentUser);

  // Determine if any operation is currently loading
  const isLoading = isDraftsLoading || isSchedulingLoading;

  // Get the current user on mount
  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setCurrentUser(data.session.user.id);
      }
    };
    
    getUserId();
  }, []);

  // Handle saving a draft
  const handleSaveAsDraft = () => {
    saveDraft(postContent, mediaPreviewUrls, selectedAccounts);
  };

  // Handle scheduling a post
  const handleSchedulePost = () => {
    schedulePost(postContent, mediaPreviewUrls, selectedAccounts);
  };

  // Handle publishing a post now
  const handlePublishNow = () => {
    if (!postContent.trim() || selectedAccounts.length === 0) {
      toast({
        title: "Incomplete post",
        description: "Please add content and select at least one account to post to.",
        variant: "destructive"
      });
      return;
    }

    // Here we could implement actual publishing logic
    // For now, just show a success toast
    toast({
      title: "Post Published",
      description: "Your post has been published successfully!"
    });
  };

  // Handle loading a draft
  const handleLoadDraft = (draft: any) => {
    setPostContent(draft.content);
    setMediaPreviewUrls(draft.media_urls);
    setSelectedAccounts(draft.selected_accounts);
    setSelectedTab('create');
  };

  // Switch to create tab
  const handleCreatePost = () => {
    setSelectedTab('create');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[1000px] p-0 gap-0 overflow-hidden max-h-[90vh]">
        <DialogTitle className="sr-only">Create Post</DialogTitle>
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
              <CreatePostPanel
                postContent={postContent}
                setPostContent={setPostContent}
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                mediaPreviewUrls={mediaPreviewUrls}
                setMediaPreviewUrls={setMediaPreviewUrls}
                selectedAccounts={selectedAccounts}
                setSelectedAccounts={setSelectedAccounts}
                connectedAccounts={connectedAccounts}
              />
            )}
            
            {selectedTab === 'drafts' && (
              <DraftsPanel
                drafts={drafts}
                isLoading={isLoading}
                postContent={postContent}
                mediaPreviewUrls={mediaPreviewUrls}
                connectedAccounts={connectedAccounts}
                selectedAccounts={selectedAccounts}
                setSelectedAccounts={setSelectedAccounts}
                onLoadDraft={handleLoadDraft}
                onDeleteDraft={deleteDraft}
                onCreatePost={handleCreatePost}
              />
            )}
            
            {selectedTab === 'content' && (
              <ContentPanel
                postContent={postContent}
                mediaPreviewUrls={mediaPreviewUrls}
                connectedAccounts={connectedAccounts}
                selectedAccounts={selectedAccounts}
                setSelectedAccounts={setSelectedAccounts}
              />
            )}
          </div>
          
          <LaunchpadFooter
            onSaveAsDraft={handleSaveAsDraft}
            isSchedulePopoverOpen={isSchedulePopoverOpen}
            setIsSchedulePopoverOpen={setIsSchedulePopoverOpen}
            scheduleDate={scheduleDate}
            setScheduleDate={setScheduleDate}
            scheduleTime={scheduleTime}
            setScheduleTime={setScheduleTime}
            onSchedulePost={handleSchedulePost}
            isLoading={isLoading}
            postContent={postContent}
            selectedAccounts={selectedAccounts}
            onPublishNow={handlePublishNow}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchPad;
