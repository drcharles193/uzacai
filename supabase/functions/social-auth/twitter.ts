
import { supabase } from "./supabaseClient.ts";
import { generateState, storeOAuthState } from "./utils.ts";
import { corsHeaders } from "./corsHeaders.ts";

// Twitter API credentials
const TWITTER_API_KEY = Deno.env.get("TWITTER_API_KEY");
const TWITTER_API_SECRET = Deno.env.get("TWITTER_API_SECRET");
const TWITTER_CALLBACK_URL = Deno.env.get("TWITTER_CALLBACK_URL");

// Twitter OAuth URL generator
export function getTwitterAuthUrl() {
  if (!TWITTER_API_KEY || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter API credentials not configured");
  }
  
  const state = generateState();
  
  const url = new URL('https://twitter.com/i/oauth2/authorize');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', TWITTER_API_KEY);
  url.searchParams.append('redirect_uri', TWITTER_CALLBACK_URL);
  url.searchParams.append('scope', 'tweet.read users.read offline.access');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', 'challenge'); // In a real implementation, use PKCE
  url.searchParams.append('code_challenge_method', 'plain');
  
  return { url: url.toString(), state };
}

// Twitter token exchange function
export async function exchangeTwitterCode(code: string) {
  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter API credentials not configured");
  }
  
  const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
  const basicAuth = btoa(`${TWITTER_API_KEY}:${TWITTER_API_SECRET}`);
  
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('redirect_uri', TWITTER_CALLBACK_URL);
  params.append('code_verifier', 'challenge'); // In a real implementation, use PKCE
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter token exchange error:', errorText);
      throw new Error(`Twitter API error: ${response.status} ${errorText}`);
    }
    
    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error('Error exchanging Twitter code for tokens:', error);
    throw error;
  }
}

// Get Twitter user profile
export async function getTwitterUserProfile(accessToken: string) {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter user profile error:', errorText);
      throw new Error(`Twitter API error: ${response.status} ${errorText}`);
    }
    
    const userData = await response.json();
    return userData.data;
  } catch (error) {
    console.error('Error fetching Twitter user profile:', error);
    throw error;
  }
}

// Handle Twitter auth URL request
export async function handleTwitterAuthUrl(userId: string) {
  try {
    const { url, state } = getTwitterAuthUrl();
    
    // Store the state temporarily
    await storeOAuthState(supabase, userId, 'twitter', state);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        authUrl: url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error generating Twitter auth URL:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
}

// Handle Twitter callback
export async function handleTwitterCallback(code: string, userId: string) {
  try {
    // In a real implementation, validate state parameter against stored state
    
    // Exchange code for tokens
    const tokens = await exchangeTwitterCode(code);
    
    // Get user profile information
    const userProfile = await getTwitterUserProfile(tokens.access_token);
    
    // Store the connection in the database
    const { data, error } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: 'twitter',
        platform_account_id: userProfile.id,
        account_name: userProfile.name || `@${userProfile.username}`,
        account_type: "profile",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
        last_used_at: new Date().toISOString(),
        metadata: { 
          username: userProfile.username,
          profile_image_url: userProfile.profile_image_url,
          connection_type: "oauth"
        }
      }, {
        onConflict: 'user_id, platform, platform_account_id',
        ignoreDuplicates: false
      });
        
    if (error) {
      console.error("Error storing Twitter connection:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        platform: 'twitter', 
        accountName: userProfile.name || `@${userProfile.username}`,
        accountType: "profile",
        username: userProfile.username
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error processing Twitter callback:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
}
