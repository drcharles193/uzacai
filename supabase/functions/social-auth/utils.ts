
// Generate a random string for OAuth state
export function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Store OAuth state in database
export async function storeOAuthState(supabase: any, userId: string, platform: string, state: string) {
  await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      platform: platform,
      state: state,
      created_at: new Date().toISOString()
    });
}
