
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
 * Publish content to Twitter
 */
async function publishToTwitter(userId: string, content: string): Promise<any> {
  try {
    console.log(`Publishing to Twitter for user ${userId}`);
    
    // Get credentials
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = await getTwitterCredentials(userId);
    
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error("Twitter API credentials are missing. Please check your environment variables.");
    }
    
    // Set up Twitter API request
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
    
    // Make API request to Twitter
    const response = await fetch(tweetUrl, {
      method: method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: content })
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
  content: string
): Promise<{ platform: string; success: boolean; result?: any; error?: string }> {
  try {
    console.log(`Attempting to publish to ${platform}`);
    let result;
    
    if (platform === 'twitter') {
      result = await publishToTwitter(userId, content);
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
 * Main handler for the edge function
 */
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received publish request');
  
  try {
    const { userId, content, mediaUrls, selectedAccounts, platforms } = await req.json();
    console.log(`Publishing post for user ${userId} to platforms:`, platforms);
    console.log(`Content to publish: ${content.substring(0, 30)}...`);
    
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
    
    // Process publishing for each platform
    const publishingPromises = platforms.map(platform => 
      publishToPlatform(platform, userId, content)
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
