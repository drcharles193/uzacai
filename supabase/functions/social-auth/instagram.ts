
// Instagram OAuth helpers

// Instagram OAuth credentials
const INSTAGRAM_CLIENT_ID = Deno.env.get("INSTAGRAM_CLIENT_ID") || "";
const INSTAGRAM_CLIENT_SECRET = Deno.env.get("INSTAGRAM_CLIENT_SECRET") || "";
const INSTAGRAM_REDIRECT_URI = Deno.env.get("INSTAGRAM_REDIRECT_URI") || "https://uzacai.com/instagram-callback.html";

// Generate a random string for Instagram OAuth state
export function generateInstagramState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Instagram OAuth URL generator
export function getInstagramAuthUrl() {
  console.log("Instagram Client ID:", INSTAGRAM_CLIENT_ID ? "Exists" : "Missing");
  console.log("Instagram Redirect URI:", INSTAGRAM_REDIRECT_URI ? "Exists" : "Missing");
  
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  const state = generateInstagramState();
  
  // Define the granted scopes - Instagram Basic Display API
  const scope = 'user_profile,user_media';
  
  // Construct the Instagram authorization URL
  const url = new URL('https://api.instagram.com/oauth/authorize');
  url.searchParams.append('client_id', INSTAGRAM_CLIENT_ID);
  url.searchParams.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
  url.searchParams.append('scope', scope);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('state', state);
  
  return { url: url.toString(), state };
}

// Instagram token exchange function
export async function exchangeInstagramCode(code: string) {
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET || !INSTAGRAM_REDIRECT_URI) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  const tokenUrl = 'https://api.instagram.com/oauth/access_token';
  
  // Use FormData for Instagram API which expects form data
  const formData = new FormData();
  formData.append('client_id', INSTAGRAM_CLIENT_ID);
  formData.append('client_secret', INSTAGRAM_CLIENT_SECRET);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
  formData.append('code', code);
  
  try {
    console.log("Exchanging Instagram code for token...");
    
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
export async function getInstagramUserProfile(accessToken: string, userId: string) {
  try {
    const fields = 'id,username,account_type,media_count';
    const url = `https://graph.instagram.com/v19.0/${userId}?fields=${fields}&access_token=${accessToken}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Instagram user profile error:', errorText);
      throw new Error(`Instagram API error: ${response.status} ${errorText}`);
    }
    
    const userData = await response.json();
    
    // Get profile picture (requires additional endpoint)
    let profileImageUrl = null;
    try {
      const mediaResponse = await fetch(`https://graph.instagram.com/v19.0/${userId}/media?fields=id,media_type,media_url&limit=1&access_token=${accessToken}`);
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        if (mediaData.data && mediaData.data.length > 0) {
          profileImageUrl = mediaData.data[0].media_url;
        }
      }
    } catch (err) {
      console.error('Error fetching Instagram profile image:', err);
    }
    
    return {
      id: userData.id,
      name: userData.username,
      username: userData.username,
      accountType: userData.account_type,
      mediaCount: userData.media_count,
      profileImageUrl
    };
  } catch (error) {
    console.error('Error fetching Instagram user profile:', error);
    throw error;
  }
}

// Get Instagram long-lived token
export async function getInstagramLongLivedToken(shortLivedToken: string) {
  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
    throw new Error("Instagram OAuth credentials not configured");
  }
  
  try {
    const url = new URL('https://graph.instagram.com/access_token');
    url.searchParams.append('grant_type', 'ig_exchange_token');
    url.searchParams.append('client_secret', INSTAGRAM_CLIENT_SECRET);
    url.searchParams.append('access_token', shortLivedToken);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Instagram long-lived token error:', errorText);
      throw new Error(`Instagram API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error exchanging for long-lived Instagram token:', error);
    throw error;
  }
}
