
import React, { useEffect } from 'react';
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
import { format, addMinutes } from "date-fns";

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

  // Function to get the next valid time (5 minutes from now, rounded to next 5 min)
  const getNextValidTime = () => {
    const now = new Date();
    const fiveMinutesFromNow = addMinutes(now, 5);
    const minutes = Math.ceil(fiveMinutesFromNow.getMinutes() / 5) * 5;
    
    fiveMinutesFromNow.setMinutes(minutes);
    fiveMinutesFromNow.setSeconds(0);
    
    return {
      timeString: `${String(fiveMinutesFromNow.getHours()).padStart(2, '0')}:${String(fiveMinutesFromNow.getMinutes()).padStart(2, '0')}`,
      date: fiveMinutesFromNow
    };
  };

  // When date changes, validate and potentially update time
  useEffect(() => {
    if (!scheduleDate) return;
    
    const now = new Date();
    const selectedDate = new Date(scheduleDate);
    
    // If selected date is today, ensure time is valid
    if (
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    ) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      const scheduledDateTime = new Date(scheduleDate);
      scheduledDateTime.setHours(hours, minutes, 0, 0);
      
      // If scheduled time is less than 5 minutes from now, update it
      const minScheduleTime = addMinutes(now, 5);
      if (scheduledDateTime < minScheduleTime) {
        const nextValid = getNextValidTime();
        setScheduleTime(nextValid.timeString);
      }
    }
  }, [scheduleDate]);

  // Determine if scheduled date/time is valid
  const getValidationMessage = () => {
    if (!scheduleDate) return "Please select a date";
    if (!scheduleTime) return "Please select a time";
    
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduleDate);
    scheduledDateTime.setHours(hours, minutes, 0, 0);
    
    // Must be at least 5 minutes in the future
    const minScheduleTime = addMinutes(new Date(), 5);
    
    if (scheduledDateTime <= minScheduleTime) {
      return "Schedule time must be at least 5 minutes in the future";
    }
    
    return "";
  };

  const validationMessage = getValidationMessage();

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
          {!isValid && validationMessage && (
            <p className="text-xs text-destructive mt-1">
              {validationMessage}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SchedulePopover;
