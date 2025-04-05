
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScheduledPost } from '@/components/launchpad/types';
import { format } from 'date-fns';

interface CalendarViewProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  scheduledPosts: ScheduledPost[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ date, setDate, scheduledPosts }) => {
  // Count posts for each day to show in the tooltip
  const getPostsCount = (day: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_for);
      return (
        postDate.getDate() === day.getDate() && 
        postDate.getMonth() === day.getMonth() && 
        postDate.getFullYear() === day.getFullYear()
      );
    }).length;
  };
  
  // Check if day has posts
  const hasPosts = (day: Date) => {
    return getPostsCount(day) > 0;
  };

  // Create custom day content with post indicator
  const renderDay = (day: Date) => {
    const count = getPostsCount(day);
    
    // Always return a React element, using day.getDate() as text content if no posts
    if (count === 0) {
      return <div className="w-full h-full flex items-center justify-center">{day.getDate()}</div>;
    }
    
    // Return a custom component for days with posts
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        {day.getDate()}
        <span 
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center"
          title={`${count} post${count > 1 ? 's' : ''} on ${format(day, 'MMM d')}`}
        >
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className="animate-scale">
      <Card className="glass-card shadow-md border-border/50 overflow-hidden">
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md pointer-events-auto"
            modifiers={{
              booked: (date) => hasPosts(date)
            }}
            modifiersStyles={{
              booked: {
                fontWeight: 'bold',
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
                borderRadius: '0.25rem'
              }
            }}
            components={{
              DayContent: ({ date }) => renderDay(date)
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
