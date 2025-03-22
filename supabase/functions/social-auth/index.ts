
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { supabase } from "./supabaseClient.ts";
import { getMockPlatformResponse } from "./mockPlatforms.ts";
import { 
  handleTwitterAuthUrl, 
  handleTwitterCallback 
} from "./twitter.ts";
import { 
  handleFacebookAuthUrl, 
  handleFacebookCallback 
} from "./facebook.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, code, userId, action, state } = await req.json();
    console.log(`Received auth request for platform: ${platform}, action: ${action}, userId: ${userId}`);
    
    // Handle Twitter OAuth flow
    if (platform === 'twitter') {
      if (action === 'auth-url') {
        return await handleTwitterAuthUrl(userId);
      } 
      else if (action === 'callback') {
        return await handleTwitterCallback(code, userId);
      } 
      else {
        return new Response(
          JSON.stringify({ error: "Invalid Twitter action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    } 
    // Handle Facebook OAuth flow
    else if (platform === 'facebook') {
      if (action === 'auth-url') {
        return await handleFacebookAuthUrl(userId);
      } 
      else if (action === 'callback') {
        return await handleFacebookCallback(code, userId);
      } 
      else {
        return new Response(
          JSON.stringify({ error: "Invalid Facebook action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    } 
    else {
      // For other platforms, continue with mock connections
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
          metadata: { connection_type: "oauth" }
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
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
