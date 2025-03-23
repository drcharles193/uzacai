
import { createTwitterAuthHeader, getTwitterCredentials } from './twitter.ts';
import { isVideoContentType } from './utils.ts';

/**
 * Fetch an image from URL and convert to base64 for upload
 */
export async function getMediaAsBase64(mediaUrl: string): Promise<{base64: string, contentType: string}> {
  try {
    console.log(`Fetching media from URL: ${mediaUrl}`);
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    console.log(`Media content type: ${contentType}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return {base64, contentType};
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
}

/**
 * Upload media to Twitter
 */
export async function uploadMediaToTwitter(
  supabase: any,
  userId: string,
  mediaBase64: string,
  contentType: string
): Promise<string> {
  try {
    console.log(`Uploading media to Twitter with content type: ${contentType}`);
    
    // Get credentials
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = await getTwitterCredentials(supabase, userId);
    
    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error("Twitter API credentials are missing. Please check your environment variables.");
    }
    
    // Determine if this is a video
    const isVideo = isVideoContentType(contentType);
    let mediaId = '';
    
    // If this is a video, we need to use the chunked upload process
    if (isVideo) {
      console.log("Video content detected, using chunked upload process");
      
      // Set up Twitter API request for media upload
      const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
      const method = 'POST';
      
      // Create Authorization header for INIT
      const authHeaderInit = createTwitterAuthHeader(
        method,
        uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      
      // Prepare form data for INIT
      const formDataInit = new FormData();
      formDataInit.append('command', 'INIT');
      formDataInit.append('media_type', contentType);
      // Convert base64 to binary to get accurate size
      const mediaSize = Math.ceil(mediaBase64.length * 0.75); // Approximate size of decoded base64
      formDataInit.append('total_bytes', mediaSize.toString());
      
      // Make INIT request to Twitter
      const initResponse = await fetch(uploadUrl, {
        method: method,
        headers: {
          'Authorization': authHeaderInit,
        },
        body: formDataInit
      });
      
      const initResponseText = await initResponse.text();
      console.log(`Twitter media upload INIT response status: ${initResponse.status}`);
      console.log(`Twitter media upload INIT response body: ${initResponseText}`);
      
      if (!initResponse.ok) {
        throw new Error(`Twitter media upload INIT error: ${initResponse.status} - ${initResponseText}`);
      }
      
      // Parse response to get media_id
      const initResponseData = JSON.parse(initResponseText);
      mediaId = initResponseData.media_id_string;
      
      if (!mediaId) {
        throw new Error("Failed to retrieve media_id from Twitter API INIT response");
      }
      
      // Now APPEND the media data
      const authHeaderAppend = createTwitterAuthHeader(
        method,
        uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      
      // Prepare form data for APPEND
      const formDataAppend = new FormData();
      formDataAppend.append('command', 'APPEND');
      formDataAppend.append('media_id', mediaId);
      formDataAppend.append('media_data', mediaBase64);
      formDataAppend.append('segment_index', '0');
      
      // Make APPEND request to Twitter
      const appendResponse = await fetch(uploadUrl, {
        method: method,
        headers: {
          'Authorization': authHeaderAppend,
        },
        body: formDataAppend
      });
      
      const appendResponseText = await appendResponse.text();
      console.log(`Twitter media upload APPEND response status: ${appendResponse.status}`);
      console.log(`Twitter media upload APPEND response body: ${appendResponseText}`);
      
      if (!appendResponse.ok) {
        throw new Error(`Twitter media upload APPEND error: ${appendResponse.status} - ${appendResponseText}`);
      }
      
      // Finally, FINALIZE the upload
      const authHeaderFinalize = createTwitterAuthHeader(
        method,
        uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      
      // Prepare form data for FINALIZE
      const formDataFinalize = new FormData();
      formDataFinalize.append('command', 'FINALIZE');
      formDataFinalize.append('media_id', mediaId);
      
      // Make FINALIZE request to Twitter
      const finalizeResponse = await fetch(uploadUrl, {
        method: method,
        headers: {
          'Authorization': authHeaderFinalize,
        },
        body: formDataFinalize
      });
      
      const finalizeResponseText = await finalizeResponse.text();
      console.log(`Twitter media upload FINALIZE response status: ${finalizeResponse.status}`);
      console.log(`Twitter media upload FINALIZE response body: ${finalizeResponseText}`);
      
      if (!finalizeResponse.ok) {
        throw new Error(`Twitter media upload FINALIZE error: ${finalizeResponse.status} - ${finalizeResponseText}`);
      }
      
      // Parse response to confirm success
      const finalizeResponseData = JSON.parse(finalizeResponseText);
      
      if (finalizeResponseData.processing_info) {
        console.log("Media is being processed by Twitter:", finalizeResponseData.processing_info);
      }
      
    } else {
      // Regular image upload process
      // Set up Twitter API request for media upload
      const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
      const method = 'POST';
      
      // Create Authorization header
      const authHeader = createTwitterAuthHeader(
        method,
        uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      
      // Prepare form data with base64 encoded media
      const formData = new FormData();
      formData.append('media_data', mediaBase64);
      
      // Make API request to Twitter for media upload
      const uploadResponse = await fetch(uploadUrl, {
        method: method,
        headers: {
          'Authorization': authHeader,
        },
        body: formData
      });
      
      const uploadResponseText = await uploadResponse.text();
      console.log(`Twitter media upload API response status: ${uploadResponse.status}`);
      
      if (!uploadResponse.ok) {
        throw new Error(`Twitter media upload API error: ${uploadResponse.status} - ${uploadResponseText}`);
      }
      
      // Parse response data to get media id
      const uploadResponseData = JSON.parse(uploadResponseText);
      mediaId = uploadResponseData.media_id_string;
      
      if (!mediaId) {
        throw new Error("Failed to retrieve media_id from Twitter API response");
      }
    }
    
    console.log(`Successfully uploaded media to Twitter with ID: ${mediaId}`);
    return mediaId;
  } catch (error: any) {
    console.error('Error uploading media to Twitter:', error);
    throw error;
  }
}

/**
 * Process media from blob URL or remote URL and upload to Twitter
 */
export async function processAndUploadMedia(supabase: any, userId: string, mediaUrl: string): Promise<string> {
  try {
    console.log(`Processing media at URL: ${mediaUrl}`);
    
    // Determine if the media URL is a blob URL or a remote URL
    if (mediaUrl.startsWith('blob:')) {
      throw new Error('Blob URLs cannot be processed directly in edge functions. Media must be sent as base64 or remote URLs.');
    }
    
    // For regular URLs, fetch the media and convert to base64
    const { base64, contentType } = await getMediaAsBase64(mediaUrl);
    
    // Upload the media to Twitter
    return await uploadMediaToTwitter(supabase, userId, base64, contentType);
  } catch (error: any) {
    console.error('Error processing and uploading media:', error);
    throw error;
  }
}
