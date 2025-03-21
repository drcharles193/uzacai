
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user ID from the request
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Delete user data from various tables
    // This ensures all user data is removed before deleting the user account
    
    // Delete from post_drafts
    const { error: draftsError } = await supabase
      .from('post_drafts')
      .delete()
      .eq('user_id', user_id);
      
    if (draftsError) {
      console.error('Error deleting post drafts:', draftsError);
    }
    
    // Delete from scheduled_posts
    const { error: postsError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('user_id', user_id);
      
    if (postsError) {
      console.error('Error deleting scheduled posts:', postsError);
    }
    
    // Delete from social_accounts
    const { error: accountsError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('user_id', user_id);
      
    if (accountsError) {
      console.error('Error deleting social accounts:', accountsError);
    }
    
    // Finally, delete the user account
    const { error: userError } = await supabase.auth.admin.deleteUser(user_id);
    
    if (userError) {
      console.error('Error deleting user:', userError);
      throw userError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User account and all associated data deleted successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in delete-user function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete user account' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
