
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostDraft } from '../types';

export const useDrafts = (currentUserId: string | null, selectedTab: string) => {
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load drafts from Supabase when component mounts or tab changes
  useEffect(() => {
    const fetchDrafts = async () => {
      if (selectedTab === 'drafts' && currentUserId) {
        setIsLoading(true);
        
        try {
          const { data, error } = await supabase
            .from('post_drafts')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error("Error fetching drafts:", error);
            toast({
              title: "Error fetching drafts",
              description: error.message,
              variant: "destructive"
            });
            return;
          }
          
          // Convert from database format to component format
          const formattedDrafts = data.map(draft => ({
            id: draft.id,
            content: draft.content,
            media_urls: draft.media_urls as string[],
            selected_accounts: draft.selected_accounts as string[],
            created_at: draft.created_at,
            user_id: draft.user_id
          }));
          
          setDrafts(formattedDrafts);
        } catch (error: any) {
          console.error("Error in draft fetching:", error);
          toast({
            title: "Error",
            description: "Failed to load drafts. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (currentUserId) {
      fetchDrafts();
    }
  }, [selectedTab, currentUserId, toast]);

  const saveDraft = async (content: string, mediaUrls: string[], selectedAccounts: string[]) => {
    if (!content.trim()) {
      toast({
        title: "Cannot save empty draft",
        description: "Please add some content before saving as a draft.",
        variant: "destructive"
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save drafts.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Insert draft into Supabase
      const { data, error } = await supabase
        .from('post_drafts')
        .insert({
          content: content,
          media_urls: mediaUrls,
          selected_accounts: selectedAccounts,
          user_id: currentUserId
        })
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Draft Saved",
        description: "Your post has been saved as a draft.",
      });

      // If we're on the drafts tab, refresh the drafts list
      if (selectedTab === 'drafts') {
        const { data: updatedDrafts, error: fetchError } = await supabase
          .from('post_drafts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!fetchError) {
          // Convert from database format to component format
          const formattedDrafts = updatedDrafts.map(draft => ({
            id: draft.id,
            content: draft.content,
            media_urls: draft.media_urls as string[],
            selected_accounts: draft.selected_accounts as string[],
            created_at: draft.created_at,
            user_id: draft.user_id
          }));
          
          setDrafts(formattedDrafts);
        }
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: error.message || "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('post_drafts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setDrafts(drafts.filter(draft => draft.id !== id));
      
      toast({
        title: "Draft Deleted",
        description: "Your draft has been deleted.",
      });
    } catch (error: any) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error deleting draft",
        description: error.message || "Failed to delete draft. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    drafts,
    isLoading,
    saveDraft,
    deleteDraft
  };
};
