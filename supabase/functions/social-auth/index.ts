
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
const FACEBOOK_REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI") || "https://uzacai.com/facebook-callback.html";

// Instagram OAuth credentials (uses Facebook for authentication)
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
  
  // Facebook scopes for page management and Instagram publishing
  const scopes = [
    'pages_show_list',
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_manage_metadata',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights'
  ];
  
  // Store state in database temporarily to validate callback
  const url = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
  url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', scopes.join(','));
  url.searchParams.append('response_type', 'code');
  
  return { url: url.toString(), state };
}

// Instagram OAuth URL generator (uses Facebook OAuth)
function getInstagramAuthUrl() {
  console.log("Instagram Client ID:", FACEBOOK_CLIENT_ID ? "Exists" : "Missing");
  console.log("Instagram Redirect URI:", INSTAGRAM_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!FACEBOOK_CLIENT_ID || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  const state = generateState();
  
  // Facebook scopes for Instagram publishing
  const scopes = [
    'pages_show_list',
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_manage_metadata',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights'
  ];
  
  // Store state in database temporarily to validate callback
  const url = new URL('https://www.facebook.com/v20.0/dialog/oauth');
  url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
  url.searchParams.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', scopes.join(','));
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
    
    console.log("Facebook exchange params:", params.toString());
    
    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log(`Facebook token exchange response status: ${response.status}`);
    console.log(`Facebook token exchange response: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} - ${responseText}`);
    }
    
    const tokens = JSON.parse(responseText);
    return tokens;
  } catch (error) {
    console.error('Error exchanging Facebook code for tokens:', error);
    throw error;
  }
}

// Get Facebook user pages
async function getFacebookPages(accessToken: string) {
  try {
    console.log("Fetching Facebook pages...");
    
    const response = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log(`Facebook pages response status: ${response.status}`);
    console.log(`Facebook pages response: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} - ${responseText}`);
    }
    
    const pagesData = JSON.parse(responseText);
    return pagesData.data || [];
  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    throw error;
  }
}

// Get Instagram Business Account for a page
async function getInstagramBusinessAccount(pageId: string, pageAccessToken: string) {
  try {
    console.log(`Fetching Instagram Business Account for page ${pageId}...`);
    
    const response = await fetch(`https://graph.facebook.com/v20.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log(`Instagram business account response status: ${response.status}`);
    console.log(`Instagram business account response: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    return data.instagram_business_account;
  } catch (error) {
    console.error('Error fetching Instagram business account:', error);
    throw error;
  }
}

// Instagram token exchange function (reusing Facebook OAuth)
async function exchangeInstagramCode(code: string) {
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  try {
    console.log("Exchanging Instagram code for token (via Facebook OAuth)...");
    
    const tokenUrl = 'https://graph.facebook.com/v20.0/oauth/access_token';
    
    const params = new URLSearchParams();
    params.append('client_id', FACEBOOK_CLIENT_ID);
    params.append('client_secret', FACEBOOK_CLIENT_SECRET);
    params.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
    params.append('code', code);
    
    console.log("Instagram exchange params:", params.toString());
    
    const response = await fetch(`${tokenUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    const responseText = await response.text();
    console.log(`Instagram token exchange response status: ${response.status}`);
    console.log(`Instagram token exchange response: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status} - ${responseText}`);
    }
    
    const tokens = JSON.parse(responseText);
    return tokens;
  } catch (error) {
    console.error('Error exchanging Instagram code for tokens:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  
  try {
    const { platform, action, code, userId } = await req.json();
    
    console.log(`Received request for ${platform}, action: ${action}`);
    console.log(`User ID: ${userId || 'not provided'}`);
    
    if (!platform) {
      throw new Error("Platform is required");
    }
    
    if (!action) {
      throw new Error("Action is required");
    }
    
    // Generate auth URL for the specified platform
    if (action === 'auth-url') {
      let result;
      
      switch (platform) {
        case 'twitter':
          result = getTwitterAuthUrl();
          break;
        case 'linkedin':
          result = getLinkedInAuthUrl();
          break;
        case 'facebook':
          result = getFacebookAuthUrl();
          break;
        case 'instagram':
          result = getInstagramAuthUrl();
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Handle OAuth callback and token exchange
    if (action === 'callback') {
      if (!code) {
        throw new Error("Code is required for callback");
      }
      
      if (!userId) {
        throw new Error("User ID is required for callback");
      }
      
      console.log(`Received auth request for platform: ${platform}, action: ${action}, userId: ${userId}`);
      console.log(`Authorization code: ${code.substring(0, 10)}...`);
      
      let result;
      let accountName: string;
      let accessToken: string;
      let refreshToken: string | null = null;
      let expiresAt: Date | null = null;
      let platformAccountId: string | null = null;
      let accountMetadata: any = {};
      
      switch (platform) {
        case 'twitter': {
          const tokens = await exchangeTwitterCode(code);
          const profile = await getTwitterUserProfile(tokens.access_token);
          
          accessToken = tokens.access_token;
          refreshToken = tokens.refresh_token;
          accountName = profile.username;
          platformAccountId = profile.id;
          
          // Calculate expiration date if provided in seconds
          if (tokens.expires_in) {
            expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
          }
          
          // Store metadata for later use
          accountMetadata = {
            profile_image_url: profile.profile_image_url,
            name: profile.name
          };
          
          result = { accountName, profile };
          break;
        }
          
        case 'linkedin': {
          const tokens = await exchangeLinkedInCode(code);
          const profile = await getLinkedInUserProfile(tokens.access_token);
          
          accessToken = tokens.access_token;
          refreshToken = tokens.refresh_token || null;
          accountName = `${profile.firstName} ${profile.lastName}`;
          platformAccountId = profile.id;
          
          // Calculate expiration date if provided in seconds
          if (tokens.expires_in) {
            expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
          }
          
          // Store metadata for later use
          accountMetadata = {
            profile_image_url: profile.profileImageUrl,
            email: profile.email
          };
          
          result = { accountName, profile };
          break;
        }
          
        case 'facebook': {
          const tokens = await exchangeFacebookCode(code);
          accessToken = tokens.access_token;
          
          // Calculate expiration date if provided in seconds
          if (tokens.expires_in) {
            expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
          }
          
          // Get user's Facebook pages
          const pages = await getFacebookPages(accessToken);
          
          if (!pages || pages.length === 0) {
            throw new Error("No Facebook Pages available. Please create a Facebook Page first.");
          }
          
          // For simplicity, use the first page
          // In a real app, let users select which page to use
          const selectedPage = pages[0];
          
          accountName = selectedPage.name;
          platformAccountId = selectedPage.id;
          accessToken = selectedPage.access_token; // Use page access token instead of user token
          
          // Store page info in metadata
          accountMetadata = {
            page_id: selectedPage.id,
            page_name: selectedPage.name,
            page_category: selectedPage.category,
            available_pages: pages.map((p: any) => ({ id: p.id, name: p.name }))
          };
          
          result = { accountName, page: selectedPage, allPages: pages };
          break;
        }
          
        case 'instagram': {
          const tokens = await exchangeInstagramCode(code);
          accessToken = tokens.access_token;
          
          // Calculate expiration date if provided in seconds
          if (tokens.expires_in) {
            expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
          }
          
          // Get user's Facebook pages first
          const pages = await getFacebookPages(accessToken);
          
          if (!pages || pages.length === 0) {
            throw new Error("No Facebook Pages available. Please create a Facebook Page first.");
          }
          
          // Find a page with an Instagram business account
          let instagramAccountFound = false;
          let selectedPage = null;
          let instagramAccount = null;
          
          for (const page of pages) {
            try {
              const igAccount = await getInstagramBusinessAccount(page.id, page.access_token);
              if (igAccount && igAccount.id) {
                selectedPage = page;
                instagramAccount = igAccount;
                instagramAccountFound = true;
                break;
              }
            } catch (error) {
              console.error(`Error checking Instagram account for page ${page.id}:`, error);
              // Continue with next page
            }
          }
          
          if (!instagramAccountFound) {
            throw new Error("No Instagram Business Account found. Please connect a Facebook Page to an Instagram Business account and try again.");
          }
          
          accountName = `Instagram via ${selectedPage.name}`;
          platformAccountId = instagramAccount.id;
          accessToken = selectedPage.access_token; // Use page access token for Instagram API
          
          // Store page and Instagram info in metadata
          accountMetadata = {
            page_id: selectedPage.id,
            page_name: selectedPage.name,
            instagram_account_id: instagramAccount.id,
            available_pages: pages.map((p: any) => ({ id: p.id, name: p.name }))
          };
          
          result = { accountName, instagram: instagramAccount, page: selectedPage };
          break;
        }
          
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
      
      // Check if account already exists
      const { data: existingAccounts, error: queryError } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', platform)
        .eq('platform_account_id', platformAccountId);
      
      if (queryError) {
        throw new Error(`Database error: ${queryError.message}`);
      }
      
      console.log(`Found ${existingAccounts?.length || 0} existing accounts for platform ${platform}`);
      
      // Upsert - either update existing or insert new
      if (existingAccounts && existingAccounts.length > 0) {
        console.log(`Updating existing ${platform} account for user ${userId}`);
        
        const { error: updateError } = await supabase
          .from('social_accounts')
          .update({
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: expiresAt,
            last_used_at: new Date(),
            metadata: accountMetadata,
            account_name: accountName
          })
          .eq('id', existingAccounts[0].id);
        
        if (updateError) {
          throw new Error(`Database update error: ${updateError.message}`);
        }
      } else {
        console.log(`Creating new ${platform} account for user ${userId}`);
        
        const accountType = platform === 'facebook' 
          ? 'page'
          : platform === 'instagram' 
            ? 'business'
            : 'personal';
        
        const { error: insertError } = await supabase
          .from('social_accounts')
          .insert({
            user_id: userId,
            platform: platform,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: expiresAt,
            platform_account_id: platformAccountId,
            account_name: accountName,
            account_type: accountType,
            metadata: accountMetadata,
            connected_at: new Date(),
            last_used_at: new Date()
          });
        
        if (insertError) {
          throw new Error(`Database insert error: ${insertError.message}`);
        }
      }
      
      console.log(`Successfully processed ${platform} account for user ${userId}`);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
