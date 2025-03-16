
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, code, userId } = await req.json();
    console.log(`Received auth request for platform: ${platform}, userId: ${userId}`);
    
    // In a real implementation, this would handle the OAuth flow for each platform
    // For now, we'll simulate a successful connection
    
    // Platforms would each have their own OAuth implementation here
    let result = {
      success: true,
      platformId: `mock-${platform}-id-${Math.floor(Math.random() * 1000)}`,
      accountName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
      accountType: "personal",
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour from now
    };
    
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
        metadata: {}
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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        platform, 
        accountName: result.accountName
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
