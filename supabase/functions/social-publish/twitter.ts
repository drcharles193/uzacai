
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";
import { PlatformCredentials } from './types.ts';
import { updateLastUsedTimestamp } from './utils.ts';

/**
 * Validates that all required Twitter API credentials are available
 */
export function validateTwitterCredentials() {
  const apiKey = Deno.env.get("TWITTER_API_KEY");
  const apiSecret = Deno.env.get("TWITTER_API_SECRET");
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const accessTokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");
  
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.error("Missing Twitter API credentials. Please check your environment variables.");
    return false;
  }
  
  console.log("Using Twitter API credentials:");
  console.log(`API Key exists: ${Boolean(apiKey)}, length: ${apiKey?.length}`);
  console.log(`API Secret exists: ${Boolean(apiSecret)}, length: ${apiSecret?.length}`);
  console.log(`Access Token exists: ${Boolean(accessToken)}, length: ${accessToken?.length}`);
  console.log(`Access Token Secret exists: ${Boolean(accessTokenSecret)}, length: ${accessTokenSecret?.length}`);
  
  return true;
}

/**
 * Generates OAuth signature for Twitter API requests
 */
export function generateOAuthSignature(
  method: string,
  url: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  // Sort and encode parameters
  const parameterString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  
  // Create signature base string
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(parameterString)}`;
  
  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  
  // Generate HMAC-SHA1 signature
  const hmac = createHmac("sha1", signingKey);
  const signature = hmac.update(signatureBaseString).digest("base64");
  
  console.log("OAuth Parameters:", JSON.stringify(oauthParams));
  console.log("Parameter String:", parameterString);
  console.log("Signature Base String:", signatureBaseString);
  console.log("Signing Key (first 5 chars):", signingKey.substring(0, 5) + "...");
  console.log("Signature:", signature);
  
  return signature;
}

/**
 * Creates Authorization header for Twitter API requests
 */
export function createTwitterAuthHeader(
  method: string,
  url: string,
  apiKey: string,
  apiSecret: string,
  accessToken: string,
  accessTokenSecret: string
): string {
  // Generate OAuth parameters
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0'
  };
  
  // Generate OAuth signature
  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    apiSecret,
    accessTokenSecret
  );
  
  oauthParams.oauth_signature = signature;
  
  // Create Authorization header
  const authHeader = 'OAuth ' + Object.entries(oauthParams)
    .map(([key, value]) => `${encodeURIComponent(key)}="${encodeURIComponent(value)}"`)
    .join(', ');
  
  console.log("Final Authorization header:", authHeader);
  
  return authHeader;
}

/**
 * Get user-specific tokens from database or fall back to environment variables
 */
export async function getTwitterCredentials(supabase: any, userId: string): Promise<PlatformCredentials> {
  // Get user-specific tokens if available
  const { data: account, error: accountError } = await supabase
    .from('social_accounts')
    .select('access_token, access_token_secret')
    .eq('user_id', userId)
    .eq('platform', 'twitter')
    .maybeSingle();
  
  if (accountError) {
    console.error("Error fetching user account:", accountError);
  }
  
  // Use user tokens if available, otherwise fall back to environment variables
  return {
    apiKey: Deno.env.get("TWITTER_API_KEY") || "",
    apiSecret: Deno.env.get("TWITTER_API_SECRET") || "",
    accessToken: account?.access_token || Deno.env.get("TWITTER_ACCESS_TOKEN") || "",
    accessTokenSecret: account?.access_token_secret || Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET") || ""
  };
}
