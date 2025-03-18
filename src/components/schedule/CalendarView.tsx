
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
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
