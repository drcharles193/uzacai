
// LinkedIn OAuth helpers

// LinkedIn OAuth credentials
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID") || "86il41vffcs6hm";
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET") || "WPL_AP1.27DZkvXv6uwdgE5q.htR06Q==";
const LINKEDIN_CALLBACK_URL = Deno.env.get("LINKEDIN_REDIRECT_URL") || "https://uzacai.com/linkedin-callback.html";

// Generate a random string for LinkedIn OAuth state
export function generateLinkedInState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// LinkedIn OAuth URL generator
export function getLinkedInAuthUrl() {
  console.log("LinkedIn Client ID:", LINKEDIN_CLIENT_ID ? "Exists" : "Missing");
  console.log("LinkedIn Callback URL:", LINKEDIN_CALLBACK_URL ? "Exists" : "Missing");
  
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CALLBACK_URL) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  const state = generateLinkedInState();
  
  // Define the granted scopes
  const scope = 'r_liteprofile r_emailaddress w_member_social';
  
  // Construct the LinkedIn authorization URL
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', LINKEDIN_CLIENT_ID);
  url.searchParams.append('redirect_uri', LINKEDIN_CALLBACK_URL);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', scope);
  
  return { url: url.toString(), state };
}

// LinkedIn token exchange function
export async function exchangeLinkedInCode(code: string) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !LINKEDIN_CALLBACK_URL) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', LINKEDIN_CALLBACK_URL);
  params.append('client_id', LINKEDIN_CLIENT_ID);
  params.append('client_secret', LINKEDIN_CLIENT_SECRET);
  
  try {
    console.log("Exchanging LinkedIn code for token...");
    
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
export async function getLinkedInUserProfile(accessToken: string) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))', {
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
    
    // Get the user's email address
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!emailResponse.ok) {
      console.error('LinkedIn email fetch error:', await emailResponse.text());
      // Continue even if email fetch fails
    } else {
      const emailData = await emailResponse.json();
      if (emailData.elements && emailData.elements.length > 0) {
        const email = emailData.elements[0]["handle~"]?.emailAddress;
        if (email) {
          userData.email = email;
        }
      }
    }
    
    return {
      id: userData.id,
      name: `${userData.localizedFirstName} ${userData.localizedLastName}`,
      firstName: userData.localizedFirstName,
      lastName: userData.localizedLastName,
      email: userData.email || null,
      profileImageUrl: extractProfileImage(userData)
    };
  } catch (error) {
    console.error('Error fetching LinkedIn user profile:', error);
    throw error;
  }
}

// Helper to extract profile image from LinkedIn API response
function extractProfileImage(userData: any): string | null {
  try {
    if (userData.profilePicture && 
        userData.profilePicture["displayImage~"] && 
        userData.profilePicture["displayImage~"].elements && 
        userData.profilePicture["displayImage~"].elements.length > 0) {
      // Get the largest image available
      const elements = userData.profilePicture["displayImage~"].elements;
      const sortedElements = [...elements].sort((a, b) => 
        (b.data.width * b.data.height) - (a.data.width * a.data.height));
      
      if (sortedElements[0] && sortedElements[0].identifiers && sortedElements[0].identifiers[0]) {
        return sortedElements[0].identifiers[0].identifier;
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting LinkedIn profile image:", error);
    return null;
  }
}
