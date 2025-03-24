
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate a random string for OAuth state
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Handle mock connections for platforms
function getMockPlatformResponse(platform: string) {
  // Simulate different platform responses
  switch(platform) {
    case 'facebook':
      return {
        success: true,
        platformId: `fb-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Facebook Page",
        accountType: "page",
        accessToken: "mock-fb-access-token",
        refreshToken: "mock-fb-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60).toISOString() // 60 days
      };
    case 'instagram':
      return {
        success: true,
        platformId: `ig-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Instagram Business",
        accountType: "business",
        accessToken: "mock-ig-access-token",
        refreshToken: "mock-ig-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60).toISOString() // 60 days
      };
    case 'twitter':
      return {
        success: true,
        platformId: `tw-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Twitter Profile",
        accountType: "profile",
        accessToken: "mock-tw-access-token",
        refreshToken: "mock-tw-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 7).toISOString() // 7 days
      };
    case 'linkedin':
      return {
        success: true,
        platformId: `li-${Math.floor(Math.random() * 1000000)}`,
        accountName: "LinkedIn Profile",
        accountType: "personal",
        accessToken: "mock-li-access-token",
        refreshToken: "mock-li-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 60).toISOString() // 60 days
      };
    case 'youtube':
      return {
        success: true,
        platformId: `yt-${Math.floor(Math.random() * 1000000)}`,
        accountName: "YouTube Channel",
        accountType: "channel",
        accessToken: "mock-yt-access-token",
        refreshToken: "mock-yt-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString() // 30 days
      };
    case 'pinterest':
      return {
        success: true,
        platformId: `pin-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Pinterest Business",
        accountType: "business",
        accessToken: "mock-pin-access-token",
        refreshToken: "mock-pin-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 365).toISOString() // 365 days
      };
    case 'tiktok':
      return {
        success: true,
        platformId: `tt-${Math.floor(Math.random() * 1000000)}`,
        accountName: "TikTok Creator",
        accountType: "creator",
        accessToken: "mock-tt-access-token",
        refreshToken: "mock-tt-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 15).toISOString() // 15 days
      };
    case 'threads':
      return {
        success: true,
        platformId: `th-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Threads Profile",
        accountType: "profile",
        accessToken: "mock-th-access-token",
        refreshToken: "mock-th-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 90).toISOString() // 90 days
      };
    case 'bluesky':
      return {
        success: true,
        platformId: `bs-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Bluesky Account",
        accountType: "personal",
        accessToken: "mock-bs-access-token",
        refreshToken: null, // Bluesky uses a different auth mechanism
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 365).toISOString() // Long-lived token
      };
    case 'tumblr':
      return {
        success: true,
        platformId: `tm-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Tumblr Blog",
        accountType: "blog",
        accessToken: "mock-tm-access-token",
        refreshToken: "mock-tm-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString() // 30 days
      };
    default:
      return {
        success: true,
        platformId: `generic-${Math.floor(Math.random() * 1000000)}`,
        accountName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        accountType: "personal",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour
      };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, userId } = await req.json();
    console.log(`Received auth request for platform: ${platform}, userId: ${userId}`);
    
    // For all platforms, use mock connections
    const result = getMockPlatformResponse(platform);
    
    // Add a slight delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Store the connection in the database
    const { data, error } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: userId,
        platform: platform,
        platform_account_id: result.platformId,
        account_name: result.accountName,
        account_type: result.accountType,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        token_expires_at: result.expiresAt,
        last_used_at: new Date().toISOString(),
        metadata: { connection_type: "mock" }
      }, {
        onConflict: 'user_id, platform, platform_account_id',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error("Error storing social connection:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Log success for debugging
    console.log(`Successfully connected ${platform} account: ${result.accountName}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        platform, 
        accountName: result.accountName,
        accountType: result.accountType
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
