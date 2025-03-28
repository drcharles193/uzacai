
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "https://deno.land/std@0.119.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Twitter OAuth credentials
const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID");
const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET");
const TWITTER_CALLBACK_URL = Deno.env.get("TWITTER_CALLBACK_URL");

// Facebook OAuth credentials
const FACEBOOK_CLIENT_ID = Deno.env.get("FACEBOOK_CLIENT_ID");
const FACEBOOK_CLIENT_SECRET = Deno.env.get("FACEBOOK_CLIENT_SECRET");
const FACEBOOK_REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI");

// Instagram OAuth credentials
const INSTAGRAM_CLIENT_ID = Deno.env.get("INSTAGRAM_CLIENT_ID");
const INSTAGRAM_CLIENT_SECRET = Deno.env.get("INSTAGRAM_CLIENT_SECRET");
const INSTAGRAM_REDIRECT_URI = Deno.env.get("INSTAGRAM_REDIRECT_URI");

// Generate a random string for OAuth state
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Twitter OAuth URL generator
function getTwitterAuthUrl() {
  console.log("Twitter Client ID:", TWITTER_CLIENT_ID ? "Exists" : "Missing");
  console.log("Twitter Callback URL:", TWITTER_CALLBACK_URL ? "Exists" : "Missing");
  
  if (!TWITTER_CLIENT_ID || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter OAuth credentials not configured");
  }
  
  const state = generateState();
  
  // Store state in database temporarily to validate callback
  // In a real implementation, you'd store this state and check it when the callback returns
  
  const url = new URL('https://twitter.com/i/oauth2/authorize');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', TWITTER_CLIENT_ID);
  url.searchParams.append('redirect_uri', TWITTER_CALLBACK_URL);
  url.searchParams.append('scope', 'tweet.read users.read offline.access');
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', 'challenge'); // In a real implementation, use PKCE
  url.searchParams.append('code_challenge_method', 'plain');
  
  return { url: url.toString(), state };
}

// Facebook OAuth URL generator
function getFacebookAuthUrl() {
  console.log("Facebook Client ID:", FACEBOOK_CLIENT_ID ? "Exists" : "Missing");
  console.log("Facebook Redirect URI:", FACEBOOK_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook OAuth credentials not configured");
  }
  
  const state = generateState();
  
  const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
  url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', 'pages_show_list,pages_read_engagement,pages_manage_posts');
  
  return { url: url.toString(), state };
}

// Instagram OAuth URL generator
function getInstagramAuthUrl() {
  console.log("Instagram Client ID:", INSTAGRAM_CLIENT_ID ? "Exists" : "Missing");
  console.log("Instagram Redirect URI:", INSTAGRAM_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  const state = generateState();
  
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.append('client_id', INSTAGRAM_CLIENT_ID);
  url.searchParams.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('state', state);
  url.searchParams.append('scope', 'user_profile,user_media');
  
  return { url: url.toString(), state };
}

// Twitter token exchange function
async function exchangeTwitterCode(code: string) {
  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter OAuth credentials not configured");
  }
  
  const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
  const basicAuth = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`);
  
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

// Facebook token exchange function
async function exchangeFacebookCode(code: string) {
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook OAuth credentials not configured");
  }
  
  try {
    // Exchange the code for a token
    const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
    const url = new URL(tokenUrl);
    url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
    url.searchParams.append('client_secret', FACEBOOK_CLIENT_SECRET);
    url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
    url.searchParams.append('code', code);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook token exchange error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${errorText}`);
    }
    
    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Error exchanging Facebook code for token:', error);
    throw error;
  }
}

// Instagram token exchange function
async function exchangeInstagramCode(code: string) {
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  try {
    // Exchange the code for a token
    const tokenUrl = 'https://api.instagram.com/oauth/access_token';
    
    const formData = new FormData();
    formData.append('client_id', INSTAGRAM_CLIENT_ID);
    formData.append('client_secret', INSTAGRAM_CLIENT_SECRET);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
    formData.append('code', code);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Instagram token exchange error:', errorText);
      throw new Error(`Instagram API error: ${response.status} ${errorText}`);
    }
    
    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error('Error exchanging Instagram code for token:', error);
    throw error;
  }
}

// Get Twitter user profile
async function getTwitterUserProfile(accessToken: string) {
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

// Get Facebook user profile
async function getFacebookUserProfile(accessToken: string) {
  try {
    // Get user profile
    const profileResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Facebook profile error:', errorText);
      throw new Error(`Facebook API error: ${profileResponse.status} ${errorText}`);
    }
    
    const profileData = await profileResponse.json();
    
    // Get pages (if we have pages_show_list permission)
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    
    if (!pagesResponse.ok) {
      console.error('Facebook pages error - user might not have pages or permission');
      // Not throwing here as this is optional
      return {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        picture: profileData.picture?.data?.url,
        accountType: 'personal'
      };
    }
    
    const pagesData = await pagesResponse.json();
    
    // If user has pages, use the first one
    if (pagesData.data && pagesData.data.length > 0) {
      const page = pagesData.data[0];
      return {
        id: page.id,
        name: page.name,
        accessToken: page.access_token, // Page-specific token
        accountType: 'page'
      };
    }
    
    return {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      picture: profileData.picture?.data?.url,
      accountType: 'personal'
    };
  } catch (error) {
    console.error('Error fetching Facebook user profile:', error);
    throw error;
  }
}

// Get Instagram user profile
async function getInstagramUserProfile(accessToken: string, userId: string) {
  try {
    // Get user profile
    const profileResponse = await fetch(`https://graph.instagram.com/v18.0/${userId}?fields=id,username&access_token=${accessToken}`);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Instagram profile error:', errorText);
      throw new Error(`Instagram API error: ${profileResponse.status} ${errorText}`);
    }
    
    const profileData = await profileResponse.json();
    
    return {
      id: profileData.id,
      username: profileData.username,
      accountType: 'business'
    };
  } catch (error) {
    console.error('Error fetching Instagram user profile:', error);
    throw error;
  }
}

// Handle mock connections for other platforms
function getMockPlatformResponse(platform: string) {
  // Simulate different platform responses
  switch(platform) {
    case 'linkedin':
      return {
        success: true,
        platformId: `li-${Math.floor(Math.random() * 1000000)}`,
        accountName: "LinkedIn Profile",
        accountType: "personal",
        accessToken: "mock-li-access-token",
        refreshToken: "mock-li-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 60).toISOString() // 60 days
      };
    case 'youtube':
      return {
        success: true,
        platformId: `yt-${Math.floor(Math.random() * 1000000)}`,
        accountName: "YouTube Channel",
        accountType: "channel",
        accessToken: "mock-yt-access-token",
        refreshToken: "mock-yt-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString() // 30 days
      };
    case 'pinterest':
      return {
        success: true,
        platformId: `pin-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Pinterest Business",
        accountType: "business",
        accessToken: "mock-pin-access-token",
        refreshToken: "mock-pin-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 365).toISOString() // 365 days
      };
    case 'tiktok':
      return {
        success: true,
        platformId: `tt-${Math.floor(Math.random() * 1000000)}`,
        accountName: "TikTok Creator",
        accountType: "creator",
        accessToken: "mock-tt-access-token",
        refreshToken: "mock-tt-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 15).toISOString() // 15 days
      };
    case 'threads':
      return {
        success: true,
        platformId: `th-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Threads Profile",
        accountType: "profile",
        accessToken: "mock-th-access-token",
        refreshToken: "mock-th-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 90).toISOString() // 90 days
      };
    case 'google':
      return {
        success: true,
        platformId: `g-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Google Account",
        accountType: "personal",
        accessToken: "mock-g-access-token",
        refreshToken: null,
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 365).toISOString() // Long-lived token
      };
    case 'tumblr':
      return {
        success: true,
        platformId: `tm-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Tumblr Blog",
        accountType: "blog",
        accessToken: "mock-tm-access-token",
        refreshToken: "mock-tm-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString() // 30 days
      };
    default:
      return {
        success: true,
        platformId: `generic-${Math.floor(Math.random() * 1000000)}`,
        accountName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        accountType: "personal",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour
      };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, code, userId, action, state } = await req.json();
    console.log(`Received auth request for platform: ${platform}, action: ${action}, userId: ${userId}`);
    
    // Handle Twitter OAuth flow
    if (platform === 'twitter') {
      if (action === 'auth-url') {
        // Step 1: Generate Twitter auth URL
        try {
          const { url, state } = getTwitterAuthUrl();
          
          // Store the state temporarily
          await supabase
            .from('oauth_states')
            .insert({
              user_id: userId,
              platform: 'twitter',
              state: state,
              created_at: new Date().toISOString()
            });
          
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
      else if (action === 'callback') {
        // Step 2: Handle callback and exchange code for tokens
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
      else {
        return new Response(
          JSON.stringify({ error: "Invalid Twitter action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    // Handle Facebook OAuth flow
    else if (platform === 'facebook') {
      if (action === 'auth-url') {
        // Step 1: Generate Facebook auth URL
        try {
          const { url, state } = getFacebookAuthUrl();
          
          // Store the state temporarily
          await supabase
            .from('oauth_states')
            .insert({
              user_id: userId,
              platform: 'facebook',
              state: state,
              created_at: new Date().toISOString()
            });
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              authUrl: url
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error generating Facebook auth URL:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }
      else if (action === 'callback') {
        // Step 2: Handle callback and exchange code for tokens
        try {
          // Exchange code for tokens
          const tokenData = await exchangeFacebookCode(code);
          
          // Get user profile information
          const userProfile = await getFacebookUserProfile(tokenData.access_token);
          
          // Determine expiration time (default to 3 months if not provided)
          const expiresIn = tokenData.expires_in || 7776000; // 90 days in seconds
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'facebook',
              platform_account_id: userProfile.id,
              account_name: userProfile.name,
              account_type: userProfile.accountType || 'personal',
              access_token: userProfile.accessToken || tokenData.access_token,
              refresh_token: null, // Facebook doesn't provide refresh tokens in basic flow
              token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
              last_used_at: new Date().toISOString(),
              metadata: { 
                email: userProfile.email,
                picture: userProfile.picture,
                connection_type: "oauth"
              }
            }, {
              onConflict: 'user_id, platform, platform_account_id',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error("Error storing Facebook connection:", error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              platform: 'facebook', 
              accountName: userProfile.name,
              accountType: userProfile.accountType || 'personal'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error processing Facebook callback:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }
      else {
        return new Response(
          JSON.stringify({ error: "Invalid Facebook action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    // Handle Instagram OAuth flow
    else if (platform === 'instagram') {
      if (action === 'auth-url') {
        // Step 1: Generate Instagram auth URL
        try {
          const { url, state } = getInstagramAuthUrl();
          
          // Store the state temporarily
          await supabase
            .from('oauth_states')
            .insert({
              user_id: userId,
              platform: 'instagram',
              state: state,
              created_at: new Date().toISOString()
            });
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              authUrl: url
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error generating Instagram auth URL:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }
      else if (action === 'callback') {
        // Step 2: Handle callback and exchange code for tokens
        try {
          // Exchange code for tokens
          const tokenData = await exchangeInstagramCode(code);
          
          // The response contains a user_id and access_token
          // Get user profile information
          const userProfile = await getInstagramUserProfile(tokenData.access_token, tokenData.user_id);
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'instagram',
              platform_account_id: userProfile.id,
              account_name: userProfile.username,
              account_type: userProfile.accountType || 'business',
              access_token: tokenData.access_token,
              refresh_token: null, // Instagram doesn't provide refresh tokens in basic flow
              token_expires_at: null, // Basic tokens don't expire
              last_used_at: new Date().toISOString(),
              metadata: { 
                username: userProfile.username,
                connection_type: "oauth"
              }
            }, {
              onConflict: 'user_id, platform, platform_account_id',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error("Error storing Instagram connection:", error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              platform: 'instagram', 
              accountName: userProfile.username,
              accountType: userProfile.accountType || 'business'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error processing Instagram callback:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      }
      else {
        return new Response(
          JSON.stringify({ error: "Invalid Instagram action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    } 
    else {
      // For other platforms, continue with mock connections
      const result = getMockPlatformResponse(platform);
      
      // Add a slight delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store the connection in the database
      const { data, error } = await supabase
        .from('social_accounts')
        .upsert({
          user_id: userId,
          platform: platform,
          platform_account_id: result.platformId,
          account_name: result.accountName,
          account_type: result.accountType,
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
          token_expires_at: result.expiresAt,
          last_used_at: new Date().toISOString(),
          metadata: { connection_type: "oauth" }
        }, {
          onConflict: 'user_id, platform, platform_account_id',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error("Error storing social connection:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Log success for debugging
      console.log(`Successfully connected ${platform} account: ${result.accountName}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          platform, 
          accountName: result.accountName,
          accountType: result.accountType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
