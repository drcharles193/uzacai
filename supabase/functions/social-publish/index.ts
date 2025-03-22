
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Twitter OAuth implementation
function generateOAuthSignature(
  method: string,
  url: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort parameters alphabetically and encode them properly
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
  console.log("OAuth Parameter String:", parameterString);
  console.log("OAuth Signature Base String:", signatureBaseString);
  console.log("OAuth Signing Key (first 5 chars):", signingKey.substring(0, 5) + "...");
  console.log("OAuth Signature:", signature);
  
  return signature;
}

async function publishToTwitter(userId: string, content: string): Promise<any> {
  try {
    console.log(`Publishing to Twitter for user ${userId}`);
    
    // Get the Twitter API credentials from the secrets table
    const { data: apiKey, error: keyError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'TWITTER_API_KEY')
      .single();
    
    if (keyError) {
      console.error(`Error fetching Twitter API key: ${keyError.message}`);
      throw new Error(`Failed to get Twitter API key: ${keyError.message}`);
    }
    
    const { data: apiSecret, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'TWITTER_API_SECRET')
      .single();
    
    if (secretError) {
      console.error(`Error fetching Twitter API secret: ${secretError.message}`);
      throw new Error(`Failed to get Twitter API secret: ${secretError.message}`);
    }
    
    // Get the access token and secret from the secrets table if available
    const { data: accessToken, error: accessTokenError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'TWITTER_ACCESS_TOKEN')
      .single();
      
    const { data: accessTokenSecret, error: accessTokenSecretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'TWITTER_ACCESS_TOKEN_SECRET')
      .single();
    
    if (!accessToken?.value || !accessTokenSecret?.value) {
      console.error('Missing Twitter access tokens in secrets table');
      console.log('Access Token exists:', Boolean(accessToken?.value));
      console.log('Access Token Secret exists:', Boolean(accessTokenSecret?.value));
    }
    
    // Get the Twitter account credentials for this user
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'twitter')
      .single();
    
    if (accountError) {
      console.error(`Error fetching Twitter account: ${accountError.message}`);
      throw new Error(`Failed to get Twitter account: ${accountError.message}`);
    }
    
    if (!account) {
      console.error('No Twitter account found for this user');
      throw new Error('No Twitter account found for this user');
    }
    
    console.log(`Found Twitter account: ${account.account_name}`);
    
    // Use either the account credentials or the global credentials
    const userToken = account.access_token || accessToken?.value;
    const userTokenSecret = account.access_token_secret || accessTokenSecret?.value;
    
    if (!userToken || !userTokenSecret) {
      console.error('Twitter account is missing access token or secret');
      throw new Error('Twitter account is missing required credentials. Please reconnect your account.');
    }
    
    // Log API key existence without exposing the actual key
    console.log(`API Key exists: ${Boolean(apiKey?.value)}, length: ${apiKey?.value.length || 0}`);
    console.log(`API Secret exists: ${Boolean(apiSecret?.value)}, length: ${apiSecret?.value.length || 0}`);
    console.log(`Access Token exists: ${Boolean(userToken)}, length: ${userToken?.length || 0}`);
    console.log(`Access Token Secret exists: ${Boolean(userTokenSecret)}, length: ${userTokenSecret?.length || 0}`);
    
    // Twitter API v2 endpoint for creating tweets
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    
    // Create OAuth timestamp and nonce
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    // Create OAuth parameters - CRITICAL: Do not include the tweet text in the parameters for signature
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey.value,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: userToken,
      oauth_version: '1.0'
    };
    
    // Generate the OAuth signature
    const signature = generateOAuthSignature(
      method,
      tweetUrl,
      oauthParams,
      apiSecret.value,
      userTokenSecret
    );
    
    // Add signature to OAuth parameters
    oauthParams.oauth_signature = signature;
    
    // Create the Authorization header - IMPORTANT: Format exactly as Twitter expects
    const authHeader = 'OAuth ' + Object.entries(oauthParams)
      .map(([key, value]) => `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`)
      .join(', ');
    
    console.log("Final Authorization header:", authHeader);
    
    // Make the API request
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
      console.error(`Twitter API error: ${response.status} - ${responseText}`);
      throw new Error(`Twitter API error: ${response.status} - ${responseText}`);
    }
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing Twitter API response:", e);
      throw new Error(`Error parsing Twitter API response: ${responseText}`);
    }
    
    // Update the last_used_at timestamp for this account
    await supabase
      .from('social_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', account.id);
    
    return responseData;
  } catch (error: any) {
    console.error('Error publishing to Twitter:', error);
    throw error;
  }
}

// Mock function for other platforms
function mockPublishToOtherPlatform(platform: string, content: string): any {
  console.log(`Mock publishing to ${platform}: ${content.substring(0, 20)}...`);
  return {
    success: true,
    platform,
    id: `mock-post-${Math.random().toString(36).substring(2, 15)}`,
    message: `Posted to ${platform} successfully`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received publish request');
  
  try {
    const { userId, content, mediaUrls, selectedAccounts, platforms } = await req.json();
    console.log(`Publishing post for user ${userId} to platforms:`, platforms);
    console.log(`Content to publish: ${content.substring(0, 30)}...`);
    
    if (!userId || !content || !selectedAccounts || selectedAccounts.length === 0) {
      console.error("Missing required fields", { userId, contentLength: content?.length, selectedAccounts });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const results = [];
    const errors = [];
    
    // Publish to each platform
    for (const platform of platforms) {
      try {
        console.log(`Attempting to publish to ${platform}`);
        let result;
        
        if (platform === 'twitter') {
          result = await publishToTwitter(userId, content);
        } else {
          result = mockPublishToOtherPlatform(platform, content);
        }
        
        results.push({
          platform,
          success: true,
          result
        });
        console.log(`Successfully published to ${platform}`);
      } catch (error: any) {
        console.error(`Error publishing to ${platform}:`, error);
        errors.push({
          platform,
          error: error.message
        });
      }
    }
    
    // If we have any successful posts but some errors, we'll still return a 200
    // but include the errors in the response
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
