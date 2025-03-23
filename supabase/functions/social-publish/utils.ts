
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
  
  console.log(`Processed ${validUrls.length} valid URLs and ${base64Data.length} base64 media items`);
  console.log(`Media content types: ${mediaContentTypes.join(', ')}`);
  
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
 * Detects if a content type is a video
 */
export function isVideoContentType(contentType: string): boolean {
  return contentType.startsWith('video/');
}

/**
 * Detects if a URL is pointing to a video file
 */
export function isVideoUrl(url: string): boolean {
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi)$/i;
  return videoExtensions.test(url);
}

/**
 * Process LinkedIn API response
 */
export function processLinkedInResponse(response: any): any {
  if (!response) {
    return {
      success: false,
      platform: 'linkedin',
      message: 'No response from LinkedIn API'
    };
  }

  if (response.id) {
    return {
      success: true,
      platform: 'linkedin',
      id: response.id,
      message: 'Posted to LinkedIn successfully'
    };
  }

  return {
    success: false,
    platform: 'linkedin',
    message: 'Failed to post to LinkedIn'
  };
}

/**
 * Mock function for other platforms that aren't fully implemented yet
 */
export function mockPublishToOtherPlatform(platform: string, content: string, mediaUrls: string[] = [], contentTypes: string[] = []): any {
  console.log(`Mock publishing to ${platform}: ${content.substring(0, 20)}...`);
  console.log(`Mock publishing ${mediaUrls.length} media URLs to ${platform}`);
  
  const mediaItems = [];
  
  // Process both direct media URLs and content types
  for (let i = 0; i < mediaUrls.length; i++) {
    const isVideo = isVideoUrl(mediaUrls[i]);
    
    mediaItems.push({
      id: `mock-media-${i}`,
      type: isVideo ? 'video' : 'image',
      url: mediaUrls[i]
    });
  }
  
  // Process content types (usually from base64 data)
  for (let i = 0; i < contentTypes.length; i++) {
    const isVideo = isVideoContentType(contentTypes[i]);
    
    mediaItems.push({
      id: `mock-media-base64-${i}`,
      type: isVideo ? 'video' : 'image',
      url: `https://example.com/media-base64-${i}.${isVideo ? 'mp4' : 'jpg'}`
    });
  }
  
  return {
    success: true,
    platform,
    id: `mock-post-${Math.random().toString(36).substring(2, 15)}`,
    message: `Posted to ${platform} successfully`,
    media: mediaItems.length > 0 ? mediaItems : undefined
  };
}
