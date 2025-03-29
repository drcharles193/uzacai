
import { corsHeaders } from './utils.ts';

/**
 * Publish a post to Facebook
 */
export async function publishToFacebook(
  userId: string,
  accessToken: string,
  content: string,
  mediaUrls: string[],
  mediaBase64: string[],
  contentTypes: string[]
): Promise<any> {
  console.log(`Publishing to Facebook for user ${userId} with ${mediaUrls.length} media URLs and ${mediaBase64.length} base64 media items`);

  try {
    // Get Facebook user ID first
    const meResponse = await fetch('https://graph.facebook.com/v17.0/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!meResponse.ok) {
      const errorBody = await meResponse.text();
      console.error(`Facebook profile fetch error: ${meResponse.status} - ${errorBody}`);
      throw new Error(`Facebook API error: ${meResponse.status} - ${errorBody}`);
    }

    const meData = await meResponse.json();
    const facebookUserId = meData.id;
    console.log(`Posting to Facebook profile with ID: ${facebookUserId}`);

    // Check permissions to ensure we can post
    const permissionsResponse = await fetch(`https://graph.facebook.com/v17.0/${facebookUserId}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!permissionsResponse.ok) {
      const errorBody = await permissionsResponse.text();
      console.error(`Facebook permissions fetch error: ${permissionsResponse.status} - ${errorBody}`);
      throw new Error(`Facebook API error: ${permissionsResponse.status} - ${errorBody}`);
    }

    const permissionsData = await permissionsResponse.json();
    const hasPublishPermission = permissionsData.data.some(
      (perm: any) => (perm.permission === 'publish_actions' || 
                      perm.permission === 'publish_to_groups' || 
                      perm.permission === 'pages_manage_posts') && 
                      perm.status === 'granted'
    );

    if (!hasPublishPermission) {
      throw new Error('Missing required Facebook permissions to publish posts. Please reconnect your Facebook account with publishing permissions.');
    }

    // Create FormData for the post
    const formData = new FormData();
    formData.append('message', content);

    // Publish to Facebook feed
    const response = await fetch(`https://graph.facebook.com/v17.0/${facebookUserId}/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    const responseBody = await response.text();
    console.log(`Facebook API response status: ${response.status}`);
    console.log(`Facebook API response body: ${responseBody}`);

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} - ${responseBody}`);
    }

    // Parse the response for post ID
    let responseData;
    try {
      responseData = JSON.parse(responseBody);
    } catch (e) {
      console.error("Error parsing Facebook response:", e);
      responseData = { id: "unknown" };
    }

    return {
      success: true,
      postId: responseData.id,
      platform: 'facebook',
      url: `https://www.facebook.com/${responseData.id}`
    };
  } catch (error) {
    console.error("Error publishing to Facebook:", error);
    throw error;
  }
}
