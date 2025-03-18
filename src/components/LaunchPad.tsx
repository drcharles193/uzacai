import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LaunchpadHeader from './launchpad/LaunchpadHeader';
import PostContentEditor from './launchpad/PostContentEditor';
import LaunchpadTabs from './launchpad/LaunchpadTabs';
import PostPreviewTab from './launchpad/PostPreviewTab';
import { X, Calendar, Trash2, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface PostDraft {
  id: string;
  content: string;
  mediaUrls: string[];
  selectedAccounts: string[];
  createdAt: string;
}

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  selectedAccounts: string[];
  scheduledFor: string;
  createdAt: string;
  status: 'scheduled';
}

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
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("PM");
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTab === 'drafts') {
      const storedDrafts = JSON.parse(localStorage.getItem('postDrafts') || '[]');
      setDrafts(storedDrafts);
    }
  }, [selectedTab, isOpen]);

  useEffect(() => {
    const handleOpenWithTime = (event: CustomEvent) => {
      if (event.detail?.scheduledDate) {
        const date = new Date(event.detail.scheduledDate);
        setScheduleDate(date);
        
        let hours = date.getHours();
        const isPM = hours >= 12;
        
        if (hours > 12) {
          hours -= 12;
        } else if (hours === 0) {
          hours = 12;
        }
        
        setSelectedHour(hours.toString());
        setSelectedMinute(date.getMinutes().toString().padStart(2, '0'));
        setSelectedAmPm(isPM ? "PM" : "AM");
      }
    };

    window.addEventListener('open-launchpad-with-time', handleOpenWithTime as EventListener);
    
    return () => {
      window.removeEventListener('open-launchpad-with-time', handleOpenWithTime as EventListener);
    };
  }, []);

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
    
    if (selectedTab === 'drafts') {
      setDrafts([...existingDrafts, draft]);
    }
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

    const scheduledDateTime = new Date(scheduleDate);
    let hours = parseInt(selectedHour);
    
    if (selectedAmPm === "PM" && hours < 12) {
      hours += 12;
    } else if (selectedAmPm === "AM" && hours === 12) {
      hours = 0;
    }
    
    scheduledDateTime.setHours(hours, parseInt(selectedMinute));

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
    
    window.dispatchEvent(new StorageEvent('storage'));
  };

  const handleDeleteDraft = (id: string) => {
    const existingDrafts = JSON.parse(localStorage.getItem('postDrafts') || '[]');
    const updatedDrafts = existingDrafts.filter((draft: PostDraft) => draft.id !== id);
    localStorage.setItem('postDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    
    toast({
      title: "Draft Deleted",
      description: "Your draft has been deleted.",
    });
  };

  const handleLoadDraft = (draft: PostDraft) => {
    setPostContent(draft.content);
    setMediaPreviewUrls(draft.mediaUrls);
    setSelectedAccounts(draft.selectedAccounts);
    setSelectedTab('create');
    
    toast({
      title: "Draft Loaded",
      description: "Your draft has been loaded into the editor.",
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5).map(min => min.toString().padStart(2, '0'));

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
                  {drafts.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Your Drafts</h3>
                      {drafts.map((draft) => (
                        <div key={draft.id} className="border rounded-md p-4 hover:border-primary transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(draft.createdAt).toLocaleDateString()} 
                                {' · '} 
                                {draft.selectedAccounts.length} {draft.selectedAccounts.length === 1 ? 'account' : 'accounts'}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteDraft(draft.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="line-clamp-3 text-sm mb-3">{draft.content}</p>
                          {draft.mediaUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {draft.mediaUrls.map((url, idx) => (
                                <div key={idx} className="w-16 h-16 rounded overflow-hidden bg-muted">
                                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleLoadDraft(draft)}
                          >
                            Edit Draft
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No drafts saved yet</h3>
                      <p className="text-muted-foreground mb-4">Start creating posts and save them as drafts</p>
                      <Button onClick={() => setSelectedTab('create')}>Create a Post</Button>
                    </div>
                  )}
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
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Schedule Time</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={selectedHour} onValueChange={setSelectedHour}>
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {hours.map(hour => (
                              <SelectItem key={`hour-${hour}`} value={hour.toString()}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                          <SelectTrigger>
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                          <SelectContent>
                            {minutes.map(minute => (
                              <SelectItem key={`minute-${minute}`} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={selectedAmPm} onValueChange={setSelectedAmPm}>
                          <SelectTrigger>
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
