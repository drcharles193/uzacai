
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
export function mockPublishToOtherPlatform(platform: string, content: string, mediaCount: number = 0): any {
  console.log(`Mock publishing to ${platform}: ${content.substring(0, 20)}...`);
  console.log(`Mock publishing ${mediaCount} media items to ${platform}`);
  
  const mediaItems = [];
  for (let i = 0; i < mediaCount; i++) {
    mediaItems.push({
      id: `mock-media-${i}`,
      type: i % 2 === 0 ? 'image' : 'video',
      url: `https://example.com/media-${i}`
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
