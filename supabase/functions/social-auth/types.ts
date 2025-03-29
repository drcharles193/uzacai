
/**
 * Request structure for publishing to social platforms
 */
export interface PublishingRequest {
  userId: string;
  content: string;
  mediaUrls?: string[];
  mediaBase64?: string[];
  selectedAccounts: string[];
  platforms: string[];
}

/**
 * Twitter OAuth credentials and tokens
 */
export interface TwitterCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  screenName: string;
}

/**
 * Facebook OAuth credentials and tokens
 */
export interface FacebookCredentials {
  accessToken: string;
  userId: string;
  expiresAt: number;
}

/**
 * Instagram OAuth credentials and tokens
 */
export interface InstagramCredentials {
  accessToken: string;
  userId: string;
  expiresAt: number;
}
