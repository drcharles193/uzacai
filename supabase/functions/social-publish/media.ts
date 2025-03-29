
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
      
      // 1. INIT phase - Create a media ID and tell Twitter about the video
      console.log("INIT phase - creating media ID...");
      
      // Convert base64 to binary to get accurate size
      const binarySize = Math.ceil(mediaBase64.length * 0.75); // Approximate size of decoded base64
      
      // Create Authorization header for INIT
      const initAuthHeader = createTwitterAuthHeader(
        method,
        uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      
      // Build form data for INIT
      const formDataInit = new FormData();
      formDataInit.append('command', 'INIT');
      formDataInit.append('media_type', contentType);
      formDataInit.append('total_bytes', binarySize.toString());
      
      // Make INIT request
      const initResponse = await fetch(uploadUrl, {
        method: method,
        headers: {
          'Authorization': initAuthHeader,
        },
        body: formDataInit
      });
      
      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        console.error(`Twitter media upload INIT error: ${initResponse.status}`);
        console.error(`Error details: ${errorText}`);
        throw new Error(`Twitter INIT phase failed: ${errorText}`);
      }
      
      const initResponseData = await initResponse.json();
      mediaId = initResponseData.media_id_string;
      
      console.log(`INIT successful. Media ID: ${mediaId}`);
      
      // 2. APPEND phase - Upload the actual video data
      console.log("APPEND phase - uploading video data...");
      
      // Create chunks (Twitter recommends chunks of 5MB, but we'll use smaller ones)
      const chunkSize = 1000000; // ~1MB per chunk
      const totalChunks = Math.ceil(mediaBase64.length / chunkSize);
      
      console.log(`Uploading video in ${totalChunks} chunks`);
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, mediaBase64.length);
        const chunk = mediaBase64.substring(start, end);
        
        console.log(`Uploading chunk ${i + 1}/${totalChunks}`);
        
        // Create Authorization header for APPEND
        const appendAuthHeader = createTwitterAuthHeader(
          method,
          uploadUrl,
          apiKey,
          apiSecret,
          accessToken,
          accessTokenSecret
        );
        
        // Build form data for APPEND
        const formDataAppend = new FormData();
        formDataAppend.append('command', 'APPEND');
        formDataAppend.append('media_id', mediaId);
        formDataAppend.append('segment_index', i.toString());
        formDataAppend.append('media_data', chunk);
        
        // Make APPEND request
        const appendResponse = await fetch(uploadUrl, {
          method: method,
          headers: {
            'Authorization': appendAuthHeader,
          },
          body: formDataAppend
        });
        
        if (!appendResponse.ok) {
          const errorText = await appendResponse.text();
          console.error(`Twitter media upload APPEND error: ${appendResponse.status}`);
          console.error(`Error details: ${errorText}`);
          throw new Error(`Twitter APPEND phase failed at chunk ${i + 1}: ${errorText}`);
        }
        
        console.log(`Chunk ${i + 1} uploaded successfully`);
      }
      
      // 3. FINALIZE phase - Tell Twitter we're done uploading
      console.log("FINALIZE phase - completing upload...");
      
      // Create Authorization header for FINALIZE
      const finalizeAuthHeader = createTwitterAuthHeader(
        method,
        uploadUrl,
        apiKey,
        apiSecret,
        accessToken,
        accessTokenSecret
      );
      
      // Build form data for FINALIZE
      const formDataFinalize = new FormData();
      formDataFinalize.append('command', 'FINALIZE');
      formDataFinalize.append('media_id', mediaId);
      
      // Make FINALIZE request
      const finalizeResponse = await fetch(uploadUrl, {
        method: method,
        headers: {
          'Authorization': finalizeAuthHeader,
        },
        body: formDataFinalize
      });
      
      if (!finalizeResponse.ok) {
        const errorText = await finalizeResponse.text();
        console.error(`Twitter media upload FINALIZE error: ${finalizeResponse.status}`);
        console.error(`Error details: ${errorText}`);
        throw new Error(`Twitter FINALIZE phase failed: ${errorText}`);
      }
      
      const finalizeResponseData = await finalizeResponse.json();
      
      // 4. STATUS phase - Check if processing is needed (likely for videos)
      if (finalizeResponseData.processing_info) {
        console.log("STATUS phase - checking processing status...");
        
        let processingInfo = finalizeResponseData.processing_info;
        let checkAfterSecs = processingInfo.check_after_secs || 1;
        
        while (processingInfo && processingInfo.state !== 'succeeded') {
          if (processingInfo.state === 'failed') {
            console.error("Video processing failed:", processingInfo.error);
            throw new Error(`Twitter video processing failed: ${processingInfo.error.message}`);
          }
          
          console.log(`Video still processing. Waiting ${checkAfterSecs} seconds...`);
          
          // Wait for the recommended time
          await new Promise(resolve => setTimeout(resolve, checkAfterSecs * 1000));
          
          // Check status again
          const statusAuthHeader = createTwitterAuthHeader(
            'GET',
            `${uploadUrl}?command=STATUS&media_id=${mediaId}`,
            apiKey,
            apiSecret,
            accessToken,
            accessTokenSecret
          );
          
          const statusResponse = await fetch(`${uploadUrl}?command=STATUS&media_id=${mediaId}`, {
            method: 'GET',
            headers: {
              'Authorization': statusAuthHeader,
            }
          });
          
          if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            console.error(`Twitter media STATUS check error: ${statusResponse.status}`);
            console.error(`Error details: ${errorText}`);
            throw new Error(`Twitter STATUS check failed: ${errorText}`);
          }
          
          const statusData = await statusResponse.json();
          processingInfo = statusData.processing_info;
          checkAfterSecs = processingInfo ? (processingInfo.check_after_secs || 1) : 0;
          
          if (!processingInfo) {
            console.log("No more processing info. Assuming complete.");
            break;
          }
        }
        
        console.log("Video processing completed successfully");
      }
      
      console.log(`Successfully uploaded video to Twitter with ID: ${mediaId}`);
      
    } else {
      // Regular image upload process
      console.log("Image content detected, using standard upload process");
      
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
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`Twitter media upload API error: ${uploadResponse.status}`);
        console.error(`Error details: ${errorText}`);
        throw new Error(`Twitter image upload failed: ${errorText}`);
      }
      
      // Parse response data to get media id
      const uploadResponseData = await uploadResponse.json();
      mediaId = uploadResponseData.media_id_string;
      
      console.log(`Successfully uploaded image to Twitter with ID: ${mediaId}`);
    }
    
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
