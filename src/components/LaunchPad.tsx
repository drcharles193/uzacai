
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PostDraft {
  id: string;
  content: string;
  media_urls: string[];
  selected_accounts: string[];
  created_at: string;
  user_id: string;
}

interface ScheduledPost {
  id: string;
  content: string;
  media_urls: string[];
  selected_accounts: string[];
  scheduled_for: string;
  created_at: string;
  status: 'scheduled';
  user_id: string;
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
  const [scheduleTime, setScheduleTime] = useState<string>("12:00");
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  // Load drafts from Supabase when component mounts or tab changes
  useEffect(() => {
    const fetchDrafts = async () => {
      if (selectedTab === 'drafts' && currentUser) {
        setIsLoading(true);
        
        try {
          const { data, error } = await supabase
            .from('post_drafts')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error("Error fetching drafts:", error);
            toast({
              title: "Error fetching drafts",
              description: error.message,
              variant: "destructive"
            });
            return;
          }
          
          // Convert from database format to component format
          const formattedDrafts = data.map(draft => ({
            id: draft.id,
            content: draft.content,
            media_urls: draft.media_urls as string[],
            selected_accounts: draft.selected_accounts as string[],
            created_at: draft.created_at,
            user_id: draft.user_id
          }));
          
          setDrafts(formattedDrafts);
        } catch (error) {
          console.error("Error in draft fetching:", error);
          toast({
            title: "Error",
            description: "Failed to load drafts. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (currentUser) {
      fetchDrafts();
    }
  }, [selectedTab, isOpen, currentUser, toast]);

  const handleContentChange = (content: string) => {
    setPostContent(content);
  };

  const handleSaveAsDraft = async () => {
    if (!postContent.trim()) {
      toast({
        title: "Cannot save empty draft",
        description: "Please add some content before saving as a draft.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save drafts.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Insert draft into Supabase
      const { data, error } = await supabase
        .from('post_drafts')
        .insert({
          content: postContent,
          media_urls: mediaPreviewUrls,
          selected_accounts: selectedAccounts,
          user_id: currentUser
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Draft Saved",
        description: "Your post has been saved as a draft.",
      });

      // If we're on the drafts tab, refresh the drafts list
      if (selectedTab === 'drafts') {
        const { data: updatedDrafts, error: fetchError } = await supabase
          .from('post_drafts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!fetchError) {
          // Convert from database format to component format
          const formattedDrafts = updatedDrafts.map(draft => ({
            id: draft.id,
            content: draft.content,
            media_urls: draft.media_urls as string[],
            selected_accounts: draft.selected_accounts as string[],
            created_at: draft.created_at,
            user_id: draft.user_id
          }));
          
          setDrafts(formattedDrafts);
        }
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: error.message || "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchedulePost = async () => {
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

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to schedule posts.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Combine date and time
      const scheduledDateTime = new Date(scheduleDate);
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes);
      
      // Insert scheduled post into Supabase
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          content: postContent,
          media_urls: mediaPreviewUrls,
          selected_accounts: selectedAccounts,
          scheduled_for: scheduledDateTime.toISOString(),
          user_id: currentUser,
          status: 'scheduled'
        });
        
      if (error) {
        throw error;
      }
      
      setIsSchedulePopoverOpen(false);
      
      toast({
        title: "Post Scheduled",
        description: `Your post has been scheduled for ${format(scheduledDateTime, 'PPP')} at ${format(scheduledDateTime, 'p')}.`,
      });
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      toast({
        title: "Error scheduling post",
        description: error.message || "Failed to schedule post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('post_drafts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setDrafts(drafts.filter(draft => draft.id !== id));
      
      toast({
        title: "Draft Deleted",
        description: "Your draft has been deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error deleting draft",
        description: error.message || "Failed to delete draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDraft = (draft: PostDraft) => {
    setPostContent(draft.content);
    setMediaPreviewUrls(draft.media_urls);
    setSelectedAccounts(draft.selected_accounts);
    setSelectedTab('create');
    
    toast({
      title: "Draft Loaded",
      description: "Your draft has been loaded into the editor.",
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
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : drafts.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Your Drafts</h3>
                      {drafts.map((draft) => (
                        <div key={draft.id} className="border rounded-md p-4 hover:border-primary transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Created {new Date(draft.created_at).toLocaleDateString()} 
                                {' · '} 
                                {draft.selected_accounts.length} {draft.selected_accounts.length === 1 ? 'account' : 'accounts'}
                              </p>
                            </div>
                          </div>
                          <p className="line-clamp-3 text-sm mb-3">{draft.content}</p>
                          {draft.media_urls.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {draft.media_urls.map((url, idx) => (
                                <div key={idx} className="w-16 h-16 rounded overflow-hidden bg-muted">
                                  <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleLoadDraft(draft)}
                            >
                              Edit Draft
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-white hover:bg-red-500"
                              onClick={() => handleDeleteDraft(draft.id)}
                              disabled={isLoading}
                            >
                              Delete
                            </Button>
                          </div>
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
            <Button 
              variant="outline" 
              onClick={handleSaveAsDraft}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </Button>
            <div className="space-x-2">
              <Popover open={isSchedulePopoverOpen} onOpenChange={setIsSchedulePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={isLoading}>
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
                      disabled={isLoading || !scheduleDate || !postContent || selectedAccounts.length === 0}
                    >
                      {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button disabled={!postContent || selectedAccounts.length === 0 || isLoading}>Publish Now</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LaunchPad;
