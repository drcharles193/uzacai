
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

// LinkedIn OAuth URL generator
function getLinkedInAuthUrl(redirectUri: string) {
  console.log("LinkedIn Client ID:", LINKEDIN_CLIENT_ID ? "Exists" : "Missing");
  console.log("Redirect URI:", redirectUri);
  
  if (!LINKEDIN_CLIENT_ID) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  const state = generateState();
  
  // Create authorization URL
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', 'openid profile email w_member_social');
  
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

// LinkedIn token exchange function
async function exchangeLinkedInCode(code: string, redirectUri: string) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', LINKEDIN_CLIENT_ID);
  params.append('client_secret', LINKEDIN_CLIENT_SECRET);
  
  try {
    console.log(`Exchanging LinkedIn code for token with redirect URI: ${redirectUri}`);
    
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

// Get LinkedIn user profile
async function getLinkedInUserProfile(accessToken: string) {
  try {
    // Get basic profile info
    const response = await fetch('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn user profile error:', errorText);
      throw new Error(`LinkedIn API error: ${response.status} ${errorText}`);
    }
    
    const userData = await response.json();
    
    // Get email address (requires email scope)
    let emailData = {};
    try {
      const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (emailResponse.ok) {
        emailData = await emailResponse.json();
      }
    } catch (error) {
      console.error('Error fetching LinkedIn email, continuing without it:', error);
    }
    
    return {
      ...userData,
      email: emailData
    };
  } catch (error) {
    console.error('Error fetching LinkedIn user profile:', error);
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
    const { platform, code, userId, action, redirectUri } = await req.json();
    console.log(`Received auth request for platform: ${platform}, action: ${action}, userId: ${userId}`);
    console.log("Environment variables check:", {
      twitterClientId: TWITTER_CLIENT_ID ? "Exists" : "Missing",
      twitterClientSecret: TWITTER_CLIENT_SECRET ? "Exists" : "Missing",
      twitterCallbackUrl: TWITTER_CALLBACK_URL ? "Exists" : "Missing",
      linkedinClientId: LINKEDIN_CLIENT_ID ? "Exists" : "Missing",
      linkedinClientSecret: LINKEDIN_CLIENT_SECRET ? "Exists" : "Missing"
    });
    
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
    // Handle LinkedIn OAuth flow
    else if (platform === 'linkedin') {
      if (action === 'auth-url') {
        // Step 1: Generate LinkedIn auth URL
        try {
          if (!redirectUri) {
            throw new Error("LinkedIn redirect URI is required");
          }
          
          const decodedRedirectUri = decodeURIComponent(redirectUri);
          const { url, state } = getLinkedInAuthUrl(decodedRedirectUri);
          
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
          if (!redirectUri) {
            throw new Error("LinkedIn redirect URI is required");
          }
          
          // Exchange code for tokens
          const tokens = await exchangeLinkedInCode(code, redirectUri);
          
          // Get user profile information
          const userProfile = await getLinkedInUserProfile(tokens.access_token);
          
          const userName = userProfile.localizedFirstName && userProfile.localizedLastName 
            ? `${userProfile.localizedFirstName} ${userProfile.localizedLastName}`
            : "LinkedIn Profile";
            
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'linkedin',
              platform_account_id: userProfile.id,
              account_name: userName,
              account_type: "personal",
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || null,
              token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
              last_used_at: new Date().toISOString(),
              metadata: { 
                firstName: userProfile.localizedFirstName,
                lastName: userProfile.localizedLastName,
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
              accountName: userName,
              accountType: "personal"
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
        // For now, use mock connection for LinkedIn
        try {
          const result = getMockPlatformResponse('linkedin');
          
          // Add a slight delay to simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'linkedin',
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
              accountName: result.accountName,
              accountType: result.accountType
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error creating mock LinkedIn connection:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
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
