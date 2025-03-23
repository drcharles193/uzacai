
import { updateLastUsedTimestamp } from './utils.ts';

/**
 * Get LinkedIn credentials for a user
 */
export async function getLinkedInCredentials(supabase: any, userId: string): Promise<any> {
  try {
    // Get the LinkedIn credentials from the social_accounts table
    const { data, error } = await supabase
      .from('social_accounts')
      .select('access_token, refresh_token, platform_account_id')
      .eq('user_id', userId)
      .eq('platform', 'linkedin')
      .single();
    
    if (error) {
      console.error("Error fetching LinkedIn credentials:", error);
      throw new Error(`LinkedIn credentials not found: ${error.message}`);
    }
    
    // Get the client ID and client secret from environment variables
    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("LinkedIn API credentials are missing. Please check your environment variables.");
    }
    
    return {
      clientId,
      clientSecret,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      platformAccountId: data.platform_account_id
    };
  } catch (error) {
    console.error("Error in getLinkedInCredentials:", error);
    throw error;
  }
}

/**
 * Publish content to LinkedIn
 */
export async function publishToLinkedIn(
  supabase: any,
  userId: string,
  content: string,
  mediaUrls: string[] = [],
  base64Media: string[] = [],
  contentTypes: string[] = []
): Promise<any> {
  try {
    console.log(`Publishing to LinkedIn for user ${userId} with ${mediaUrls.length} media URLs and ${base64Media.length} base64 media items`);
    
    // Get credentials
    const { accessToken, platformAccountId } = await getLinkedInCredentials(supabase, userId);
    
    if (!accessToken) {
      throw new Error("LinkedIn access token is missing. Please reconnect your LinkedIn account.");
    }
    
    // LinkedIn API endpoints
    // Use the actual platform account ID if available, or fall back to 'me'
    const personId = platformAccountId || "me"; 
    const apiUrl = `https://api.linkedin.com/v2/ugcPosts`;
    
    // Prepare the post content
    const postData: any = {
      author: `urn:li:person:${personId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };
    
    // Add media if available
    if (mediaUrls.length > 0 || base64Media.length > 0) {
      console.log("Adding media to LinkedIn post");
      
      // LinkedIn requires media to be uploaded separately and referenced
      // For now, we'll just update the content type to indicate media
      // In a full implementation, you'd need to use LinkedIn's media upload APIs
      
      postData.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "ARTICLE";
      
      // Note: A full implementation would handle media uploads properly
      // This would require additional API calls to LinkedIn's media endpoints
    }
    
    console.log("LinkedIn API request body:", JSON.stringify(postData));
    
    // Make API request to LinkedIn
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`LinkedIn API error: ${response.status} - ${responseText}`);
      throw new Error(`LinkedIn API error: ${response.status} - ${responseText}`);
    }
    
    const responseData = await response.json();
    console.log("LinkedIn API response:", JSON.stringify(responseData));
    
    // Update last_used_at timestamp
    await updateLastUsedTimestamp(supabase, userId, 'linkedin');
    
    return responseData;
  } catch (error) {
    console.error("Error publishing to LinkedIn:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
