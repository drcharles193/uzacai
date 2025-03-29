
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
 * Publish content and media to Facebook
 */
export async function publishToFacebook(
  supabase: any,
  userId: string, 
  content: string, 
  mediaUrls: string[] = [],
  base64Media: string[] = [],
  contentTypes: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to Facebook for user ${userId} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media items`);
    
    // Get Facebook credentials
    const { data: accountData, error: accountError } = await supabase
      .from('social_accounts')
      .select('platform_account_id, access_token, account_type')
      .eq('user_id', userId)
      .eq('platform', 'facebook')
      .single();
    
    if (accountError) {
      console.error("Error fetching Facebook account:", accountError);
      throw new Error("Failed to get Facebook credentials. Please reconnect your account.");
    }
    
    if (!accountData || !accountData.access_token) {
      throw new Error("Facebook credentials not found. Please connect your Facebook account.");
    }
    
    const { platform_account_id, access_token, account_type } = accountData;
    
    // Determine if we're posting to a page or a user profile
    const isPage = account_type === 'page';
    
    // For pages, we need the page ID and the page access token (which is already in access_token)
    const targetId = platform_account_id;
    
    // Prepare API endpoint
    const apiVersion = 'v18.0';
    let apiUrl: string;
    
    if (isPage) {
      // For a page post
      apiUrl = `https://graph.facebook.com/${apiVersion}/${targetId}/feed`;
    } else {
      // For a user post (note: this requires additional permissions and may not work with Graph API v18.0)
      apiUrl = `https://graph.facebook.com/${apiVersion}/me/feed`;
    }
    
    // Prepare request body
    const formData = new FormData();
    formData.append('message', content);
    
    // Handle media
    // For Facebook, it's better to use URLs directly rather than uploading base64
    if (mediaUrls.length > 0) {
      formData.append('link', mediaUrls[0]); // Facebook can preview the first link
    }
    
    // If we have base64 media, we might need to upload it first
    // This is complex and requires multiple API calls, so for this example
    // we'll just support URL-based media
    
    console.log(`Posting to Facebook ${isPage ? 'page' : 'profile'} with ID: ${targetId}`);
    
    // Make API request
    const response = await fetch(`${apiUrl}?access_token=${encodeURIComponent(access_token)}`, {
      method: 'POST',
      body: formData
    });
    
    const responseText = await response.text();
    console.log(`Facebook API response status: ${response.status}`);
    console.log(`Facebook API response body: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} - ${responseText}`);
    }
    
    // Parse response data
    const responseData = JSON.parse(responseText);
    
    // Update last_used_at timestamp
    await updateLastUsedTimestamp(supabase, userId, 'facebook');
    
    return responseData;
  } catch (error: any) {
    console.error('Error publishing to Facebook:', error);
    throw error;
  }
}

/**
 * Publish content and media to Instagram
 */
export async function publishToInstagram(
  supabase: any,
  userId: string, 
  content: string, 
  mediaUrls: string[] = [],
  base64Media: string[] = [],
  contentTypes: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to Instagram for user ${userId} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media items`);
    
    // Get Instagram credentials
    const { data: accountData, error: accountError } = await supabase
      .from('social_accounts')
      .select('platform_account_id, access_token, metadata')
      .eq('user_id', userId)
      .eq('platform', 'instagram')
      .single();
    
    if (accountError) {
      console.error("Error fetching Instagram account:", accountError);
      throw new Error("Failed to get Instagram credentials. Please reconnect your account.");
    }
    
    if (!accountData || !accountData.access_token) {
      throw new Error("Instagram credentials not found. Please connect your Instagram account.");
    }
    
    const { platform_account_id, access_token } = accountData;
    
    // Instagram API requires media, we can't post text-only
    if (mediaUrls.length === 0 && base64Media.length === 0) {
      throw new Error("Instagram posts require at least one image or video.");
    }
    
    // Here we would implement the Instagram Graph API publishing flow
    // This is a simplified example - a real implementation would require:
    // 1. Uploading media to Facebook/Instagram servers
    // 2. Creating a container
    // 3. Publishing the container
    
    console.log("Warning: Instagram Graph API requires a business account and approval process");
    console.log("Using mock implementation for Instagram posting");
    
    // For this demonstration, simulate a successful post
    const mockResult = {
      id: `ig-post-${Date.now()}`,
      status: 'published'
    };
    
    // Update last_used_at timestamp
    await updateLastUsedTimestamp(supabase, userId, 'instagram');
    
    return mockResult;
  } catch (error: any) {
    console.error('Error publishing to Instagram:', error);
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
    } else if (platform === 'facebook') {
      result = await publishToFacebook(supabase, userId, content, mediaUrls, base64Media, contentTypes);
    } else if (platform === 'instagram') {
      result = await publishToInstagram(supabase, userId, content, mediaUrls, base64Media, contentTypes);
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
