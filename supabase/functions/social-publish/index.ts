
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function publishToTwitter(userId: string, content: string): Promise<any> {
  try {
    console.log(`Publishing to Twitter for user ${userId}`);
    
    // Get the Twitter account credentials for this user
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'twitter')
      .single();
    
    if (error) {
      console.error(`Error fetching Twitter account: ${error.message}`);
      throw new Error(`Error fetching Twitter account: ${error.message}`);
    }
    
    if (!accounts) {
      console.error('No Twitter account found for this user');
      throw new Error('No Twitter account found for this user');
    }
    
    console.log(`Found Twitter account: ${accounts.account_name}`);
    
    // Use the access token to make the API request
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accounts.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: content })
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Twitter API response:', response.status, responseText);
      throw new Error(`Twitter API error: ${response.status} - ${responseText}`);
    }
    
    const responseData = await response.json();
    console.log('Twitter API response data:', JSON.stringify(responseData));
    
    // Update the last_used_at timestamp for this account
    await supabase
      .from('social_accounts')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', accounts.id);
    
    return responseData;
  } catch (error) {
    console.error('Error publishing to Twitter:', error);
    throw error;
  }
}

// Mock function for other platforms
function mockPublishToOtherPlatform(platform: string, content: string): any {
  console.log(`Mock publishing to ${platform}: ${content.substring(0, 20)}...`);
  return {
    success: true,
    platform,
    id: `mock-post-${Math.random().toString(36).substring(2, 15)}`,
    message: `Posted to ${platform} successfully`
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Received publish request');
  
  try {
    const { userId, content, mediaUrls, selectedAccounts, platforms } = await req.json();
    console.log(`Publishing post for user ${userId} to platforms:`, platforms);
    console.log(`Content to publish: ${content.substring(0, 30)}...`);
    
    if (!userId || !content || !selectedAccounts || selectedAccounts.length === 0) {
      console.error("Missing required fields", { userId, contentLength: content?.length, selectedAccounts });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const results = [];
    const errors = [];
    
    // Publish to each platform
    for (const platform of platforms) {
      try {
        console.log(`Attempting to publish to ${platform}`);
        let result;
        
        if (platform === 'twitter') {
          result = await publishToTwitter(userId, content);
        } else {
          result = mockPublishToOtherPlatform(platform, content);
        }
        
        results.push({
          platform,
          success: true,
          result
        });
        console.log(`Successfully published to ${platform}`);
      } catch (error: any) {
        console.error(`Error publishing to ${platform}:`, error);
        errors.push({
          platform,
          error: error.message
        });
      }
    }
    
    // If we have any successful posts but some errors, we'll still return a 200
    // but include the errors in the response
    const hasSuccesses = results.length > 0;
    const hasErrors = errors.length > 0;
    const status = hasSuccesses ? 200 : (hasErrors ? 500 : 200);
    
    console.log(`Returning response with status ${status}`);
    
    return new Response(
      JSON.stringify({ 
        success: hasSuccesses,
        results,
        errors: hasErrors ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status
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
