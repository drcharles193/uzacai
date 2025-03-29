
/**
 * Validate that Twitter credentials are properly configured
 */
export function validateTwitterCredentials(): boolean {
  const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID');
  const twitterClientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');
  const twitterCallbackUrl = Deno.env.get('TWITTER_CALLBACK_URL');
  
  if (!twitterClientId || !twitterClientSecret || !twitterCallbackUrl) {
    console.log("Twitter credentials not properly configured");
    return false;
  }
  
  console.log("Twitter Client ID: Exists");
  console.log("Twitter Callback URL: Exists");
  
  return true;
}

/**
 * Generates a Twitter authorization URL for OAuth flow
 */
export function generateTwitterAuthUrl(state: string): string {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID') || '';
  const redirectUri = Deno.env.get('TWITTER_CALLBACK_URL') || '';
  const scope = 'tweet.read tweet.write users.read offline.access';
  
  const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('code_challenge', 'challenge');
  authUrl.searchParams.append('code_challenge_method', 'plain');
  
  return authUrl.toString();
}

/**
 * Exchange OAuth code for Twitter access token
 */
export async function exchangeTwitterCodeForToken(code: string): Promise<any> {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID') || '';
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET') || '';
  const redirectUri = Deno.env.get('TWITTER_CALLBACK_URL') || '';
  
  const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
  
  const params = new URLSearchParams();
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('client_id', clientId);
  params.append('redirect_uri', redirectUri);
  params.append('code_verifier', 'challenge');
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: params
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Twitter token exchange failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to exchange Twitter code for token: ${response.status}`);
  }
  
  return await response.json();
}
