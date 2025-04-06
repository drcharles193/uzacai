
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialAccount } from '../types';

export const usePublishing = (currentUserId: string | null) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  const processMediaForPublishing = async (mediaFiles: File[], mediaPreviewUrls: string[]) => {
    console.log("Processing media for publishing", mediaFiles, mediaPreviewUrls);
    
    // For real media uploads we would:
    // 1. Upload files to Supabase storage
    // 2. Return the full URLs of the uploaded files
    
    // But for now, we'll just use any non-blob URLs from mediaPreviewUrls
    // and convert blob URLs to absolute URLs that the edge function can access
    const processedUrls: string[] = [];
    
    // Add any non-blob URLs from mediaPreviewUrls
    mediaPreviewUrls.forEach(url => {
      if (!url.startsWith('blob:')) {
        processedUrls.push(url);
      }
    });
    
    // For demo purposes, we'll use placeholder images for blob URLs
    // In a real app, you would upload these files to storage
    const blobUrls = mediaPreviewUrls.filter(url => url.startsWith('blob:'));
    if (blobUrls.length > 0) {
      // For each blob URL, we'll use a placeholder image
      blobUrls.forEach((_, index) => {
        // Use a public placeholder image service with a random ID
        const placeholderId = Math.floor(Math.random() * 1000);
        processedUrls.push(`https://picsum.photos/seed/${placeholderId}/800/600`);
      });
      
      console.log("Using placeholder images for blob URLs:", processedUrls);
    }
    
    return processedUrls;
  };

  const publishNow = async (
    postContent: string,
    mediaPreviewUrls: string[],
    selectedAccounts: string[],
    connectedAccounts: SocialAccount[],
    mediaFiles: File[] = []
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
      console.log("Media files:", mediaFiles.length, "Media URLs:", mediaPreviewUrls.length);
      
      // Process media files for publishing
      const processedMediaUrls = await processMediaForPublishing(mediaFiles, mediaPreviewUrls);
      console.log("Processed media URLs:", processedMediaUrls);
      
      // Call our edge function to handle the publishing
      const { data, error } = await supabase.functions.invoke('social-publish', {
        body: {
          userId: currentUserId,
          content: postContent,
          mediaUrls: processedMediaUrls,
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
          
          // Check for permission errors specifically for platforms
          const permissionError = data.errors.find((e: any) => 
            e.error && e.error.includes('permission')
          );
          
          if (permissionError) {
            toast({
              title: `${permissionError.platform.charAt(0).toUpperCase() + permissionError.platform.slice(1)} Permission Error`,
              description: `Your ${permissionError.platform} connection needs additional permissions. Please reconnect your account.`,
              variant: "destructive"
            });
          }
        } else {
          // All posts failed
          const errorMessage = data.errors[0].error || 'Missing API credentials';
          
          // Check if this is an auth error
          if (data.errors.find((e: any) => e.error && e.error.includes('API'))) {
            throw new Error(`Failed to publish: Please check your API credentials.`);
          } 
          // Check for permission errors
          else if (data.errors.find((e: any) => e.error && e.error.includes('permission'))) {
            throw new Error(`Permission error: Please reconnect your account with the necessary permissions.`);
          } else {
            throw new Error(`Failed to publish: ${errorMessage}`);
          }
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
