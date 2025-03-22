import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const twitterApiKey = Deno.env.get("TWITTER_API_KEY")!;
const twitterApiSecret = Deno.env.get("TWITTER_API_SECRET")!;
const twitterAccessToken = Deno.env.get("TWITTER_ACCESS_TOKEN")!;
const twitterAccessTokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateOAuthSignature(
  method: string,
  url: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const parameterString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(parameterString)}`;
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
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
    
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'twitter')
      .maybeSingle();
    
    const apiKey = twitterApiKey;
    const apiSecret = twitterApiSecret;
    const accessToken = account?.access_token || twitterAccessToken;
    const accessTokenSecret = account?.access_token_secret || twitterAccessTokenSecret;
    
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      console.error("Missing Twitter API credentials");
      throw new Error("Twitter API credentials are missing. Please check your environment variables.");
    }
    
    console.log("Using Twitter API credentials:");
    console.log(`API Key exists: ${Boolean(apiKey)}, length: ${apiKey.length}`);
    console.log(`API Secret exists: ${Boolean(apiSecret)}, length: ${apiSecret.length}`);
    console.log(`Access Token exists: ${Boolean(accessToken)}, length: ${accessToken.length}`);
    console.log(`Access Token Secret exists: ${Boolean(accessTokenSecret)}, length: ${accessTokenSecret.length}`);
    
    const tweetUrl = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    
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
    
    const signature = generateOAuthSignature(
      method,
      tweetUrl,
      oauthParams,
      apiSecret,
      accessTokenSecret
    );
    
    oauthParams.oauth_signature = signature;
    
    const authHeader = 'OAuth ' + Object.entries(oauthParams)
      .map(([key, value]) => `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`)
      .join(', ');
    
    console.log("Final Authorization header:", authHeader);
    
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
    
    if (account) {
      await supabase
        .from('social_accounts')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', account.id);
    }
    
    return responseData;
  } catch (error: any) {
    console.error('Error publishing to Twitter:', error);
    throw error;
  }
}

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
