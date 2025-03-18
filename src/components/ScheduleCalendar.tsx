
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PostCalendar from './schedule/PostCalendar';
import TimeSelector from './schedule/TimeSelector';
import ScheduledPostsList from './schedule/ScheduledPostsList';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';

const ScheduleCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("PM");
  
  const { 
    scheduledPosts, 
    getFilteredPosts, 
    handleDeletePost, 
    handleEditPost 
  } = useScheduledPosts();

  const filteredPosts = getFilteredPosts(date);

  const openLaunchpad = () => {
    // If time is selected, pass it to the LaunchPad
    if (date) {
      const scheduledDate = new Date(date);
      let hours = parseInt(selectedHour);
      
      // Convert to 24-hour format
      if (selectedAmPm === "PM" && hours < 12) {
        hours += 12;
      } else if (selectedAmPm === "AM" && hours === 12) {
        hours = 0;
      }
      
      scheduledDate.setHours(hours, parseInt(selectedMinute));
      
      window.dispatchEvent(new CustomEvent('open-launchpad-with-time', { 
        detail: { scheduledDate } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('open-launchpad'));
    }
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
          <PostCalendar 
            date={date}
            setDate={setDate}
            scheduledPosts={scheduledPosts}
          >
            <TimeSelector
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              selectedAmPm={selectedAmPm}
              setSelectedHour={setSelectedHour}
              setSelectedMinute={setSelectedMinute}
              setSelectedAmPm={setSelectedAmPm}
              onOpenLaunchpad={openLaunchpad}
            />
          </PostCalendar>
          
          <ScheduledPostsList
            date={date}
            filteredPosts={filteredPosts}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
            onOpenLaunchpad={openLaunchpad}
          />
        </div>
      </div>
    </section>
  );
};

export default ScheduleCalendar;
