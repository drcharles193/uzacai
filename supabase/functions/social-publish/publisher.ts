
import { PlatformResponse } from './types.ts';
import { updateLastUsedTimestamp, mockPublishToOtherPlatform } from './utils.ts';
import { createTwitterAuthHeader, getTwitterCredentials } from './twitter.ts';
import { processAndUploadMedia, uploadMediaToTwitter } from './media.ts';

/**
 * Publish content and media to Twitter
 */
export async function publishToTwitter(
  supabase: any,
  userId: string, 
  content: string, 
  mediaUrls: string[] = [],
  base64Media: string[] = [],
  contentTypes: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to Twitter for user ${userId} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media items`);
    
    // Get credentials
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = await getTwitterCredentials(supabase, userId);
    
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error("Twitter API credentials are missing. Please check your environment variables.");
    }
    
    // Upload media if provided
    let mediaIds: string[] = [];
    
    // First, try to upload from URLs
    if (mediaUrls.length > 0) {
      // Twitter allows up to 4 media items per tweet
      const maxMediaItems = Math.min(mediaUrls.length, 4);
      
      // Process and upload each media item from URLs
      for (let i = 0; i < maxMediaItems; i++) {
        try {
          const mediaId = await processAndUploadMedia(supabase, userId, mediaUrls[i]);
          mediaIds.push(mediaId);
        } catch (error) {
          console.error(`Error uploading media #${i + 1}:`, error);
          // Continue with the next media item
        }
      }
    }
    
    // Then, try to upload from base64 data if provided and we have room for more media
    if (base64Media.length > 0 && mediaIds.length < 4) {
      const remainingSlots = 4 - mediaIds.length;
      const maxBase64Items = Math.min(base64Media.length, remainingSlots);
      
      for (let i = 0; i < maxBase64Items; i++) {
        try {
          const contentType = contentTypes[i] || 'image/jpeg'; // Default to image/jpeg if not specified
          const mediaId = await uploadMediaToTwitter(supabase, userId, base64Media[i], contentType);
          mediaIds.push(mediaId);
        } catch (error) {
          console.error(`Error uploading base64 media #${i + 1}:`, error);
          // Continue with the next media item
        }
      }
    }
    
    console.log(`Successfully uploaded ${mediaIds.length} media items with IDs:`, mediaIds);
    
    // Set up Twitter API request for tweet creation
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    
    // Create Authorization header
    const authHeader = createTwitterAuthHeader(
      method,
      tweetUrl,
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret
    );
    
    // Prepare request body
    const requestBody: any = { text: content };
    
    // Add media IDs if available
    if (mediaIds.length > 0) {
      requestBody.media = { media_ids: mediaIds };
    }
    
    console.log("Twitter API request body:", JSON.stringify(requestBody));
    
    // Make API request to Twitter
    const response = await fetch(tweetUrl, {
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseText = await response.text();
    console.log(`Twitter API response status: ${response.status}`);
    console.log(`Twitter API response body: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} - ${responseText}`);
    }
    
    // Parse response data
    const responseData = JSON.parse(responseText);
    
    // Update last_used_at timestamp
    await updateLastUsedTimestamp(supabase, userId, 'twitter');
    
    return responseData;
  } catch (error: any) {
    console.error('Error publishing to Twitter:', error);
    throw error;
  }
}

/**
 * Process publishing request for a specific platform
 */
export async function publishToPlatform(
  supabase: any,
  platform: string, 
  userId: string, 
  content: string,
  mediaUrls: string[] = [],
  base64Media: string[] = [],
  contentTypes: string[] = []
): Promise<PlatformResponse> {
  try {
    console.log(`Attempting to publish to ${platform} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media`);
    let result;
    
    if (platform === 'twitter') {
      result = await publishToTwitter(supabase, userId, content, mediaUrls, base64Media, contentTypes);
    } else {
      result = mockPublishToOtherPlatform(platform, content);
    }
    
    console.log(`Successfully published to ${platform}`);
    return {
      platform,
      success: true,
      result
    };
  } catch (error: any) {
    console.error(`Error publishing to ${platform}:`, error);
    return {
      platform,
      success: false,
      error: error.message
    };
  }
}
