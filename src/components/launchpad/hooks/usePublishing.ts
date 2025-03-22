
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialAccount } from '../types';

export const usePublishing = (currentUserId: string | null) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const publishNow = async (
    postContent: string,
    mediaPreviewUrls: string[],
    selectedAccounts: string[],
    connectedAccounts: SocialAccount[]
  ) => {
    if (!postContent.trim() || selectedAccounts.length === 0) {
      toast({
        title: "Incomplete post",
        description: "Please add content and select at least one account to post to.",
        variant: "destructive"
      });
      return false;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to publish posts.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsPublishing(true);
      console.log("Publishing post...");
      
      // Map selected account names to their platforms
      const selectedAccountDetails = connectedAccounts.filter(account => 
        selectedAccounts.includes(account.account_name)
      );
      
      const platforms = selectedAccountDetails.map(account => account.platform);
      
      console.log("Selected accounts:", selectedAccounts);
      console.log("Publishing to platforms:", platforms);
      
      // Process media URLs - for now, we'll handle this later with proper file uploads
      // For the MVP, let's just skip blob URLs
      const validMediaUrls = mediaPreviewUrls.filter(url => !url.startsWith('blob:'));
      
      // Call our edge function to handle the publishing
      const { data, error } = await supabase.functions.invoke('social-publish', {
        body: {
          userId: currentUserId,
          content: postContent,
          mediaUrls: validMediaUrls,
          selectedAccounts,
          platforms
        }
      });

      if (error) {
        console.error("Error invoking function:", error);
        throw new Error(`Failed to publish: ${error.message}`);
      }

      console.log("Publish response:", data);
      
      if (data.errors && data.errors.length > 0) {
        // We have some errors
        if (data.success) {
          // But some posts were successful
          toast({
            title: "Partially Published",
            description: `Some posts were published but there were errors with: ${data.errors.map((e: any) => e.platform).join(', ')}`,
            variant: "default"
          });
        } else {
          // All posts failed
          const errorMessage = data.errors[0].error || 'Missing API credentials';
          throw new Error(`Failed to publish: ${errorMessage}`);
        }
      } else {
        // All posts were successful
        toast({
          title: "Post Published",
          description: "Your post has been published successfully!"
        });
      }

      return true; // Return true to indicate successful publish
    } catch (error: any) {
      console.error("Error publishing post:", error);
      toast({
        title: "Publishing Failed",
        description: error.message || "There was an error publishing your post. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    isPublishing,
    publishNow
  };
};
