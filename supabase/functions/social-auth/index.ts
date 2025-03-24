
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "https://deno.land/std@0.119.0/node/crypto.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Twitter OAuth credentials
const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID");
const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET");
const TWITTER_CALLBACK_URL = Deno.env.get("TWITTER_CALLBACK_URL") || "https://uzacai.com/twitter-callback.html";

// LinkedIn OAuth credentials
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");
// IMPORTANT: Use exactly the registered redirect URI - this must match what's configured in LinkedIn
const LINKEDIN_REDIRECT_URI = "https://uzacai.com/linkedin-callback.html";

// Generate a random string for OAuth state
function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Twitter OAuth URL generator
function getTwitterAuthUrl() {
  console.log("Twitter Client ID:", TWITTER_CLIENT_ID ? "Exists" : "Missing");
  console.log("Twitter Callback URL:", TWITTER_CALLBACK_URL ? "Exists" : "Missing");
  
  if (!TWITTER_CLIENT_ID || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter OAuth credentials not configured");
  }
  
  // Generate an OAuth state for security
  const state = generateState();
  
  // For Twitter OAuth 2.0, we use the Authorization Code flow with PKCE
  const codeVerifier = generateState() + generateState();
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = crypto.subtle.digestSync("SHA-256", data);
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  
  const scope = "users.read tweet.read tweet.write offline.access";
  
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CLIENT_ID,
    redirect_uri: TWITTER_CALLBACK_URL,
    scope: scope,
    state: state,
    code_challenge: base64Digest,
    code_challenge_method: "S256"
  });
  
  return {
    url: `https://twitter.com/i/oauth2/authorize?${queryParams.toString()}`,
    state: state,
    codeVerifier: codeVerifier
  };
}

// Exchange Twitter authorization code for tokens
async function exchangeTwitterCode(code: string, codeVerifier: string) {
  console.log("Exchanging Twitter code for tokens");
  
  if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET || !TWITTER_CALLBACK_URL) {
    throw new Error("Twitter OAuth credentials not configured");
  }
  
  const basicAuth = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`);
  
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${basicAuth}`
    },
    body: new URLSearchParams({
      code: code,
      grant_type: "authorization_code",
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: TWITTER_CALLBACK_URL,
      code_verifier: codeVerifier
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Twitter token exchange error:", errorText);
    throw new Error(`Twitter error: ${response.status} ${errorText}`);
  }
  
  const tokens = await response.json();
  
  // Get user info using the access token
  const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url", {
    headers: {
      "Authorization": `Bearer ${tokens.access_token}`
    }
  });
  
  if (!userResponse.ok) {
    throw new Error(`Failed to fetch Twitter user data: ${userResponse.status}`);
  }
  
  const userData = await userResponse.json();
  
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    user: userData.data
  };
}

// LinkedIn OAuth URL generator
function getLinkedInAuthUrl() {
  console.log("LinkedIn Client ID:", LINKEDIN_CLIENT_ID ? "Exists" : "Missing");
  console.log("LinkedIn Redirect URI:", LINKEDIN_REDIRECT_URI);
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  // Generate an OAuth state for security
  const state = generateState();
  
  const scope = "r_liteprofile r_emailaddress w_member_social";
  
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    scope: scope,
    state: state
  });
  
  return {
    url: `https://www.linkedin.com/oauth/v2/authorization?${queryParams.toString()}`,
    state: state
  };
}

// Exchange LinkedIn authorization code for tokens
async function exchangeLinkedInCode(code: string) {
  console.log("Exchanging LinkedIn code for tokens", 
    "Client ID present:", !!LINKEDIN_CLIENT_ID,
    "Client Secret present:", !!LINKEDIN_CLIENT_SECRET,
    "Redirect URI:", LINKEDIN_REDIRECT_URI);
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  try {
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: LINKEDIN_REDIRECT_URI
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange error:", errorText);
      throw new Error(`LinkedIn error: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokens = await tokenResponse.json();
    
    // Get user info using the access token
    const userResponse = await fetch("https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))", {
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Failed to fetch LinkedIn user data: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    
    // Get email address
    const emailResponse = await fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`
      }
    });
    
    let emailData = null;
    if (emailResponse.ok) {
      emailData = await emailResponse.json();
    }
    
    return {
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      userData: userData,
      emailData: emailData
    };
  } catch (error) {
    console.error("Error exchanging LinkedIn code:", error);
    throw error;
  }
}

// Store social credentials in the database
async function storeSocialCredentials(userId: string, platform: string, data: any) {
  console.log(`Storing ${platform} credentials for user ${userId}`);
  
  try {
    // First check if the user already has credentials for this platform
    const { data: existingCredentials, error: checkError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking existing credentials:", checkError);
      throw checkError;
    }
    
    let platformData: any = {};
    let accountName = "";
    
    if (platform === 'twitter') {
      platformData = {
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
        user_id: data.user.id,
        username: data.user.username,
        name: data.user.name,
        profile_image_url: data.user.profile_image_url
      };
      accountName = data.user.username;
    } 
    else if (platform === 'linkedin') {
      let email = "";
      if (data.emailData && 
          data.emailData.elements && 
          data.emailData.elements.length > 0 && 
          data.emailData.elements[0]['handle~'] && 
          data.emailData.elements[0]['handle~'].emailAddress) {
        email = data.emailData.elements[0]['handle~'].emailAddress;
      }
      
      platformData = {
        access_token: data.accessToken,
        expires_in: data.expiresIn,
        user_id: data.userData.id,
        first_name: data.userData.localizedFirstName,
        last_name: data.userData.localizedLastName,
        email: email
      };
      accountName = `${data.userData.localizedFirstName} ${data.userData.localizedLastName}`;
    }
    
    // Store account details
    if (existingCredentials) {
      // Update existing credentials
      const { error: updateError } = await supabase
        .from('social_accounts')
        .update({
          credentials: platformData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCredentials.id);
      
      if (updateError) {
        console.error("Error updating credentials:", updateError);
        throw updateError;
      }
    } else {
      // Insert new credentials
      const { error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          user_id: userId,
          platform: platform,
          credentials: platformData,
          account_name: accountName
        });
      
      if (insertError) {
        console.error("Error inserting credentials:", insertError);
        throw insertError;
      }
    }
    
    return { accountName };
  } catch (error) {
    console.error(`Error storing ${platform} credentials:`, error);
    throw error;
  }
}

// Main handler for social auth requests
serve(async (req) => {
  console.log("Social auth function invoked");
  
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const { platform, action, code, state, userId, codeVerifier } = await req.json();
    
    console.log(`Processing ${platform} auth request with action: ${action}`);
    
    // Twitter OAuth flow
    if (platform === 'twitter') {
      // Generate Twitter auth URL
      if (action === 'auth-url') {
        try {
          const { url, state, codeVerifier } = getTwitterAuthUrl();
          
          // Store the state and code verifier temporarily
          await supabase
            .from('oauth_states')
            .upsert({
              state: state,
              code_verifier: codeVerifier,
              user_id: userId,
              platform: 'twitter',
              created_at: new Date().toISOString()
            });
          
          return new Response(
            JSON.stringify({ authUrl: url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error generating Twitter auth URL:", error);
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Handle Twitter callback
      if (action === 'callback') {
        try {
          let verifier = codeVerifier;
          
          // If no code verifier was passed, look it up from the state
          if (!verifier && state) {
            const { data: stateData } = await supabase
              .from('oauth_states')
              .select('code_verifier')
              .eq('state', state)
              .eq('platform', 'twitter')
              .single();
            
            if (stateData) {
              verifier = stateData.code_verifier;
            }
          }
          
          if (!verifier) {
            throw new Error("No code verifier found for Twitter OAuth");
          }
          
          // Exchange auth code for tokens
          const twitterData = await exchangeTwitterCode(code, verifier);
          
          // Store credentials in database
          const result = await storeSocialCredentials(userId, 'twitter', twitterData);
          
          return new Response(
            JSON.stringify({ success: true, accountName: result.accountName }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error in Twitter callback:", error);
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // LinkedIn OAuth flow
    if (platform === 'linkedin') {
      // Generate LinkedIn auth URL
      if (action === 'auth-url') {
        try {
          const { url, state } = getLinkedInAuthUrl();
          console.log("Generated LinkedIn auth URL with redirect to:", LINKEDIN_REDIRECT_URI);
          
          // Store the state temporarily
          await supabase
            .from('oauth_states')
            .upsert({
              state: state,
              user_id: userId,
              platform: 'linkedin',
              created_at: new Date().toISOString()
            });
          
          return new Response(
            JSON.stringify({ authUrl: url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error generating LinkedIn auth URL:", error);
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Handle LinkedIn callback
      if (action === 'callback') {
        try {
          console.log("Processing LinkedIn callback with code:", code ? "present" : "missing");
          
          // Exchange auth code for tokens
          const linkedinData = await exchangeLinkedInCode(code);
          
          // Store credentials in database
          const result = await storeSocialCredentials(userId, 'linkedin', linkedinData);
          
          return new Response(
            JSON.stringify({ success: true, accountName: result.accountName }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("Error in LinkedIn callback:", error);
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    // If we reach here, the request was invalid
    return new Response(
      JSON.stringify({ error: { message: `Invalid request: Unknown platform '${platform}' or action '${action}'` } }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
