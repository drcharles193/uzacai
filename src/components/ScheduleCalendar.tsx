
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Clock, CalendarClock, Trash2, Edit, Plus } from 'lucide-react';

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  selectedAccounts: string[];
  scheduledFor: string;
  createdAt: string;
  status: string;
}

const ScheduleCalendar: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [selectedHour, setSelectedHour] = useState<string>("12");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedAmPm, setSelectedAmPm] = useState<string>("PM");

  // Load scheduled posts from localStorage
  useEffect(() => {
    const loadScheduledPosts = () => {
      const storedPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
      setScheduledPosts(storedPosts);
    };
    
    loadScheduledPosts();
    
    // Set up an event listener to reload posts when storage changes
    window.addEventListener('storage', loadScheduledPosts);
    
    return () => {
      window.removeEventListener('storage', loadScheduledPosts);
    };
  }, []);

  const filteredPosts = scheduledPosts.filter(post => {
    if (!date) return false;
    
    const postDate = new Date(post.scheduledFor);
    return (
      postDate.getDate() === date.getDate() && 
      postDate.getMonth() === date.getMonth() && 
      postDate.getFullYear() === date.getFullYear()
    );
  });

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

  const handleDeletePost = (id: string) => {
    const updatedPosts = scheduledPosts.filter(post => post.id !== id);
    localStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
    setScheduledPosts(updatedPosts);
    
    toast({
      title: "Post Deleted",
      description: "The scheduled post has been removed."
    });
  };

  const handleEditPost = (post: ScheduledPost) => {
    // This would open the LaunchPad component with the post data
    window.dispatchEvent(new CustomEvent('open-launchpad-with-post', { 
      detail: { post } 
    }));
    
    toast({
      title: "Edit Post",
      description: "Please use the post editor to make changes."
    });
  };

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

  // Generate time selection options
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5).map(min => min.toString().padStart(2, '0'));

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
                      onClick={openLaunchpad} 
                      className="mt-4"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule New Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Scheduled Posts'}
              </h3>
              <Button variant="outline" size="sm" className="text-sm" onClick={openLaunchpad}>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
            
            <div className="space-y-3">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const postDate = new Date(post.scheduledFor);
                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="p-4 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
                          {format(postDate, 'h:mm')}
                          <span className="text-[10px] ml-0.5">{format(postDate, 'a')}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.selectedAccounts.map((platform, index) => (
                              <span key={index} className="px-1.5 py-0.5 bg-secondary text-xs rounded-md">
                                {platform}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
                          
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="flex gap-2 mb-2 overflow-x-auto">
                              {post.mediaUrls.map((url, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                  <img 
                                    src={url} 
                                    alt="Post preview" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors duration-200"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors duration-200"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <CalendarClock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-medium mb-2">No posts scheduled</h4>
                  <p className="text-muted-foreground mb-4">Create new content for this date</p>
                  <Button variant="outline" size="sm" onClick={openLaunchpad}>
                    Schedule Post
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleCalendar;
