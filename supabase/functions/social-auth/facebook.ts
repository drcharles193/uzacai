
// Facebook OAuth helpers

// Facebook OAuth credentials
const FACEBOOK_CLIENT_ID = Deno.env.get("FACEBOOK_CLIENT_ID") || "";
const FACEBOOK_CLIENT_SECRET = Deno.env.get("FACEBOOK_CLIENT_SECRET") || "";
const FACEBOOK_REDIRECT_URI = Deno.env.get("FACEBOOK_REDIRECT_URI") || "https://uzacai.com/facebook-callback.html";

// Generate a random string for Facebook OAuth state
export function generateFacebookState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Facebook OAuth URL generator
export function getFacebookAuthUrl() {
  console.log("Facebook Client ID:", FACEBOOK_CLIENT_ID ? "Exists" : "Missing");
  console.log("Facebook Redirect URI:", FACEBOOK_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook OAuth credentials not configured");
  }
  
  const state = generateFacebookState();
  
  // Define the granted scopes
  // See: https://developers.facebook.com/docs/facebook-login/permissions
  const scope = 'email,public_profile,pages_show_list,pages_read_engagement,pages_manage_posts';
  
  // Construct the Facebook authorization URL
  const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
  url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
  url.searchParams.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', scope);
  url.searchParams.append('response_type', 'code');
  
  return { url: url.toString(), state };
}

// Facebook token exchange function
export async function exchangeFacebookCode(code: string) {
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET || !FACEBOOK_REDIRECT_URI) {
    throw new Error("Facebook OAuth credentials not configured");
  }
  
  const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
  
  const params = new URLSearchParams();
  params.append('client_id', FACEBOOK_CLIENT_ID);
  params.append('client_secret', FACEBOOK_CLIENT_SECRET);
  params.append('redirect_uri', FACEBOOK_REDIRECT_URI);
  params.append('code', code);
  
  try {
    console.log("Exchanging Facebook code for token...");
    
    const response = await fetch(`${tokenUrl}?${params.toString()}`);
    
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
export async function getFacebookUserProfile(accessToken: string) {
  try {
    // Fields to retrieve from the Graph API
    const fields = 'id,name,email,picture.width(200).height(200)';
    
    const response = await fetch(`https://graph.facebook.com/v19.0/me?fields=${fields}&access_token=${accessToken}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook user profile error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${errorText}`);
    }
    
    const userData = await response.json();
    
    // Get user's pages (for posting to pages)
    let pages = [];
    try {
      const pagesResponse = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`);
      if (pagesResponse.ok) {
        const pagesData = await pagesResponse.json();
        pages = pagesData.data || [];
      }
    } catch (err) {
      console.error('Error fetching Facebook pages:', err);
    }
    
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email || null,
      profileImageUrl: userData.picture?.data?.url || null,
      pages: pages
    };
  } catch (error) {
    console.error('Error fetching Facebook user profile:', error);
    throw error;
  }
}

// Get Facebook long-lived token
export async function getFacebookLongLivedToken(shortLivedToken: string) {
  if (!FACEBOOK_CLIENT_ID || !FACEBOOK_CLIENT_SECRET) {
    throw new Error("Facebook OAuth credentials not configured");
  }
  
  try {
    const url = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    url.searchParams.append('grant_type', 'fb_exchange_token');
    url.searchParams.append('client_id', FACEBOOK_CLIENT_ID);
    url.searchParams.append('client_secret', FACEBOOK_CLIENT_SECRET);
    url.searchParams.append('fb_exchange_token', shortLivedToken);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Facebook long-lived token error:', errorText);
      throw new Error(`Facebook API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exchanging for long-lived token:', error);
    throw error;
  }
}
