
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, postId, comment, commentId, accountId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get user's Facebook access token
    const { data: accountData, error: accountError } = await supabase
      .from('social_accounts')
      .select('platform_account_id, access_token')
      .eq('user_id', userId)
      .eq('platform', 'facebook')
      .eq('id', accountId)
      .single();
      
    if (accountError) {
      console.error("Error fetching social account:", accountError);
      return new Response(
        JSON.stringify({ error: 'Facebook account not found or not authenticated' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const accessToken = accountData.access_token;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Facebook access token not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'fetch-comments':
        // Fetch comments for a post
        if (!postId) {
          return new Response(
            JSON.stringify({ error: 'Post ID is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        try {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${postId}/comments?fields=id,message,from,created_time,comments{id,message,from,created_time}&access_token=${accessToken}`
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook API error:', errorText);
            throw new Error(`Facebook API error: ${response.status} ${errorText}`);
          }
          
          const commentsData = await response.json();
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              comments: commentsData.data 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error("Error fetching Facebook comments:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
      case 'post-comment':
        // Post a comment on a post
        if (!postId || !comment) {
          return new Response(
            JSON.stringify({ error: 'Post ID and comment text are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        try {
          const params = new URLSearchParams();
          params.append('message', comment);
          params.append('access_token', accessToken);
          
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${postId}/comments`,
            {
              method: 'POST',
              body: params
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook API error:', errorText);
            throw new Error(`Facebook API error: ${response.status} ${errorText}`);
          }
          
          const commentData = await response.json();
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              comment: commentData 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error("Error posting Facebook comment:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
      case 'post-reply':
        // Post a reply to a comment
        if (!commentId || !comment) {
          return new Response(
            JSON.stringify({ error: 'Comment ID and reply text are required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        try {
          const params = new URLSearchParams();
          params.append('message', comment);
          params.append('access_token', accessToken);
          
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${commentId}/comments`,
            {
              method: 'POST',
              body: params
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook API error:', errorText);
            throw new Error(`Facebook API error: ${response.status} ${errorText}`);
          }
          
          const replyData = await response.json();
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              reply: replyData 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error("Error posting Facebook reply:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
      case 'publish-post':
        // Publish a new post
        if (!postId) {
          return new Response(
            JSON.stringify({ error: 'Post data is required' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        try {
          // Get the post data from the scheduled_posts table
          const { data: postData, error: postError } = await supabase
            .from('scheduled_posts')
            .select('content, media_urls')
            .eq('id', postId)
            .single();
            
          if (postError) {
            console.error("Error fetching post data:", postError);
            return new Response(
              JSON.stringify({ error: 'Post not found' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          
          const params = new URLSearchParams();
          params.append('message', postData.content);
          
          // Handle media if present
          if (postData.media_urls && Array.isArray(postData.media_urls) && postData.media_urls.length > 0) {
            // For simplicity, we'll just use the first media URL
            // In a production app, you might want to handle multiple media items differently
            params.append('link', postData.media_urls[0]);
          }
          
          params.append('access_token', accessToken);
          
          // Get the page ID from the account
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${accountData.platform_account_id}/feed`,
            {
              method: 'POST',
              body: params
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Facebook API error:', errorText);
            throw new Error(`Facebook API error: ${response.status} ${errorText}`);
          }
          
          const publishData = await response.json();
          
          // Update the post in the database with the Facebook post ID
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'published',
              metadata: {
                facebook_post_id: publishData.id
              }
            })
            .eq('id', postId);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              postId: publishData.id 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error: any) {
          console.error("Error publishing Facebook post:", error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing request' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
