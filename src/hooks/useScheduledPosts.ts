
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScheduledPost } from '@/components/launchpad/types';

export const useScheduledPosts = () => {
  const { toast } = useToast();
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
      
      // Ensure the status is explicitly typed as "scheduled" to match the ScheduledPost interface
      const formattedPosts: ScheduledPost[] = data.map(post => ({
        id: post.id,
        content: post.content,
        media_urls: post.media_urls as string[],
        selected_accounts: post.selected_accounts as string[],
        scheduled_for: post.scheduled_for,
        created_at: post.created_at,
        status: "scheduled" as const, // Cast to the literal type "scheduled"
        user_id: post.user_id
      }));
      
      setScheduledPosts(formattedPosts);
    } catch (error) {
      console.error("Error in scheduled posts fetching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchScheduledPosts();
    }
    
    window.addEventListener('focus', fetchScheduledPosts);
    
    return () => {
      window.removeEventListener('focus', fetchScheduledPosts);
    };
  }, [currentUser]);

  const deletePost = async (id: string) => {
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

  return {
    scheduledPosts,
    isLoading,
    currentUser,
    fetchScheduledPosts,
    deletePost
  };
};
