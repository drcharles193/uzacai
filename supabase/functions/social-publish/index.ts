
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

// Twitter OAuth 1.0a implementation
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  
  console.log("OAuth Signature Base String:", signatureBaseString);
  console.log("OAuth Signing Key (partially hidden):", signingKey.substring(0, 10) + "...");
  console.log("OAuth Signature:", signature);
  
  return signature;
}

function generateOAuthHeader(
  method: string,
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    apiSecret,
    accessTokenSecret
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function publishToTwitter(userId: string, content: string): Promise<any> {
  try {
    console.log(`Publishing to Twitter for user ${userId}`);
    
    // Get the Twitter API credentials
    const { data: twitterAPISecret, error: secretError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'TWITTER_API_SECRET')
      .single();
    
    if (secretError) {
      console.error(`Error fetching Twitter API secret: ${secretError.message}`);
      throw new Error(`Error fetching Twitter API secret: ${secretError.message}`);
    }
    
    const { data: twitterAPIKey, error: keyError } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'TWITTER_API_KEY')
      .single();
    
    if (keyError) {
      console.error(`Error fetching Twitter API key: ${keyError.message}`);
      throw new Error(`Error fetching Twitter API key: ${keyError.message}`);
    }
    
    // Get the Twitter account credentials for this user
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'twitter')
      .single();
    
    if (error) {
      console.error(`Error fetching Twitter account: ${error.message}`);
      throw new Error(`Error fetching Twitter account: ${error.message}`);
    }
    
    if (!account) {
      console.error('No Twitter account found for this user');
      throw new Error('No Twitter account found for this user');
    }
    
    console.log(`Found Twitter account: ${account.account_name}`);
    
    if (!account.access_token || !account.access_token_secret) {
      console.error('Twitter account is missing access token or secret');
      throw new Error('Twitter account is missing required credentials. Please reconnect your account.');
    }
    
    // Prepare to tweet using OAuth 1.0a
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    
    const oauthHeader = generateOAuthHeader(
      method,
      tweetUrl,
      twitterAPIKey.value,
      twitterAPISecret.value,
      account.access_token,
      account.access_token_secret
    );
    
    console.log("OAuth header generated for Twitter API request");
    
    // Make the API request
    const response = await fetch(tweetUrl, {
      method: method,
      headers: {
        'Authorization': oauthHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: content })
    });
    
    const responseText = await response.text();
    console.log(`Twitter API response status: ${response.status}`);
    console.log(`Twitter API response body: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} - ${responseText}`);
    }
    
    const responseData = JSON.parse(responseText);
    
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
    const status = hasSuccesses ? 200 : (hasErrors ? 500 : 200);
    
    console.log(`Returning response with status ${status}`);
    
    return new Response(
      JSON.stringify({ 
        success: hasSuccesses,
        results,
        errors: hasErrors ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status
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
