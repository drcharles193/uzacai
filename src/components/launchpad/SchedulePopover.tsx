
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
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

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
              disabled={(date) => isPastDate(date)}
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
            <p className="text-xs text-muted-foreground mt-1">
              {scheduleDate ? `Scheduling for: ${format(scheduleDate, 'EEEE, MMMM d, yyyy')} at ${scheduleTime}` : 'Select a date first'}
            </p>
          </div>
          <Button 
            className="w-full" 
            onClick={onSchedulePost}
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
          </Button>
          {!isValid && scheduleDate && (
            <p className="text-xs text-destructive mt-1">
              Please schedule your post at least 5 minutes in the future.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SchedulePopover;
