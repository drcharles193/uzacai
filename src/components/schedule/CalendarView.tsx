
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { ScheduledPost } from '@/components/launchpad/types';

interface CalendarViewProps {
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  scheduledPosts: ScheduledPost[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ date, setDate, scheduledPosts }) => {
  const hasPosts = (day: Date) => {
    return scheduledPosts.some(post => {
      const postDate = new Date(post.scheduled_for);
      return (
        postDate.getDate() === day.getDate() && 
        postDate.getMonth() === day.getMonth() && 
        postDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Render the day cell with an indicator if there are posts
  const renderDay = (day: Date) => {
    const hasPostsForDay = hasPosts(day);
    
    if (hasPostsForDay) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {day.getDate()}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
        </div>
      );
    }
    
    // Always return a React Element, not just a number
    return (
      <div className="flex items-center justify-center">
        {day.getDate()}
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
              Day: ({ date }) => renderDay(date)
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
