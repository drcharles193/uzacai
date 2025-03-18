
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";

interface ScheduledPost {
  id: string;
  scheduledFor: string;
}

interface PostCalendarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  scheduledPosts: ScheduledPost[];
  children: React.ReactNode;
}

const PostCalendar: React.FC<PostCalendarProps> = ({
  date,
  setDate,
  scheduledPosts,
  children
}) => {
  // Function to determine which days have posts scheduled
  const hasPosts = (day: Date) => {
    return scheduledPosts.some(post => {
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === day.getDate() && 
        postDate.getMonth() === day.getMonth() && 
        postDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <Card className="glass-card shadow-md border-border/50 overflow-hidden animate-scale">
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
        
        {children}
      </CardContent>
    </Card>
  );
};

export default PostCalendar;
