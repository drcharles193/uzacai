
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
          isValid={isPostValid}
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
