
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import CalendarView from './CalendarView';
import ScheduledPostsList from './ScheduledPostsList';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';

const ScheduleCalendar: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { scheduledPosts, isLoading, deletePost } = useScheduledPosts();

  const filteredPosts = scheduledPosts.filter(post => {
    if (!date) return false;
    
    const postDate = new Date(post.scheduled_for);
    return (
      postDate.getDate() === date.getDate() && 
      postDate.getMonth() === date.getMonth() && 
      postDate.getFullYear() === date.getFullYear()
    );
  });

  const handleEditPost = () => {
    window.dispatchEvent(new CustomEvent('open-launchpad'));
    toast({
      title: "Edit Post",
      description: "Please use the post editor to make changes."
    });
  };

  const openLaunchpad = () => {
    window.dispatchEvent(new CustomEvent('open-launchpad'));
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-slide-up">
            Schedule Your Content
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
            Plan and schedule your posts for the perfect time to reach your audience. Visualize your content calendar at a glance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <CalendarView 
            date={date} 
            setDate={setDate} 
            scheduledPosts={scheduledPosts} 
          />
          
          <ScheduledPostsList
            date={date}
            filteredPosts={filteredPosts}
            isLoading={isLoading}
            onDeletePost={deletePost}
            onEditPost={handleEditPost}
            onCreatePost={openLaunchpad}
          />
        </div>
      </div>
    </section>
  );
};

export default ScheduleCalendar;
