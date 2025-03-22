
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
 * Converts a blob URL media to base64
 */
export async function processBlobMediaUrls(mediaUrls: string[], mediaBase64: string[] = []): Promise<ProcessedMedia> {
  const validUrls: string[] = [];
  const base64Data: string[] = [...mediaBase64];
  
  for (const url of mediaUrls) {
    // If it's not a blob URL, just add it to valid URLs
    if (!url.startsWith('blob:')) {
      validUrls.push(url);
    }
    // If it's a blob URL and base64 data was provided, we'll use that
    // No action here as blob URLs can't be processed in edge functions
  }
  
  return {
    urls: validUrls,
    base64: base64Data
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
