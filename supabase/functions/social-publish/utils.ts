
import { ProcessedMedia } from './types.ts';

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validates required request parameters
 */
export function validateRequest(userId: string, content: string, selectedAccounts: string[]): boolean {
  if (!userId || !content || !selectedAccounts || selectedAccounts.length === 0) {
    console.error("Missing required fields", { 
      userId, 
      contentLength: content?.length, 
      selectedAccounts 
    });
    return false;
  }
  return true;
}

/**
 * Processes media URLs and base64 data
 */
export async function processBlobMediaUrls(
  mediaUrls: string[], 
  mediaBase64: string[] = [],
  contentTypes: string[] = []
): Promise<ProcessedMedia> {
  const validUrls: string[] = [];
  const base64Data: string[] = [...mediaBase64];
  const mediaContentTypes: string[] = [...contentTypes];
  
  for (const url of mediaUrls) {
    // If it's not a blob URL, just add it to valid URLs
    if (!url.startsWith('blob:')) {
      validUrls.push(url);
    }
    // If it's a blob URL and base64 data was provided, we'll use that
    // No action here as blob URLs can't be processed in edge functions
  }
  
  // Make sure contentTypes is at least as long as base64Data
  while (mediaContentTypes.length < base64Data.length) {
    mediaContentTypes.push('image/jpeg'); // Default to image/jpeg if not specified
  }
  
  return {
    urls: validUrls,
    base64: base64Data,
    contentTypes: mediaContentTypes
  };
}

/**
 * Updates last_used_at timestamp for a social account
 */
export async function updateLastUsedTimestamp(supabase: any, userId: string, platform: string) {
  const { error } = await supabase
    .from('social_accounts')
    .update({ last_used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('platform', platform);
  
  if (error) {
    console.error(`Error updating last_used_at for ${platform}:`, error);
  }
}

/**
 * Mock function for other platforms that aren't fully implemented yet
 */
export function mockPublishToOtherPlatform(platform: string, content: string): any {
  console.log(`Mock publishing to ${platform}: ${content.substring(0, 20)}...`);
  return {
    success: true,
    platform,
    id: `mock-post-${Math.random().toString(36).substring(2, 15)}`,
    message: `Posted to ${platform} successfully`
  };
}

/**
 * Publish content to LinkedIn
 */
export async function publishToLinkedIn(
  supabase: any,
  userId: string,
  content: string,
  mediaUrls: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to LinkedIn for user ${userId}`);
    
    // Get LinkedIn credentials from social_accounts table
    const { data: accountData, error: accountError } = await supabase
      .from('social_accounts')
      .select('access_token, platform_account_id')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .single();
    
    if (accountError || !accountData) {
      throw new Error(`LinkedIn credentials not found: ${accountError?.message || 'No account data'}`);
    }
    
    const accessToken = accountData.access_token;
    const profileId = accountData.platform_account_id;
    
    if (!accessToken || !profileId) {
      throw new Error('LinkedIn access token or profile ID is missing');
    }
    
    // First, check if there's media to upload
    let mediaId = null;
    if (mediaUrls && mediaUrls.length > 0) {
      // For now, we'll just use the first media URL
      const mediaUrl = mediaUrls[0];
      
      // LinkedIn requires a more complex media upload process
      // This is a simplified version for example purposes
      console.log(`Would upload media from URL: ${mediaUrl}`);
      
      // In a real implementation, you would:
      // 1. Initialize the media upload
      // 2. Get the upload URL
      // 3. Upload the binary data
      // 4. Finalize the upload
    }
    
    // Create the share on LinkedIn
    // This is using LinkedIn's Shares API
    const shareUrl = `https://api.linkedin.com/v2/shares`;
    const shareData = {
      owner: `urn:li:person:${profileId}`,
      text: {
        text: content
      },
      distribution: {
        linkedInDistributionTarget: {}
      }
    };
    
    // If we have media, add it to the share
    if (mediaId) {
      shareData.content = {
        contentEntities: [
          {
            entity: `urn:li:digitalmediaAsset:${mediaId}`
          }
        ]
      };
    }
    
    console.log("Publishing to LinkedIn with data:", JSON.stringify(shareData));
    
    // Mock the API call for now
    // In a real implementation, you would make a fetch call to the LinkedIn API
    console.log(`Simulating LinkedIn API call to: ${shareUrl}`);
    
    // For now, we'll return a mock successful response
    // Update last used timestamp
    await updateLastUsedTimestamp(supabase, userId, 'linkedin');
    
    return {
      success: true,
      platform: 'linkedin',
      id: `linkedin-post-${Math.random().toString(36).substring(2, 15)}`,
      message: 'Posted to LinkedIn successfully'
    };
  } catch (error: any) {
    console.error('Error publishing to LinkedIn:', error);
    throw error;
  }
}
