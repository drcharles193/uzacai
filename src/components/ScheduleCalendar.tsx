import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledPost {
  id: string;
  content: string;
  media_urls: string[];
  selected_accounts: string[];
  scheduled_for: string;
  created_at: string;
  status: string;
  user_id: string;
}

const ScheduleCalendar: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setCurrentUser(data.session.user.id);
      }
    };
    
    getUserId();
  }, []);

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('scheduled_posts')
          .select('*')
          .order('scheduled_for', { ascending: true });
          
        if (error) {
          console.error("Error fetching scheduled posts:", error);
          toast({
            title: "Error",
            description: "Failed to load scheduled posts. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        const formattedPosts = data.map(post => ({
          id: post.id,
          content: post.content,
          media_urls: post.media_urls as string[],
          selected_accounts: post.selected_accounts as string[],
          scheduled_for: post.scheduled_for,
          created_at: post.created_at,
          status: post.status,
          user_id: post.user_id
        }));
        
        setScheduledPosts(formattedPosts);
      } catch (error) {
        console.error("Error in scheduled posts fetching:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchScheduledPosts();
    }
    
    window.addEventListener('focus', fetchScheduledPosts);
    
    return () => {
      window.removeEventListener('focus', fetchScheduledPosts);
    };
  }, [currentUser, toast]);

  const filteredPosts = scheduledPosts.filter(post => {
    if (!date) return false;
    
    const postDate = new Date(post.scheduled_for);
    return (
      postDate.getDate() === date.getDate() && 
      postDate.getMonth() === date.getMonth() && 
      postDate.getFullYear() === date.getFullYear()
    );
  });

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

  const handleDeletePost = async (id: string) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setScheduledPosts(scheduledPosts.filter(post => post.id !== id));
      
      toast({
        title: "Post Deleted",
        description: "The scheduled post has been removed."
      });
    } catch (error: any) {
      console.error("Error deleting scheduled post:", error);
      toast({
        title: "Error deleting post",
        description: error.message || "Failed to delete post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Scheduled Posts'}
              </h3>
              <Button variant="outline" size="sm" className="text-sm" onClick={openLaunchpad}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Post
              </Button>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const postDate = new Date(post.scheduled_for);
                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                      <div className="p-4 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium">
                          {format(postDate, 'h:mm')}
                          <span className="text-[10px] ml-0.5">{format(postDate, 'a')}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.selected_accounts.map((platform, index) => (
                              <span key={index} className="px-1.5 py-0.5 bg-secondary text-xs rounded-md">
                                {platform}
                              </span>
                            ))}
                          </div>
                          
                          <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
                          
                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className="flex gap-2 mb-2 overflow-x-auto">
                              {post.media_urls.map((url, idx) => (
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
                            onClick={handleEditPost}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button 
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors duration-200"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={isLoading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
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
