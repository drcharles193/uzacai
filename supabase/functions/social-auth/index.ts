
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

// LinkedIn OAuth credentials
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");
const LINKEDIN_REDIRECT_URI = "https://uzacai.com/linkedin-callback.html";

// Facebook OAuth credentials
const FACEBOOK_CLIENT_ID = Deno.env.get("FACEBOOK_CLIENT_ID");
const FACEBOOK_CLIENT_SECRET = Deno.env.get("FACEBOOK_CLIENT_SECRET");
const FACEBOOK_REDIRECT_URI = "https://uzacai.com/facebook-callback.html";

// Instagram OAuth credentials
const INSTAGRAM_CLIENT_ID = Deno.env.get("INSTAGRAM_CLIENT_ID");
const INSTAGRAM_CLIENT_SECRET = Deno.env.get("INSTAGRAM_CLIENT_SECRET");
const INSTAGRAM_REDIRECT_URI = Deno.env.get("INSTAGRAM_REDIRECT_URI") || "https://uzacai.com/instagram-callback.html";

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

// LinkedIn OAuth URL generator
function getLinkedInAuthUrl() {
  console.log("LinkedIn Client ID:", LINKEDIN_CLIENT_ID ? "Exists" : "Missing");
  console.log("LinkedIn Redirect URI:", LINKEDIN_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  const state = generateState();
  
  // Store state in database temporarily to validate callback
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
  url.searchParams.append('redirect_uri', LINKEDIN_REDIRECT_URI);
  url.searchParams.append('scope', 'openid profile email w_member_social');
  url.searchParams.append('state', state);
  
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
  
  // Store state in database temporarily to validate callback
  const url = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
  url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', 'public_profile,email');
  url.searchParams.append('response_type', 'code');
  
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

// LinkedIn token exchange function
async function exchangeLinkedInCode(code: string) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  try {
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', LINKEDIN_REDIRECT_URI);
    params.append('client_id', LINKEDIN_CLIENT_ID);
    params.append('client_secret', LINKEDIN_CLIENT_SECRET);
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn token exchange error:', errorText);
      throw new Error(`LinkedIn API error: ${response.status} ${errorText}`);
    }
    
    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error('Error exchanging LinkedIn code for tokens:', error);
    throw error;
  }
}

// Get LinkedIn user profile
async function getLinkedInUserProfile(accessToken: string) {
  try {
    const profileResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LinkedIn profile error:', errorText);
      throw new Error(`LinkedIn API error: ${profileResponse.status} ${errorText}`);
    }
    
    const profileData = await profileResponse.json();
    
    // Get email address
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    let emailData = null;
    if (emailResponse.ok) {
      emailData = await emailResponse.json();
    }
    
    return {
      id: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      email: emailData?.elements?.[0]?.['handle~']?.emailAddress,
      // Extract profile image if available
      profileImageUrl: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier
    };
  } catch (error) {
    console.error('Error fetching LinkedIn user profile:', error);
    throw error;
  }
}

// Facebook token exchange function
async function exchangeFacebookCode(code: string) {
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook OAuth credentials not configured");
  }
  
  try {
    console.log("Exchanging Facebook code for token...");
    
    const tokenUrl = 'https://graph.facebook.com/v20.0/oauth/access_token';
    
    const params = new URLSearchParams();
    params.append('client_id', FACEBOOK_CLIENT_ID);
    params.append('client_secret', FACEBOOK_CLIENT_SECRET);
    params.append('redirect_uri', FACEBOOK_REDIRECT_URI);
    params.append('code', code);
    
    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook token exchange error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${errorText}`);
    }
    
    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error('Error exchanging Facebook code for tokens:', error);
    throw error;
  }
}

// Get Facebook user profile
async function getFacebookUserProfile(accessToken: string) {
  try {
    console.log("Fetching Facebook user profile...");
    
    const response = await fetch(`https://graph.facebook.com/v20.0/me?fields=id,name,email,picture&access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook profile error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${errorText}`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching Facebook user profile:', error);
    throw error;
  }
}

// Instagram OAuth URL generator
function getInstagramAuthUrl() {
  console.log("Instagram Client ID:", INSTAGRAM_CLIENT_ID ? "Exists" : "Missing");
  console.log("Instagram Redirect URI:", INSTAGRAM_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  const state = generateState();
  
  // Store state in database temporarily to validate callback
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.append('client_id', INSTAGRAM_CLIENT_ID);
  url.searchParams.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
  url.searchParams.append('scope', 'user_profile,user_media');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('state', state);
  
  return { url: url.toString(), state };
}

// Instagram token exchange function
async function exchangeInstagramCode(code: string) {
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  try {
    console.log("Exchanging Instagram code for token...");
    
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
    
    const tokens = await response.json();
    return tokens;
  } catch (error) {
    console.error('Error exchanging Instagram code for tokens:', error);
    throw error;
  }
}

// Get Instagram user profile
async function getInstagramUserProfile(accessToken: string, userId: string) {
  try {
    console.log("Fetching Instagram user profile...");
    
    // First, we need to get the long-lived token
    const longLivedTokenUrl = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${accessToken}`;
    
    const tokenResponse = await fetch(longLivedTokenUrl);
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Instagram long-lived token error:', errorText);
      throw new Error(`Instagram API error: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    const longLivedToken = tokenData.access_token;
    
    // Now get the user profile
    const profileUrl = `https://graph.instagram.com/${userId}?fields=id,username&access_token=${longLivedToken}`;
    
    const profileResponse = await fetch(profileUrl);
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Instagram profile error:', errorText);
      throw new Error(`Instagram API error: ${profileResponse.status} ${errorText}`);
    }
    
    const userData = await profileResponse.json();
    return {
      id: userData.id,
      username: userData.username,
      longLivedToken: longLivedToken
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
    const { platform, code, userId, action } = await req.json();
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
    // Handle LinkedIn OAuth flow
    else if (platform === 'linkedin') {
      if (action === 'auth-url') {
        // Step 1: Generate LinkedIn auth URL
        try {
          const { url, state } = getLinkedInAuthUrl();
          
          // Store the state temporarily
          await supabase
            .from('oauth_states')
            .insert({
              user_id: userId,
              platform: 'linkedin',
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
          console.error("Error generating LinkedIn auth URL:", error);
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
          const tokens = await exchangeLinkedInCode(code);
          
          // Get user profile information
          const userProfile = await getLinkedInUserProfile(tokens.access_token);
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'linkedin',
              platform_account_id: userProfile.id,
              account_name: `${userProfile.firstName} ${userProfile.lastName}`,
              account_type: "profile",
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || null,
              token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
              last_used_at: new Date().toISOString(),
              metadata: { 
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: userProfile.email,
                profile_image_url: userProfile.profileImageUrl,
                connection_type: "oauth"
              }
            }, {
              onConflict: 'user_id, platform, platform_account_id',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error("Error storing LinkedIn connection:", error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              platform: 'linkedin', 
              accountName: `${userProfile.firstName} ${userProfile.lastName}`,
              accountType: "profile",
              firstName: userProfile.firstName,
              lastName: userProfile.lastName
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error processing LinkedIn callback:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } 
      else {
        return new Response(
          JSON.stringify({ error: "Invalid LinkedIn action" }),
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
          const tokens = await exchangeFacebookCode(code);
          
          // Get user profile information
          const userProfile = await getFacebookUserProfile(tokens.access_token);
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'facebook',
              platform_account_id: userProfile.id,
              account_name: userProfile.name || 'Facebook User',
              account_type: "profile",
              access_token: tokens.access_token,
              refresh_token: null, // Facebook doesn't use refresh tokens in the same way
              token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
              last_used_at: new Date().toISOString(),
              metadata: { 
                name: userProfile.name,
                email: userProfile.email,
                picture: userProfile.picture?.data?.url,
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
              accountName: userProfile.name || 'Facebook User',
              accountType: "profile",
              name: userProfile.name
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
          const tokens = await exchangeInstagramCode(code);
          
          // The response from Instagram includes the user_id and access_token
          const userId = tokens.user_id;
          const accessToken = tokens.access_token;
          
          // Get additional user profile information
          const userProfile = await getInstagramUserProfile(accessToken, userId);
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'instagram',
              platform_account_id: userProfile.id,
              account_name: userProfile.username || 'Instagram User',
              account_type: "profile",
              access_token: userProfile.longLivedToken || accessToken,
              refresh_token: null, // Instagram Basic Display API doesn't use refresh tokens
              token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days for long-lived token
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
              accountName: userProfile.username || 'Instagram User',
              accountType: "profile",
              username: userProfile.username
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
    // Mock implementation for other platforms
    else {
      console.log(`Using mock implementation for platform: ${platform}`);
      // For now, just return mock responses for other platforms
      const mockResponse = getMockPlatformResponse(platform);
      
      return new Response(
        JSON.stringify(mockResponse),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
