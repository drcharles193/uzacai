
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, Calendar, Send } from 'lucide-react';
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
  
  return (
    <div className="border-t py-4 px-6 bg-white">
      <div className="max-w-3xl mx-auto flex justify-between">
        <Button 
          variant="outline" 
          onClick={onSaveAsDraft}
          disabled={isLoading}
          className="border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <div className="space-x-3">
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
            className="shadow-sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Publish Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadFooter;
