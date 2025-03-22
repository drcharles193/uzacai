
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export const useScheduling = (currentUserId: string | null) => {
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState<string>("12:00");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const schedulePost = async (
    postContent: string, 
    mediaPreviewUrls: string[], 
    selectedAccounts: string[]
  ) => {
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

    if (!currentUserId) {
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
          user_id: currentUserId,
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

  return {
    isSchedulePopoverOpen,
    setIsSchedulePopoverOpen,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    schedulePost,
    isLoading
  };
};
