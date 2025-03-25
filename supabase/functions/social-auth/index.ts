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
const LINKEDIN_REDIRECT_URI = Deno.env.get("LINKEDIN_REDIRECT_URI") || "https://uzacai.com/linkedin-callback.html";

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
  console.log("[DIAG-STEP4] LinkedIn Auth URL Generator:", {
    clientIdExists: !!LINKEDIN_CLIENT_ID,
    redirectUri: LINKEDIN_REDIRECT_URI,
    timestamp: new Date().toISOString()
  });
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_REDIRECT_URI) {
    console.error("[DIAG-STEP4] LinkedIn OAuth credentials not configured");
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  // Generate an OAuth state for security
  const state = generateState();
  
  // IMPORTANT: Only use scopes that are approved in the LinkedIn Developer Console
  // Based on user's approved scopes: openid, profile, email, w_member_social
  const scope = "openid profile email w_member_social";
  
  const queryParams = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: LINKEDIN_REDIRECT_URI,
    scope: scope,
    state: state
  });

  const url = `https://www.linkedin.com/oauth/v2/authorization?${queryParams.toString()}`;
  
  console.log("[DIAG-STEP4] Generated LinkedIn auth URL:", {
    urlStart: url.substring(0, 100) + "...",
    state,
    scope,
    redirectUri: LINKEDIN_REDIRECT_URI,
    timestamp: new Date().toISOString()
  });
  
  return {
    url: url,
    state: state
  };
}

// Exchange LinkedIn authorization code for tokens
async function exchangeLinkedInCode(code: string) {
  console.log("[DIAG-STEP4] Exchanging LinkedIn code for tokens", {
    codeLength: code ? code.length : 0,
    codeFirstChars: code ? code.substring(0, 5) + "..." : "missing",
    codeLastChars: code ? "..." + code.substring(code.length - 5) : "missing",
    clientIdExists: !!LINKEDIN_CLIENT_ID,
    clientSecretExists: !!LINKEDIN_CLIENT_SECRET, 
    redirectUri: LINKEDIN_REDIRECT_URI,
    timestamp: new Date().toISOString()
  });
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_REDIRECT_URI) {
    console.error("[DIAG-STEP4] LinkedIn OAuth credentials not configured");
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  try {
    const tokenRequestUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
      redirect_uri: LINKEDIN_REDIRECT_URI
    });
    
    console.log("[DIAG-STEP4] Making LinkedIn token request to:", {
      url: tokenRequestUrl,
      bodyParams: {
        grant_type: "authorization_code",
        codeLength: code.length,
        codeFirstChars: code.substring(0, 5) + "...",
        codeLastChars: "..." + code.substring(code.length - 5),
        client_id: LINKEDIN_CLIENT_ID ? "present" : "missing",
        client_secret: LINKEDIN_CLIENT_SECRET ? "present" : "missing",
        redirect_uri: LINKEDIN_REDIRECT_URI
      },
      timestamp: new Date().toISOString()
    });
    
    const tokenResponse = await fetch(tokenRequestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: tokenRequestBody
    });
    
    console.log("[DIAG-STEP4] LinkedIn token response received:", {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      headers: Object.fromEntries(tokenResponse.headers.entries()),
      timestamp: new Date().toISOString()
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[DIAG-STEP4] LinkedIn token exchange error:", {
        status: tokenResponse.status,
        error: errorText,
        timestamp: new Date().toISOString()
      });
      throw new Error(`LinkedIn error: ${tokenResponse.status} ${errorText}`);
    }
    
    const tokens = await tokenResponse.json();
    
    console.log("[DIAG-STEP4] LinkedIn tokens received:", {
      accessTokenExists: !!tokens.access_token,
      accessTokenLength: tokens.access_token ? tokens.access_token.length : 0,
      tokenType: tokens.token_type,
      expiresIn: tokens.expires_in,
      timestamp: new Date().toISOString()
    });
    
    console.log("[DIAG-STEP4] Fetching LinkedIn user profile data");
    const userResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`
      }
    });
    
    console.log("[DIAG-STEP4] LinkedIn user data response:", {
      status: userResponse.status,
      statusText: userResponse.statusText,
      timestamp: new Date().toISOString()
    });
    
    if (!userResponse.ok) {
      console.error("[DIAG-STEP4] Failed to fetch LinkedIn user data:", {
        status: userResponse.status,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Failed to fetch LinkedIn user data: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    
    console.log("[DIAG-STEP4] LinkedIn user data received:", {
      userId: userData.id,
      hasFirstName: !!userData.localizedFirstName,
      hasLastName: !!userData.localizedLastName,
      firstName: userData.localizedFirstName,
      lastName: userData.localizedLastName,
      timestamp: new Date().toISOString()
    });
    
    console.log("[DIAG-STEP4] Fetching LinkedIn email data");
    const emailResponse = await fetch("https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))", {
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`
      }
    });
    
    console.log("[DIAG-STEP4] LinkedIn email response:", {
      status: emailResponse.status,
      statusText: emailResponse.statusText,
      timestamp: new Date().toISOString()
    });
    
    let emailData = null;
    if (emailResponse.ok) {
      emailData = await emailResponse.json();
      console.log("[DIAG-STEP4] Successfully fetched LinkedIn email data:", {
        hasElements: !!emailData.elements && emailData.elements.length > 0,
        elements: emailData.elements ? emailData.elements.length : 0,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn("[DIAG-STEP4] Could not fetch LinkedIn email data:", {
        status: emailResponse.status,
        error: await emailResponse.text(),
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
      userData: userData,
      emailData: emailData
    };
  } catch (error) {
    console.error("[DIAG-STEP4] Error exchanging LinkedIn code:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Store social credentials in the database
async function storeSocialCredentials(userId: string, platform: string, data: any) {
  console.log(`[DIAG-STEP4] Storing ${platform} credentials for user ${userId}`, {
    timestamp: new Date().toISOString()
  });
  
  try {
    const { data: existingCredentials, error: checkError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .maybeSingle();
    
    if (checkError) {
      console.error("[DIAG-STEP4] Error checking existing credentials:", {
        error: checkError,
        timestamp: new Date().toISOString()
      });
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
      
      console.log("[DIAG-STEP4] LinkedIn platform data prepared:", {
        hasAccessToken: !!data.accessToken,
        expiresIn: data.expiresIn,
        userId: data.userData.id,
        firstName: data.userData.localizedFirstName,
        lastName: data.userData.localizedLastName,
        hasEmail: !!email,
        accountName,
        timestamp: new Date().toISOString()
      });
    }
    
    let result;
    if (existingCredentials) {
      console.log("[DIAG-STEP4] Updating existing credentials for", platform);
      const { data: updateData, error: updateError } = await supabase
        .from('social_accounts')
        .update({
          credentials: platformData,
          account_name: accountName,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCredentials.id)
        .select();
      
      if (updateError) {
        console.error("[DIAG-STEP4] Error updating credentials:", {
          error: updateError,
          timestamp: new Date().toISOString()
        });
        throw updateError;
      }
      
      result = updateData;
      console.log("[DIAG-STEP4] Successfully updated credentials for", platform, {
        result: updateData ? "Success" : "Failed",
        accountName
      });
    } else {
      console.log("[DIAG-STEP4] Inserting new credentials for", platform);
      const { data: insertData, error: insertError } = await supabase
        .from('social_accounts')
        .insert({
          user_id: userId,
          platform: platform,
          credentials: platformData,
          account_name: accountName
        })
        .select();
      
      if (insertError) {
        console.error("[DIAG-STEP4] Error inserting credentials:", {
          error: insertError,
          timestamp: new Date().toISOString()
        });
        throw insertError;
      }
      
      result = insertData;
      console.log("[DIAG-STEP4] Successfully inserted credentials for", platform, {
        result: insertData ? "Success" : "Failed",
        accountName
      });
    }
    
    return { accountName, result };
  } catch (error) {
    console.error(`[DIAG-STEP4] Error storing ${platform} credentials:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Main handler for social auth requests
serve(async (req) => {
  console.log("[DIAG-STEP4] Social auth function invoked", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
  
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const requestData = await req.json();
    const { platform, action, code, state, userId, codeVerifier } = requestData;
    
    if (platform === 'twitter') {
      if (action === 'auth-url') {
        try {
          const { url, state, codeVerifier } = getTwitterAuthUrl();
          
          const { error: stateError } = await supabase
            .from('oauth_states')
            .upsert({
              state: state,
              code_verifier: codeVerifier,
              user_id: userId,
              platform: 'twitter',
              created_at: new Date().toISOString()
            });
          
          if (stateError) {
            console.error("[DIAG-STEP4] Error storing Twitter oauth state:", {
              error: stateError,
              timestamp: new Date().toISOString()
            });
          } else {
            console.log("[DIAG-STEP4] Successfully stored Twitter oauth state");
          }
          
          return new Response(
            JSON.stringify({ authUrl: url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("[DIAG-STEP4] Error generating Twitter auth URL:", {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      if (action === 'callback') {
        try {
          let verifier = codeVerifier;
          
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
          
          const twitterData = await exchangeTwitterCode(code, verifier);
          
          const result = await storeSocialCredentials(userId, 'twitter', twitterData);
          
          return new Response(
            JSON.stringify({ success: true, accountName: result.accountName }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("[DIAG-STEP4] Error in Twitter callback:", {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    if (platform === 'linkedin') {
      if (action === 'auth-url') {
        try {
          const { url, state } = getLinkedInAuthUrl();
          
          const { error: stateError } = await supabase
            .from('oauth_states')
            .upsert({
              state: state,
              user_id: userId,
              platform: 'linkedin',
              created_at: new Date().toISOString()
            });
          
          if (stateError) {
            console.error("[DIAG-STEP4] Error storing LinkedIn oauth state:", {
              error: stateError,
              timestamp: new Date().toISOString()
            });
          } else {
            console.log("[DIAG-STEP4] Successfully stored LinkedIn oauth state");
          }
          
          return new Response(
            JSON.stringify({ authUrl: url }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("[DIAG-STEP4] Error generating LinkedIn auth URL:", {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      if (action === 'callback') {
        try {
          console.log("[DIAG-STEP4] Processing LinkedIn callback", {
            hasCode: !!code,
            codeLength: code ? code.length : 0,
            codeFirstChars: code ? code.substring(0, 5) + "..." : "missing",
            codeLastChars: code ? "..." + code.substring(code.length - 5) : "missing",
            hasState: !!state,
            stateFirstChars: state ? state.substring(0, 5) + "..." : "missing",
            hasUserId: !!userId,
            userId: userId || "missing",
            timestamp: new Date().toISOString()
          });
          
          if (!code) {
            console.error("[DIAG-STEP4] No authorization code provided for LinkedIn callback");
            throw new Error("No authorization code provided");
          }
          
          const linkedinData = await exchangeLinkedInCode(code);
          
          if (!linkedinData || !linkedinData.accessToken) {
            console.error("[DIAG-STEP4] Failed to exchange LinkedIn code:", {
              dataReceived: !!linkedinData,
              hasAccessToken: linkedinData ? !!linkedinData.accessToken : false,
              timestamp: new Date().toISOString()
            });
            throw new Error("Failed to exchange code for LinkedIn tokens");
          }
          
          console.log("[DIAG-STEP4] Successfully exchanged LinkedIn code for tokens", {
            hasAccessToken: !!linkedinData.accessToken,
            timestamp: new Date().toISOString()
          });
          
          const result = await storeSocialCredentials(userId, 'linkedin', linkedinData);
          
          console.log("[DIAG-STEP4] LinkedIn credentials stored successfully:", {
            accountName: result.accountName,
            timestamp: new Date().toISOString()
          });
          
          return new Response(
            JSON.stringify({ success: true, accountName: result.accountName }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error("[DIAG-STEP4] Error in LinkedIn callback:", {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          return new Response(
            JSON.stringify({ error: { message: error.message } }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    
    console.error("[DIAG-STEP4] Invalid request:", {
      platform,
      action,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: { message: `Invalid request: Unknown platform '${platform}' or action '${action}'` } }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("[DIAG-STEP4] Error processing request:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
