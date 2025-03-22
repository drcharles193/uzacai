
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, provider } = await req.json();
    
    if (!userId || !provider) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters: userId and provider are required"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if this is the only identity (to prevent account lockout)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      userId
    );

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: userError?.message || "User not found" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const identities = userData.user.identities || [];
    
    // Check if we're trying to remove the only identity
    if (identities.length <= 1) {
      return new Response(
        JSON.stringify({
          error: "Cannot disconnect the only login method. Please add another login method first."
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Find the identity we want to disconnect
    const identityToRemove = identities.find(identity => identity.provider === provider);
    
    if (!identityToRemove) {
      return new Response(
        JSON.stringify({ error: `No ${provider} identity found for this user` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // First, remove the social account from the social_accounts table if it exists
    const { error: deleteError } = await supabaseAdmin
      .from('social_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('platform', provider);

    if (deleteError) {
      console.warn("Error deleting social account record:", deleteError);
      // Continue anyway, as this might not exist
    }

    // Unlink the identity
    const { error: unlinkError } = await supabaseAdmin.auth.admin.unlinkIdentity(
      userId,
      {
        provider: provider,
        id: identityToRemove.id
      }
    );

    if (unlinkError) {
      return new Response(
        JSON.stringify({ error: unlinkError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully disconnected ${provider} account`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in disconnect-social function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
