
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export const useScheduling = (currentUserId: string | null) => {
  const [isSchedulePopoverOpen, setIsSchedulePopoverOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(new Date());
  const [scheduleTime, setScheduleTime] = useState<string>(() => {
    // Set default time to current time + 1 hour, rounded to nearest 15 min
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateScheduledTime = (date: Date, time: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDateTime = new Date(date);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    // Must be at least 5 minutes in the future
    const minScheduleTime = new Date();
    minScheduleTime.setMinutes(minScheduleTime.getMinutes() + 5);
    
    return scheduledDateTime > minScheduleTime;
  };

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

    // Validate the scheduled time
    if (!validateScheduledTime(scheduleDate, scheduleTime)) {
      toast({
        title: "Invalid schedule time",
        description: "Please schedule your post at least 5 minutes in the future.",
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
      
      // Return true to indicate success
      return true;
    } catch (error: any) {
      console.error("Error scheduling post:", error);
      toast({
        title: "Error scheduling post",
        description: error.message || "Failed to schedule post. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const isValidSchedule = () => {
    if (!scheduleDate || !scheduleTime) return false;
    return validateScheduledTime(scheduleDate, scheduleTime);
  };

  return {
    isSchedulePopoverOpen,
    setIsSchedulePopoverOpen,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    schedulePost,
    isLoading,
    isValidSchedule
  };
};
