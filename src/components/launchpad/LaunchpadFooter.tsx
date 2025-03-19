
import React from 'react';
import { Button } from "@/components/ui/button";
import SchedulePopover from './SchedulePopover';
import { useIsMobile } from "@/hooks/use-mobile";

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
  selectedAccounts
}) => {
  const isPostValid = !!postContent && selectedAccounts.length > 0;
  const isMobile = useIsMobile();
  
  return (
    <div className={`border-t p-4 flex ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
      <Button 
        variant="outline" 
        onClick={onSaveAsDraft}
        disabled={isLoading}
        className={isMobile ? 'w-full' : ''}
      >
        {isLoading ? 'Saving...' : 'Save as Draft'}
      </Button>
      <div className={`${isMobile ? 'flex w-full' : 'space-x-2'} ${isMobile ? 'space-x-2' : ''}`}>
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
          className={isMobile ? 'flex-1' : ''}
        >
          Publish Now
        </Button>
      </div>
    </div>
  );
};

export default LaunchpadFooter;
