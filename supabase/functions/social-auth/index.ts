
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Get environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const LINKEDIN_CLIENT_ID = Deno.env.get('LINKEDIN_CLIENT_ID') || '';
const LINKEDIN_CLIENT_SECRET = Deno.env.get('LINKEDIN_CLIENT_SECRET') || '';

// LinkedIn OAuth configuration
// IMPORTANT: This must match exactly what's registered in LinkedIn Developer Console
const LINKEDIN_REDIRECT_URI = "https://uzacai.com/linkedin-callback.html";

console.log("Edge function environment:");
console.log("SUPABASE_URL:", SUPABASE_URL ? "set" : "not set");
console.log("SUPABASE_ANON_KEY:", SUPABASE_ANON_KEY ? "set" : "not set");
console.log("LINKEDIN_CLIENT_ID:", LINKEDIN_CLIENT_ID ? "set" : "not set");
console.log("LINKEDIN_CLIENT_SECRET:", LINKEDIN_CLIENT_SECRET ? "set" : "not set");
console.log("Using fixed LINKEDIN_REDIRECT_URI:", LINKEDIN_REDIRECT_URI);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Parse request body
    const { platform, action, code, userId } = await req.json();
    
    console.log(`Processing ${action} request for ${platform} platform`);
    
    // Only handle LinkedIn platform for now
    if (platform !== 'linkedin') {
      return new Response(
        JSON.stringify({ error: "Only LinkedIn platform is supported" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if we have the necessary API credentials
    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      console.error("LinkedIn API credentials are missing");
      return new Response(
        JSON.stringify({ error: "LinkedIn API credentials are missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Handle different actions
    if (action === 'auth-url') {
      // Using ONLY authorized scopes from the image
      const scopes = ['openid', 'profile', 'w_member_social', 'email'];
      
      // Create LinkedIn authorization URL
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code` +
        `&client_id=${LINKEDIN_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(LINKEDIN_REDIRECT_URI)}` +
        `&state=${Math.random().toString(36).substring(2)}` +
        `&scope=${encodeURIComponent(scopes.join(' '))}`;
      
      console.log(`Generated LinkedIn auth URL with scopes: ${scopes.join(', ')}`);
      
      return new Response(
        JSON.stringify({ success: true, authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } 
    else if (action === 'callback') {
      console.log("Received callback code from LinkedIn OAuth flow");
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: "No authorization code provided" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "No user ID provided" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      try {
        // Exchange code for access token
        console.log("Exchanging code for access token using redirect URI:", LINKEDIN_REDIRECT_URI);
        
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI
          })
        });
        
        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("Error exchanging code for token:", errorText);
          throw new Error(`LinkedIn API error: ${tokenResponse.status} - ${errorText}`);
        }
        
        const tokenData = await tokenResponse.json();
        console.log("Successfully obtained LinkedIn access token");
        
        // Get user profile data
        const profileResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          }
        });
        
        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error("Error getting LinkedIn profile:", errorText);
          throw new Error(`LinkedIn profile API error: ${profileResponse.status} - ${errorText}`);
        }
        
        const profileData = await profileResponse.json();
        console.log("Successfully retrieved LinkedIn profile data");
        
        // Get user email address
        const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          }
        });
        
        let emailData;
        let email = null;
        
        if (emailResponse.ok) {
          emailData = await emailResponse.json();
          
          if (emailData.elements && 
              emailData.elements.length > 0 && 
              emailData.elements[0]['handle~'] && 
              emailData.elements[0]['handle~'].emailAddress) {
            email = emailData.elements[0]['handle~'].emailAddress;
          }
          
          console.log("Successfully retrieved LinkedIn email data");
        } else {
          console.warn("Could not retrieve LinkedIn email, continuing without it");
        }
        
        // Format the account name
        const accountName = `${profileData.localizedFirstName} ${profileData.localizedLastName}`;
        
        // Store the LinkedIn token and profile info in the database
        const { error: dbError } = await supabase
          .from('social_accounts')
          .upsert({
            user_id: userId,
            platform: 'linkedin',
            access_token: tokenData.access_token,
            platform_account_id: profileData.id,
            account_name: accountName,
            account_email: email,
            account_type: 'personal',
            refresh_token: tokenData.refresh_token || null,
            expires_in: tokenData.expires_in || null,
            last_used_at: new Date().toISOString(),
            connected_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,platform'
          });
          
        if (dbError) {
          console.error("Error storing LinkedIn account data:", dbError);
          throw new Error(dbError.message);
        }
        
        // Return success response with account name
        return new Response(
          JSON.stringify({ 
            success: true, 
            accountName,
            message: "LinkedIn account connected successfully"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (error) {
        console.error("Error processing LinkedIn callback:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Error processing LinkedIn callback" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action specified" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
