
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LaunchpadHeader from './launchpad/LaunchpadHeader';
import PostContentEditor from './launchpad/PostContentEditor';
import LaunchpadTabs from './launchpad/LaunchpadTabs';
import PostPreviewTab from './launchpad/PostPreviewTab';
import { X, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

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
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState<string>("12:00");
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);
  const { toast } = useToast();

  const handleContentChange = (content: string) => {
    setPostContent(content);
  };

  const handleSaveAsDraft = () => {
    if (!postContent.trim()) {
      toast({
        title: "Cannot save empty draft",
        description: "Please add some content before saving as a draft.",
        variant: "destructive"
      });
      return;
    }

    // Save the draft in local storage
    const draft = {
      id: Date.now().toString(),
      content: postContent,
      mediaUrls: mediaPreviewUrls,
      selectedAccounts,
      createdAt: new Date().toISOString(),
    };

    const existingDrafts = JSON.parse(localStorage.getItem('postDrafts') || '[]');
    localStorage.setItem('postDrafts', JSON.stringify([...existingDrafts, draft]));

    toast({
      title: "Draft Saved",
      description: "Your post has been saved as a draft.",
    });
  };

  const handleSchedulePost = () => {
    if (!scheduleDate) {
      toast({
        title: "Schedule date required",
        description: "Please select a date to schedule your post.",
        variant: "destructive"
      });
      return;
    }

    if (!postContent.trim() || selectedAccounts.length === 0) {
      toast({
        title: "Incomplete post",
        description: "Please add content and select at least one account to post to.",
        variant: "destructive"
      });
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(scheduleDate);
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes);

    // Save the scheduled post in local storage
    const scheduledPost = {
      id: Date.now().toString(),
      content: postContent,
      mediaUrls: mediaPreviewUrls,
      selectedAccounts,
      scheduledFor: scheduledDateTime.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    const existingScheduled = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
    localStorage.setItem('scheduledPosts', JSON.stringify([...existingScheduled, scheduledPost]));

    setIsSchedulePopoverOpen(false);
    
    toast({
      title: "Post Scheduled",
      description: `Your post has been scheduled for ${format(scheduledDateTime, 'PPP')} at ${format(scheduledDateTime, 'p')}.`,
    });
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
              <div className="flex divide-x h-full">
                <div className="w-1/2 p-4 overflow-auto">
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
            
            {selectedTab === 'drafts' && (
              <div className="flex divide-x h-full">
                <div className="w-1/2 p-4 overflow-auto">
                  <p className="text-center text-gray-500 p-8">No drafts saved yet.</p>
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
            <Button variant="outline" onClick={handleSaveAsDraft}>Save as Draft</Button>
            <div className="space-x-2">
              <Popover open={isSchedulePopoverOpen} onOpenChange={setIsSchedulePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Schedule Date</h4>
                      <CalendarComponent
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Schedule Time</h4>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleSchedulePost}
                      disabled={!scheduleDate || !postContent || selectedAccounts.length === 0}
                    >
                      Confirm Schedule
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button disabled={!postContent || selectedAccounts.length === 0}>Publish Now</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchPad;
