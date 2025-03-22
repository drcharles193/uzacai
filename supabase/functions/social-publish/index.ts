
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ===== TWITTER API HELPERS =====

/**
 * Validates that all required Twitter API credentials are available
 */
function validateTwitterCredentials() {
  const apiKey = Deno.env.get("TWITTER_API_KEY");
  const apiSecret = Deno.env.get("TWITTER_API_SECRET");
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const accessTokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");
  
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error("Missing Twitter API credentials. Please check your environment variables.");
    return false;
  }
  
  console.log("Using Twitter API credentials:");
  console.log(`API Key exists: ${Boolean(apiKey)}, length: ${apiKey.length}`);
  console.log(`API Secret exists: ${Boolean(apiSecret)}, length: ${apiSecret.length}`);
  console.log(`Access Token exists: ${Boolean(accessToken)}, length: ${accessToken.length}`);
  console.log(`Access Token Secret exists: ${Boolean(accessTokenSecret)}, length: ${accessTokenSecret.length}`);
  
  return true;
}

/**
 * Generates OAuth signature for Twitter API requests
 */
function generateOAuthSignature(
  method: string,
  url: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort and encode parameters
  const parameterString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  
  // Create signature base string
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(parameterString)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Generate HMAC-SHA1 signature
  const hmac = createHmac("sha1", signingKey);
  const signature = hmac.update(signatureBaseString).digest("base64");
  
  console.log("OAuth Parameters:", JSON.stringify(oauthParams));
  console.log("Parameter String:", parameterString);
  console.log("Signature Base String:", signatureBaseString);
  console.log("Signing Key (first 5 chars):", signingKey.substring(0, 5) + "...");
  console.log("Signature:", signature);
  
  return signature;
}

/**
 * Creates Authorization header for Twitter API requests
 */
function createTwitterAuthHeader(
  method: string,
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  // Generate OAuth parameters
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0'
  };
  
  // Generate OAuth signature
  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    apiSecret,
    accessTokenSecret
  );
  
  oauthParams.oauth_signature = signature;
  
  // Create Authorization header
  const authHeader = 'OAuth ' + Object.entries(oauthParams)
    .map(([key, value]) => `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`)
    .join(', ');
  
  console.log("Final Authorization header:", authHeader);
  
  return authHeader;
}

/**
 * Get user-specific tokens from database or fall back to environment variables
 */
async function getTwitterCredentials(userId: string) {
  // Get user-specific tokens if available
  const { data: account, error: accountError } = await supabase
    .from('social_accounts')
    .select('access_token, access_token_secret')
    .eq('user_id', userId)
    .eq('platform', 'twitter')
    .maybeSingle();
  
  if (accountError) {
    console.error("Error fetching user account:", accountError);
  }
  
  // Use user tokens if available, otherwise fall back to environment variables
  return {
    apiKey: Deno.env.get("TWITTER_API_KEY") || "",
    apiSecret: Deno.env.get("TWITTER_API_SECRET") || "",
    accessToken: account?.access_token || Deno.env.get("TWITTER_ACCESS_TOKEN") || "",
    accessTokenSecret: account?.access_token_secret || Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET") || ""
  };
}

/**
 * Updates last_used_at timestamp for a social account
 */
async function updateLastUsedTimestamp(userId: string, platform: string) {
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
 * Fetch an image from URL and convert to base64 for upload
 */
async function getMediaAsBase64(mediaUrl: string): Promise<string> {
  try {
    console.log(`Fetching media from URL: ${mediaUrl}`);
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log(`Media content type: ${contentType}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return base64;
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
}

/**
 * Upload media to Twitter
 */
async function uploadMediaToTwitter(
  userId: string,
  mediaBase64: string,
  contentType: string
): Promise<string> {
  try {
    console.log(`Uploading media to Twitter with content type: ${contentType}`);
    
    // Get credentials
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = await getTwitterCredentials(userId);
    
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error("Twitter API credentials are missing. Please check your environment variables.");
    }
    
    // Set up Twitter API request for media upload
    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
    const method = 'POST';
    
    // Create Authorization header
    const authHeader = createTwitterAuthHeader(
      method,
      uploadUrl,
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret
    );
    
    // Prepare form data with base64 encoded media
    const formData = new FormData();
    formData.append('media_data', mediaBase64);
    
    // Make API request to Twitter for media upload
    const uploadResponse = await fetch(uploadUrl, {
      method: method,
      headers: {
        'Authorization': authHeader,
      },
      body: formData
    });
    
    const uploadResponseText = await uploadResponse.text();
    console.log(`Twitter media upload API response status: ${uploadResponse.status}`);
    console.log(`Twitter media upload API response body: ${uploadResponseText}`);
    
    if (!uploadResponse.ok) {
      throw new Error(`Twitter media upload API error: ${uploadResponse.status} - ${uploadResponseText}`);
    }
    
    // Parse response data to get media id
    const uploadResponseData = JSON.parse(uploadResponseText);
    const mediaId = uploadResponseData.media_id_string;
    
    if (!mediaId) {
      throw new Error("Failed to retrieve media_id from Twitter API response");
    }
    
    console.log(`Successfully uploaded media to Twitter with ID: ${mediaId}`);
    return mediaId;
  } catch (error: any) {
    console.error('Error uploading media to Twitter:', error);
    throw error;
  }
}

/**
 * Process media from blob URL or remote URL and upload to Twitter
 */
async function processAndUploadMedia(userId: string, mediaUrl: string): Promise<string> {
  try {
    console.log(`Processing media at URL: ${mediaUrl}`);
    
    // Determine if the media URL is a blob URL or a remote URL
    if (mediaUrl.startsWith('blob:')) {
      throw new Error('Blob URLs cannot be processed directly in edge functions. Media must be sent as base64 or remote URLs.');
    }
    
    // For regular URLs, fetch the media and convert to base64
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Upload the media to Twitter
    return await uploadMediaToTwitter(userId, base64, contentType);
  } catch (error: any) {
    console.error('Error processing and uploading media:', error);
    throw error;
  }
}

/**
 * Publish content and media to Twitter
 */
async function publishToTwitter(
  userId: string, 
  content: string, 
  mediaUrls: string[] = [],
  base64Media: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to Twitter for user ${userId} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media items`);
    
    // Get credentials
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = await getTwitterCredentials(userId);
    
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
          const mediaId = await processAndUploadMedia(userId, mediaUrls[i]);
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
          const mediaId = await uploadMediaToTwitter(userId, base64Media[i], 'image/jpeg');
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
    await updateLastUsedTimestamp(userId, 'twitter');
    
    return responseData;
  } catch (error: any) {
    console.error('Error publishing to Twitter:', error);
    throw error;
  }
}

/**
 * Mock function for other platforms that aren't fully implemented yet
 */
function mockPublishToOtherPlatform(platform: string, content: string): any {
  console.log(`Mock publishing to ${platform}: ${content.substring(0, 20)}...`);
  return {
    success: true,
    platform,
    id: `mock-post-${Math.random().toString(36).substring(2, 15)}`,
    message: `Posted to ${platform} successfully`
  };
}

/**
 * Process publishing request for a specific platform
 */
async function publishToPlatform(
  platform: string, 
  userId: string, 
  content: string,
  mediaUrls: string[] = [],
  base64Media: string[] = []
): Promise<{ platform: string; success: boolean; result?: any; error?: string }> {
  try {
    console.log(`Attempting to publish to ${platform} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media`);
    let result;
    
    if (platform === 'twitter') {
      result = await publishToTwitter(userId, content, mediaUrls, base64Media);
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

/**
 * Validate required request parameters
 */
function validateRequest(userId: string, content: string, selectedAccounts: string[]): boolean {
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
async function processBlobMediaUrls(mediaUrls: string[], mediaBase64: string[] = []): Promise<{urls: string[], base64: string[]}> {
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
 * Main handler for the edge function
 */
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received publish request');
  
  try {
    const { userId, content, mediaUrls, mediaBase64, selectedAccounts, platforms } = await req.json();
    console.log(`Publishing post for user ${userId} to platforms:`, platforms);
    console.log(`Content to publish: ${content.substring(0, 30)}...`);
    console.log(`Media URLs:`, mediaUrls);
    console.log(`Base64 Media count:`, mediaBase64?.length || 0);
    
    // Validate request parameters
    if (!validateRequest(userId, content, selectedAccounts)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate Twitter credentials are available
    if (!validateTwitterCredentials()) {
      return new Response(
        JSON.stringify({ error: "Twitter API credentials are not configured correctly" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Process the media URLs and base64 data
    const processedMedia = await processBlobMediaUrls(mediaUrls || [], mediaBase64 || []);
    
    // Process publishing for each platform
    const publishingPromises = platforms.map(platform => 
      publishToPlatform(platform, userId, content, processedMedia.urls, processedMedia.base64)
    );
    
    const publishingResults = await Promise.all(publishingPromises);
    
    // Separate successes and errors
    const results = publishingResults.filter(result => result.success);
    const errors = publishingResults.filter(result => !result.success);
    
    const hasSuccesses = results.length > 0;
    const hasErrors = errors.length > 0;
    
    console.log(`Returning response with ${results.length} successes and ${errors.length} errors`);
    
    return new Response(
      JSON.stringify({ 
        success: hasSuccesses,
        results,
        errors: hasErrors ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: hasSuccesses || !hasErrors ? 200 : 500
      }
    );
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
