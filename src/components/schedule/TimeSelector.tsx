
import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface TimeSelectorProps {
  selectedHour: string;
  selectedMinute: string;
  selectedAmPm: string;
  setSelectedHour: (hour: string) => void;
  setSelectedMinute: (minute: string) => void;
  setSelectedAmPm: (amPm: string) => void;
  onOpenLaunchpad: () => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedHour,
  selectedMinute,
  selectedAmPm,
  setSelectedHour,
  setSelectedMinute,
  setSelectedAmPm,
  onOpenLaunchpad
}) => {
  // Generate time selection options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
    .map(min => min.toString().padStart(2, '0'));

  return (
    <div className="mt-6 p-4 border rounded-md">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Schedule Time
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Select value={selectedHour} onValueChange={setSelectedHour}>
            <SelectTrigger>
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map(hour => (
                <SelectItem key={`hour-${hour}`} value={hour.toString()}>
                  {hour}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedMinute} onValueChange={setSelectedMinute}>
            <SelectTrigger>
              <SelectValue placeholder="Minute" />
            </SelectTrigger>
            <SelectContent>
              {minutes.map(minute => (
                <SelectItem key={`minute-${minute}`} value={minute}>
                  {minute}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedAmPm} onValueChange={setSelectedAmPm}>
            <SelectTrigger>
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={onOpenLaunchpad} 
          className="mt-4"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule New Post
        </Button>
      </div>
    </div>
  );
};

export default TimeSelector;
