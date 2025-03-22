
import { supabase } from "./supabaseClient.ts";
import { generateState, storeOAuthState } from "./utils.ts";
import { corsHeaders } from "./corsHeaders.ts";

// Facebook API credentials
const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID");
const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET");
const FACEBOOK_REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI");

// Facebook OAuth URL generator
export function getFacebookAuthUrl() {
  if (!FACEBOOK_APP_ID || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook API credentials not configured");
  }
  
  const state = generateState();
  
  // Simplifying to just basic permissions needed for posting
  const permissions = [
    'public_profile',
    'email',
    'pages_manage_posts'
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
export async function exchangeFacebookCode(code: string) {
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
export async function getFacebookUserData(accessToken: string) {
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

// Handle Facebook auth URL request
export async function handleFacebookAuthUrl(userId: string) {
  try {
    const { url, state } = getFacebookAuthUrl();
    
    // Store the state temporarily
    await storeOAuthState(supabase, userId, 'facebook', state);
    
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

// Handle Facebook callback
export async function handleFacebookCallback(code: string, userId: string) {
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
