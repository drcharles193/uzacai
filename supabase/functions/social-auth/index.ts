
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// LinkedIn OAuth credentials
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");

// LinkedIn token exchange function
async function exchangeLinkedInCode(code: string, redirectUri: string) {
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !redirectUri) {
    throw new Error("LinkedIn OAuth credentials not configured");
  }
  
  const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  params.append('client_id', LINKEDIN_CLIENT_ID);
  params.append('client_secret', LINKEDIN_CLIENT_SECRET);
  
  try {
    console.log("Exchanging LinkedIn code for tokens with redirect URI:", redirectUri);
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn token exchange error:', errorText);
      throw new Error(`LinkedIn API error: ${response.status} ${errorText}`);
    }
    
    const tokens = await response.json();
    console.log("LinkedIn tokens received", Object.keys(tokens));
    return tokens;
  } catch (error) {
    console.error('Error exchanging LinkedIn code for tokens:', error);
    throw error;
  }
}

// Get LinkedIn user profile
async function getLinkedInUserProfile(accessToken: string) {
  try {
    const response = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('LinkedIn user profile error:', errorText);
      throw new Error(`LinkedIn API error: ${response.status} ${errorText}`);
    }
    
    const userData = await response.json();
    console.log("LinkedIn user data received:", JSON.stringify(userData));
    
    // Get LinkedIn email address (optional)
    let email = null;
    try {
      const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        if (emailData.elements && emailData.elements.length > 0) {
          email = emailData.elements[0]['handle~'].emailAddress;
        }
      }
    } catch (emailError) {
      console.error('Error fetching LinkedIn email:', emailError);
      // Continue without email
    }
    
    return {
      id: userData.id,
      name: `${userData.localizedFirstName} ${userData.localizedLastName}`,
      email: email
    };
  } catch (error) {
    console.error('Error fetching LinkedIn user profile:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, code, userId, action, redirectUri } = await req.json();
    console.log(`Received auth request for platform: ${platform}, action: ${action}, userId: ${userId}, redirectUri: ${redirectUri}`);
    
    // Only handle LinkedIn OAuth flow
    if (platform === 'linkedin') {
      if (action === 'auth-url') {
        // Step 1: Generate LinkedIn auth URL
        try {
          const state = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
          
          // LinkedIn OAuth URL
          const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
          url.searchParams.append('response_type', 'code');
          url.searchParams.append('client_id', LINKEDIN_CLIENT_ID || '');
          url.searchParams.append('redirect_uri', redirectUri);
          url.searchParams.append('state', state);
          url.searchParams.append('scope', 'r_liteprofile r_emailaddress');
          
          await supabase
            .from('oauth_states')
            .insert({
              user_id: userId,
              platform: 'linkedin',
              state: state,
              created_at: new Date().toISOString()
            });
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              authUrl: url.toString()
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error generating LinkedIn auth URL:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } 
      else if (action === 'callback') {
        // Step 2: Handle callback and exchange code for tokens
        try {
          const providedRedirectUri = redirectUri || req.headers.get('Origin') + '/linkedin-callback.html';
          console.log("Using callback redirect URI:", providedRedirectUri);
          
          // Exchange code for tokens
          const tokens = await exchangeLinkedInCode(code, providedRedirectUri);
          
          // Get user profile information
          const userProfile = await getLinkedInUserProfile(tokens.access_token);
          
          console.log("LinkedIn user profile retrieved:", userProfile.name);
          
          // Store the connection in the database
          const { data, error } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: userId,
              platform: 'linkedin',
              platform_account_id: userProfile.id,
              account_name: userProfile.name || "LinkedIn Account",
              account_type: "personal",
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token || null,
              token_expires_at: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null,
              last_used_at: new Date().toISOString(),
              metadata: { 
                email: userProfile.email,
                connection_type: "oauth"
              }
            }, {
              onConflict: 'user_id, platform, platform_account_id',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error("Error storing LinkedIn connection:", error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              platform: 'linkedin', 
              accountName: userProfile.name || "LinkedIn Account",
              accountType: "personal",
              email: userProfile.email
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error processing LinkedIn callback:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } 
      else {
        return new Response(
          JSON.stringify({ error: "Invalid LinkedIn action" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    else {
      return new Response(
        JSON.stringify({ error: "Unsupported platform" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
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
