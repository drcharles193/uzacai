
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
    const { userId, provider } = await req.json();
    console.log(`Processing disconnect request for user: ${userId}, provider: ${provider}`);
    
    if (!userId || !provider) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: userId and provider" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Get the user's current identities
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !user) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 2. Check if the user has the specified provider connected
    if (!user.identities || user.identities.length === 0) {
      return new Response(
        JSON.stringify({ error: "No connected identities found for user" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const hasProvider = user.identities.some(identity => identity.provider === provider);
    if (!hasProvider) {
      return new Response(
        JSON.stringify({ error: `User does not have a connected ${provider} account` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 3. Check if the user has other identities (to prevent account lockout)
    const otherIdentities = user.identities.filter(identity => identity.provider !== provider);
    const hasEmailIdentity = user.identities.some(identity => identity.provider === 'email');
    
    if (otherIdentities.length === 0 && !hasEmailIdentity) {
      return new Response(
        JSON.stringify({ 
          error: "Cannot disconnect the only identity. Add another authentication method first." 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 4. Delete the related social account record
    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('platform', provider);

    if (deleteError) {
      console.error("Error deleting social account record:", deleteError);
      // Continue anyway as this is just a linked record
    }

    // 5. Unlink the identity from the user's account
    const { error: unlinkError } = await supabase.auth.admin.unlinkIdentity({
      id: userId,
      identityId: user.identities.find(identity => identity.provider === provider)?.id || '',
      provider,
    });

    if (unlinkError) {
      console.error("Error unlinking identity:", unlinkError);
      return new Response(
        JSON.stringify({ error: `Failed to disconnect ${provider} account: ${unlinkError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Successfully disconnected ${provider} account for user: ${userId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected successfully` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing disconnect request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
