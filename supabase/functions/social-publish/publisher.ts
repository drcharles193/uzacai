
import { PlatformResponse } from './types.ts';
import { updateLastUsedTimestamp, mockPublishToOtherPlatform, isVideoContentType } from './utils.ts';
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
    let hasVideo = false;
    
    // Check if any content types indicate video
    for (const contentType of contentTypes) {
      if (isVideoContentType(contentType)) {
        hasVideo = true;
        console.log("Video content detected in the upload");
        break;
      }
    }
    
    // First, try to upload from URLs
    if (mediaUrls.length > 0) {
      // Twitter allows up to 4 media items per tweet
      const maxMediaItems = Math.min(mediaUrls.length, 4);
      
      // Process and upload each media item from URLs
      for (let i = 0; i < maxMediaItems; i++) {
        try {
          const mediaId = await processAndUploadMedia(supabase, userId, mediaUrls[i]);
          mediaIds.push(mediaId);
          console.log(`Successfully uploaded URL media #${i + 1} with ID: ${mediaId}`);
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
          console.log(`Uploading base64 media #${i + 1} with content type: ${contentType}`);
          
          // Check if it's a video
          const isVideo = isVideoContentType(contentType);
          console.log(`Media #${i + 1} is ${isVideo ? 'a video' : 'an image'}`);
          
          if (isVideo) {
            hasVideo = true;
          }
          
          const mediaId = await uploadMediaToTwitter(supabase, userId, base64Media[i], contentType);
          mediaIds.push(mediaId);
          console.log(`Successfully uploaded base64 media #${i + 1} with ID: ${mediaId}`);
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
 * Publish content and media to LinkedIn
 */
export async function publishToLinkedIn(
  supabase: any,
  userId: string, 
  content: string, 
  mediaUrls: string[] = [],
  base64Media: string[] = [],
  contentTypes: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to LinkedIn for user ${userId} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media items`);
    
    // Get LinkedIn credentials for this user
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('access_token, token_expires_at, platform_account_id')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .order('last_used_at', { ascending: false })
      .limit(1);
    
    if (accountsError || !accounts || accounts.length === 0) {
      throw new Error("No LinkedIn account found for this user. Please connect your LinkedIn account first.");
    }
    
    const account = accounts[0];
    const accessToken = account.access_token;
    const linkedInUserId = account.platform_account_id;
    
    if (!accessToken) {
      throw new Error("LinkedIn access token is missing. Please reconnect your LinkedIn account.");
    }
    
    // Check if token is expired
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      throw new Error("LinkedIn token has expired. Please reconnect your LinkedIn account.");
    }
    
    // Create a LinkedIn post
    // First we need to build our request body based on whether we have media or not
    let requestBody: any = {
      author: `urn:li:person:${linkedInUserId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };
    
    // Handle media if present
    // LinkedIn requires different approach for media - need to upload to their servers first
    if (mediaUrls.length > 0 || base64Media.length > 0) {
      console.log("Media handling for LinkedIn is not fully implemented yet");
      // In a real implementation, we would:
      // 1. Upload each media to LinkedIn's media API
      // 2. Get back the media URNs
      // 3. Include them in the request body
      
      // For demonstration, we'll just include the text content
      console.log("Proceeding with text-only post to LinkedIn");
    }
    
    // Make API request to LinkedIn
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseText = await response.text();
    console.log(`LinkedIn API response status: ${response.status}`);
    console.log(`LinkedIn API response body: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} - ${responseText}`);
    }
    
    // Parse response data
    const responseData = responseText ? JSON.parse(responseText) : {};
    
    // Update last_used_at timestamp
    await updateLastUsedTimestamp(supabase, userId, 'linkedin');
    
    return responseData;
  } catch (error: any) {
    console.error('Error publishing to LinkedIn:', error);
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
    console.log(`Content types for base64 media: ${contentTypes.join(', ')}`);
    
    let result;
    
    if (platform === 'twitter') {
      result = await publishToTwitter(supabase, userId, content, mediaUrls, base64Media, contentTypes);
    } else if (platform === 'linkedin') {
      result = await publishToLinkedIn(supabase, userId, content, mediaUrls, base64Media, contentTypes);
    } else {
      // For other platforms (placeholder for future implementation)
      // We pass media information to the mock function
      result = mockPublishToOtherPlatform(platform, content, mediaUrls, contentTypes);
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
