
// Handle mock connections for other platforms
export function getMockPlatformResponse(platform: string) {
  // Simulate different platform responses
  switch(platform) {
    case 'facebook':
      return {
        success: true,
        platformId: `fb-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Facebook Page",
        accountType: "page",
        accessToken: "mock-fb-access-token",
        refreshToken: "mock-fb-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60).toISOString() // 60 days
      };
    case 'instagram':
      return {
        success: true,
        platformId: `ig-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Instagram Business",
        accountType: "business",
        accessToken: "mock-ig-access-token",
        refreshToken: "mock-ig-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 60).toISOString() // 60 days
      };
    case 'twitter':
      return {
        success: true,
        platformId: `tw-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Twitter Profile",
        accountType: "profile",
        accessToken: "mock-tw-access-token",
        refreshToken: "mock-tw-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 7).toISOString() // 7 days
      };
    case 'linkedin':
      return {
        success: true,
        platformId: `li-${Math.floor(Math.random() * 1000000)}`,
        accountName: "LinkedIn Profile",
        accountType: "personal",
        accessToken: "mock-li-access-token",
        refreshToken: "mock-li-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 60).toISOString() // 60 days
      };
    case 'youtube':
      return {
        success: true,
        platformId: `yt-${Math.floor(Math.random() * 1000000)}`,
        accountName: "YouTube Channel",
        accountType: "channel",
        accessToken: "mock-yt-access-token",
        refreshToken: "mock-yt-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString() // 30 days
      };
    case 'pinterest':
      return {
        success: true,
        platformId: `pin-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Pinterest Business",
        accountType: "business",
        accessToken: "mock-pin-access-token",
        refreshToken: "mock-pin-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 365).toISOString() // 365 days
      };
    case 'tiktok':
      return {
        success: true,
        platformId: `tt-${Math.floor(Math.random() * 1000000)}`,
        accountName: "TikTok Creator",
        accountType: "creator",
        accessToken: "mock-tt-access-token",
        refreshToken: "mock-tt-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 15).toISOString() // 15 days
      };
    case 'threads':
      return {
        success: true,
        platformId: `th-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Threads Profile",
        accountType: "profile",
        accessToken: "mock-th-access-token",
        refreshToken: "mock-th-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 90).toISOString() // 90 days
      };
    case 'bluesky':
      return {
        success: true,
        platformId: `bs-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Bluesky Account",
        accountType: "personal",
        accessToken: "mock-bs-access-token",
        refreshToken: null, // Bluesky uses a different auth mechanism
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 365).toISOString() // Long-lived token
      };
    case 'tumblr':
      return {
        success: true,
        platformId: `tm-${Math.floor(Math.random() * 1000000)}`,
        accountName: "Tumblr Blog",
        accountType: "blog",
        accessToken: "mock-tm-access-token",
        refreshToken: "mock-tm-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000 * 24 * 30).toISOString() // 30 days
      };
    default:
      return {
        success: true,
        platformId: `generic-${Math.floor(Math.random() * 1000000)}`,
        accountName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
        accountType: "personal",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour
      };
  }
}
