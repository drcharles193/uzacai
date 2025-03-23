
// Common interfaces and types for the social-publish function
export interface PublishingRequest {
  userId: string;
  content: string;
  mediaUrls: string[];
  mediaBase64: string[];
  contentTypes?: string[];
  selectedAccounts: string[];
  platforms: string[];
}

export interface PlatformCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface PlatformResponse {
  platform: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface ProcessedMedia {
  urls: string[];
  base64: string[];
  contentTypes: string[];
}
