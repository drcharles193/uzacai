
import React from 'react';
import { Button } from "@/components/ui/button";
import SchedulePopover from './SchedulePopover';

interface LaunchpadFooterProps {
  onSaveAsDraft: () => void;
  isSchedulePopoverOpen: boolean;
  setIsSchedulePopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDate: Date | undefined;
  setScheduleDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  scheduleTime: string;
  setScheduleTime: React.Dispatch<React.SetStateAction<string>>;
  onSchedulePost: () => void;
  isLoading: boolean;
  postContent: string;
  selectedAccounts: string[];
  onPublishNow?: () => void;
}

const LaunchpadFooter: React.FC<LaunchpadFooterProps> = ({
  onSaveAsDraft,
  isSchedulePopoverOpen,
  setIsSchedulePopoverOpen,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime,
  onSchedulePost,
  isLoading,
  postContent,
  selectedAccounts,
  onPublishNow
}) => {
  const isPostValid = !!postContent && selectedAccounts.length > 0;
  
  // Determine if scheduled date/time is valid
  const isScheduleValid = () => {
    if (!scheduleDate || !scheduleTime) return false;
    
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    // Must be at least 5 minutes in the future
    const minScheduleTime = new Date();
    minScheduleTime.setMinutes(minScheduleTime.getMinutes() + 5);
    
    return scheduledDateTime > minScheduleTime;
  };
  
  return (
    <div className="border-t p-4 flex justify-between">
      <Button 
        variant="outline" 
        onClick={onSaveAsDraft}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save as Draft'}
      </Button>
      <div className="space-x-2">
        <SchedulePopover
          isOpen={isSchedulePopoverOpen}
          setIsOpen={setIsSchedulePopoverOpen}
          scheduleDate={scheduleDate}
          setScheduleDate={setScheduleDate}
          scheduleTime={scheduleTime}
          setScheduleTime={setScheduleTime}
          onSchedulePost={onSchedulePost}
          isLoading={isLoading}
          isValid={isPostValid && isScheduleValid()}
        />
        <Button 
          disabled={!isPostValid || isLoading}
          onClick={onPublishNow}
          className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {isLoading ? 'Publishing...' : 'Publish Now'}
        </Button>
      </div>
    </div>
  );
};

export default LaunchpadFooter;
