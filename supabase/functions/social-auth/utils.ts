
// Cross-Origin Resource Sharing (CORS) headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validate the request parameters for social auth
 */
export function validateRequest(userId: string, content?: string, selectedAccounts?: string[]): boolean {
  if (!userId) {
    console.log("Invalid request: Missing userId");
    return false;
  }
  
  return true;
}

/**
 * Process media URLs and base64 data
 */
export async function processBlobMediaUrls(
  mediaUrls: string[],
  mediaBase64: string[],
  contentTypes: string[]
): Promise<{ urls: string[], base64: string[], contentTypes: string[] }> {
  const validUrls: string[] = [];
  const validBase64: string[] = [];
  const validContentTypes: string[] = [];
  
  // Process URLs
  for (const url of mediaUrls) {
    if (url && url.trim() !== '') {
      validUrls.push(url);
    }
  }
  
  // Process base64 data with corresponding content types
  for (let i = 0; i < mediaBase64.length; i++) {
    if (mediaBase64[i] && mediaBase64[i].trim() !== '') {
      validBase64.push(mediaBase64[i]);
      
      // Add corresponding content type if available
      const contentType = i < contentTypes.length ? contentTypes[i] : 'image/jpeg';
      validContentTypes.push(contentType);
    }
  }
  
  console.log(`Processed ${validUrls.length} valid URLs and ${validBase64.length} base64 media items`);
  
  return {
    urls: validUrls,
    base64: validBase64,
    contentTypes: validContentTypes
  };
}
