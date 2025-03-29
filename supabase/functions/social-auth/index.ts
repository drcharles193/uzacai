import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, validateRequest, processBlobMediaUrls } from './utils.ts';
import { validateTwitterCredentials } from './twitter.ts';
import { publishToPlatform } from './publisher.ts';
import { PublishingRequest } from './types.ts';

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Main handler for the edge function
 */
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received publish request');
  
  try {
    const { userId, content, mediaUrls, mediaBase64, contentTypes, selectedAccounts, platforms } = await req.json() as PublishingRequest & { contentTypes?: string[] };
    console.log(`Publishing post for user ${userId} to platforms:`, platforms);
    console.log(`Content to publish: ${content.substring(0, 30)}...`);
    console.log(`Media URLs:`, mediaUrls);
    console.log(`Base64 Media count:`, mediaBase64?.length || 0);
    console.log(`Content Types:`, contentTypes);
    
    // Validate request parameters
    if (!validateRequest(userId, content, selectedAccounts)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate Twitter credentials are available
    if (platforms.includes('twitter') && !validateTwitterCredentials()) {
      return new Response(
        JSON.stringify({ error: "Twitter API credentials are not configured correctly" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Process the media URLs and base64 data
    const processedMedia = await processBlobMediaUrls(mediaUrls || [], mediaBase64 || [], contentTypes || []);
    
    // Process publishing for each platform
    const publishingPromises = platforms.map(platform => 
      publishToPlatform(supabase, platform, userId, content, processedMedia.urls, processedMedia.base64, processedMedia.contentTypes)
    );
    
    const publishingResults = await Promise.all(publishingPromises);
    
    // Separate successes and errors
    const results = publishingResults.filter(result => result.success);
    const errors = publishingResults.filter(result => !result.success);
    
    const hasSuccesses = results.length > 0;
    const hasErrors = errors.length > 0;
    
    console.log(`Returning response with ${results.length} successes and ${errors.length} errors`);
    
    // If we have a mix of successes and failures, or all failures but with different errors,
    // return a 207 Multi-Status response
    const responseStatus = hasSuccesses ? (hasErrors ? 207 : 200) : 500;
    
    return new Response(
      JSON.stringify({ 
        success: hasSuccesses,
        results,
        errors: hasErrors ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: responseStatus
      }
    );
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
