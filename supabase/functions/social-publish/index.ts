
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { createHmac } from "https://deno.land/std@0.119.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Twitter API credentials
const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID");
const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET");

async function publishToTwitter(userId: string, content: string): Promise<any> {
  try {
    // Get the Twitter account credentials for this user
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'twitter')
      .single();
    
    if (error) {
      throw new Error(`Error fetching Twitter account: ${error.message}`);
    }
    
    if (!accounts) {
      throw new Error('No Twitter account found for this user');
    }
    
    // Use the access token to make the API request
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accounts.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: content })
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Twitter API error:', responseData);
      throw new Error(`Twitter API error: ${JSON.stringify(responseData)}`);
    }
    
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

  try {
    const { userId, content, mediaUrls, selectedAccounts, platforms } = await req.json();
    console.log(`Publishing post for user ${userId} to platforms:`, platforms);
    
    if (!userId || !content || !selectedAccounts || selectedAccounts.length === 0) {
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
    const status = results.length > 0 ? 200 : (errors.length > 0 ? 500 : 200);
    
    return new Response(
      JSON.stringify({ 
        success: results.length > 0,
        results,
        errors: errors.length > 0 ? errors : undefined
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
