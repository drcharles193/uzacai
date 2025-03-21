
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SchedulePopoverProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scheduleDate: Date | undefined;
  setScheduleDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  scheduleTime: string;
  setScheduleTime: React.Dispatch<React.SetStateAction<string>>;
  onSchedulePost: () => void;
  isLoading: boolean;
  isValid: boolean;
}

const SchedulePopover: React.FC<SchedulePopoverProps> = ({
  isOpen,
  setIsOpen,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime,
  onSchedulePost,
  isLoading,
  isValid
}) => {
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isLoading || !isValid}
          className="border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 shadow-md border-gray-200" align="end">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-base mb-1">Schedule Post</h3>
          <p className="text-sm text-gray-500">Choose when to publish your post</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              Select Date
            </h4>
            <CalendarComponent
              mode="single"
              selected={scheduleDate}
              onSelect={setScheduleDate}
              disabled={(date) => date < new Date()}
              initialFocus
              className={cn("border rounded-md")}
            />
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              Select Time
            </h4>
            <Input
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full border-gray-200"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={onSchedulePost}
            disabled={isLoading || !isValid || !scheduleDate || !scheduleTime}
          >
            {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SchedulePopover;
