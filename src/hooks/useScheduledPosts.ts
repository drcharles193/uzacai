
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  selectedAccounts: string[];
  scheduledFor: string;
  createdAt: string;
  status: string;
}

export function useScheduledPosts() {
  const { toast } = useToast();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);

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

  const getFilteredPosts = (date: Date | undefined) => {
    if (!date) return [];
    
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === date.getDate() && 
        postDate.getMonth() === date.getMonth() && 
        postDate.getFullYear() === date.getFullYear()
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

  return {
    scheduledPosts,
    getFilteredPosts,
    handleDeletePost,
    handleEditPost
  };
}
