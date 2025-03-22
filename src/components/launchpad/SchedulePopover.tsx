
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar } from 'lucide-react';
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
            onClick={onSchedulePost}
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SchedulePopover;
