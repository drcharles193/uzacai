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

// Twitter API credentials
const TWITTER_API_KEY = Deno.env.get("TWITTER_API_KEY");
const TWITTER_API_SECRET = Deno.env.get("TWITTER_API_SECRET");
const TWITTER_CALLBACK_URL = Deno.env.get("TWITTER_CALLBACK_URL");

// Facebook API credentials
const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");
const FACEBOOK_REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI");

// Generate a random string for OAuth state
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Twitter OAuth URL generator
function getTwitterAuthUrl() {
  if (!TWITTER_API_KEY || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter API credentials not configured");
  }
  
  const state = generateState();
  
  // Store state in database temporarily to validate callback
  // In a real implementation, you'd store this state and check it when the callback returns
  
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
async function exchangeTwitterCode(code: string) {
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

// Facebook OAuth URL generator
function getFacebookAuthUrl() {
  if (!FACEBOOK_APP_ID || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook API credentials not configured");
  }
  
  const state = generateState();
  
  // Define Facebook permissions
  const permissions = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_read_user_content',
    'pages_manage_engagement',
    'publish_to_groups'
  ].join(',');
  
  const url = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  url.searchParams.append('client_id', FACEBOOK_APP_ID);
  url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', permissions);
  url.searchParams.append('response_type', 'code');
  
  return { url: url.toString(), state };
}

// Facebook token exchange function
async function exchangeFacebookCode(code: string) {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook API credentials not configured");
  }
  
  // Exchange code for access token
  const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
  
  const params = new URLSearchParams();
  params.append('client_id', FACEBOOK_APP_ID);
  params.append('client_secret', FACEBOOK_APP_SECRET);
  params.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  params.append('code', code);
  
  try {
    const response = await fetch(`${tokenUrl}?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook token exchange error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${errorText}`);
    }
    
    const tokenData = await response.json();
    
    // Get long-lived access token
    const llTokenParams = new URLSearchParams();
    llTokenParams.append('grant_type', 'fb_exchange_token');
    llTokenParams.append('client_id', FACEBOOK_APP_ID);
    llTokenParams.append('client_secret', FACEBOOK_APP_SECRET);
    llTokenParams.append('fb_exchange_token', tokenData.access_token);
    
    const llTokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?${llTokenParams.toString()}`);
    
    if (!llTokenResponse.ok) {
      const errorText = await llTokenResponse.text();
      console.error('Facebook long-lived token error:', errorText);
      throw new Error(`Facebook API error: ${llTokenResponse.status} ${errorText}`);
    }
    
    const llTokenData = await llTokenResponse.json();
    
    return {
      access_token: llTokenData.access_token,
      expires_in: llTokenData.expires_in
    };
  } catch (error) {
    console.error('Error exchanging Facebook code for tokens:', error);
    throw error;
  }
}

// Get Facebook user profile and pages
async function getFacebookUserData(accessToken: string) {
  try {
    // Get user profile
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`);
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('Facebook user profile error:', errorText);
      throw new Error(`Facebook API error: ${userResponse.status} ${errorText}`);
    }
    
    const userData = await userResponse.json();
    
    // Get user pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    
    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text();
      console.error('Facebook pages error:', errorText);
      throw new Error(`Facebook API error: ${pagesResponse.status} ${errorText}`);
    }
    
    const pagesData = await pagesResponse.json();
    
    return {
      user: userData,
      pages: pagesData.data || []
    };
  } catch (error) {
    console.error('Error fetching Facebook user data:', error);
    throw error;
  }
}

// Handle mock connections for other platforms
function getMockPlatformResponse(platform: string) {
  // Simulate different platform responses
  switch(platform) {
    case 'facebook':
      return {
        success: true,
        platformId: `fb-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Facebook Page",
        accountType: "page",
        accessToken: "mock-fb-access-token",
        refreshToken: "mock-fb-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60).toISOString() // 60 days
      };
    case 'instagram':
      return {
        success: true,
        platformId: `ig-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Instagram Business",
        accountType: "business",
        accessToken: "mock-ig-access-token",
        refreshToken: "mock-ig-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60).toISOString() // 60 days
      };
    case 'twitter':
      return {
        success: true,
        platformId: `tw-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Twitter Profile",
        accountType: "profile",
        accessToken: "mock-tw-access-token",
        refreshToken: "mock-tw-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 7).toISOString() // 7 days
      };
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
    case 'bluesky':
      return {
        success: true,
        platformId: `bs-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Bluesky Account",
        accountType: "personal",
        accessToken: "mock-bs-access-token",
        refreshToken: null, // Bluesky uses a different auth mechanism
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
          // In a real implementation, validate state parameter against stored state
          
          // Exchange code for tokens
          const tokens = await exchangeFacebookCode(code);
          
          // Get user profile information and pages
          const userData = await getFacebookUserData(tokens.access_token);
          
          console.log("Facebook user data retrieved:", userData.user.name);
          console.log("Facebook pages count:", userData.pages.length);
          
          // Store each page as a separate connection in the database
          if (userData.pages && userData.pages.length > 0) {
            for (const page of userData.pages) {
              const { data, error } = await supabase
                .from('social_accounts')
                .upsert({
                  user_id: userId,
                  platform: 'facebook',
                  platform_account_id: page.id,
                  account_name: page.name,
                  account_type: "page",
                  access_token: page.access_token,
                  refresh_token: null,
                  token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
                  last_used_at: new Date().toISOString(),
                  metadata: { 
                    page_id: page.id,
                    user_id: userData.user.id,
                    user_name: userData.user.name,
                    connection_type: "oauth",
                    permissions: page.tasks || []
                  }
                }, {
                  onConflict: 'user_id, platform, platform_account_id',
                  ignoreDuplicates: false
                });
                
              if (error) {
                console.error("Error storing Facebook page connection:", error);
              } else {
                console.log(`Successfully connected Facebook page: ${page.name}`);
              }
            }
          }
          
          // Also store the user's personal Facebook account
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'facebook',
              platform_account_id: userData.user.id,
              account_name: userData.user.name,
              account_type: "profile",
              access_token: tokens.access_token,
              refresh_token: null,
              token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
              last_used_at: new Date().toISOString(),
              metadata: { 
                connection_type: "oauth",
                email: userData.user.email,
                pages_count: userData.pages.length
              }
            }, {
              onConflict: 'user_id, platform, platform_account_id',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error("Error storing Facebook user connection:", error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              platform: 'facebook', 
              accountName: userData.user.name,
              accountType: "profile",
              pagesCount: userData.pages.length
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
