/**
 * TikTok OAuth Service
 * 
 * Handles authentication with TikTok's official API for accessing
 * a user's own account data (their videos, analytics, etc.)
 * 
 * Setup:
 * 1. Create app at https://developers.tiktok.com/
 * 2. Request scopes: user.info.basic, video.list
 * 3. Add your redirect URI
 * 4. Copy Client Key and Client Secret to .env
 */

const TIKTOK_CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY;
const TIKTOK_REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI || `${window.location.origin}/auth/tiktok/callback`;

// TikTok OAuth endpoints
const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

// Scopes we request
const SCOPES = [
  'user.info.basic',      // Basic profile info
  'video.list',           // List user's videos
  // 'video.publish',     // Requires additional approval
  // 'video.upload',      // Requires additional approval
];

/**
 * Check if TikTok OAuth is configured
 */
export const isTikTokOAuthConfigured = () => {
  return !!TIKTOK_CLIENT_KEY;
};

/**
 * Generate a random state for CSRF protection
 */
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate code verifier and challenge for PKCE
 */
async function generatePKCE() {
  // Generate random code verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Generate code challenge (SHA256 hash of verifier)
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { codeVerifier, codeChallenge };
}

/**
 * Initiate TikTok OAuth flow
 * This redirects the user to TikTok's login page
 */
export async function initiateTikTokAuth() {
  if (!TIKTOK_CLIENT_KEY) {
    throw new Error('TikTok Client Key not configured');
  }

  // Generate PKCE values
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateState();

  // Store for later verification
  sessionStorage.setItem('tiktok_code_verifier', codeVerifier);
  sessionStorage.setItem('tiktok_state', state);

  // Build authorization URL
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    redirect_uri: TIKTOK_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(','),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  const authUrl = `${TIKTOK_AUTH_URL}?${params.toString()}`;
  
  // Redirect to TikTok
  window.location.href = authUrl;
}

/**
 * Handle the OAuth callback
 * Called when TikTok redirects back with the authorization code
 */
export async function handleTikTokCallback(code, state) {
  // Verify state to prevent CSRF
  const savedState = sessionStorage.getItem('tiktok_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }

  const codeVerifier = sessionStorage.getItem('tiktok_code_verifier');
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  // Exchange code for tokens
  // NOTE: This should be done server-side to protect client_secret
  // For demo purposes, we'll show the client-side flow
  // In production, send the code to your backend
  
  const tokenResponse = await fetch('/api/auth/tiktok/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      redirect_uri: TIKTOK_REDIRECT_URI
    })
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const tokens = await tokenResponse.json();

  // Clean up session storage
  sessionStorage.removeItem('tiktok_code_verifier');
  sessionStorage.removeItem('tiktok_state');

  return tokens;
}

/**
 * TikTok API client for making authenticated requests
 */
export class TikTokClient {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async request(endpoint, options = {}) {
    const url = `${TIKTOK_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get current user's profile
   */
  async getUserInfo() {
    const data = await this.request('/user/info/', {
      method: 'GET'
    });

    return {
      id: data.data.user.open_id,
      username: data.data.user.display_name,
      avatar: data.data.user.avatar_url,
      profileDeepLink: data.data.user.profile_deep_link,
      followerCount: data.data.user.follower_count,
      followingCount: data.data.user.following_count,
      likesCount: data.data.user.likes_count,
      videoCount: data.data.user.video_count
    };
  }

  /**
   * Get current user's videos
   */
  async getUserVideos(cursor = null, maxCount = 20) {
    const params = new URLSearchParams({
      max_count: maxCount.toString()
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }

    const data = await this.request(`/video/list/?${params.toString()}`);

    return {
      videos: (data.data.videos || []).map(video => ({
        id: video.id,
        title: video.title,
        description: video.video_description,
        duration: video.duration,
        coverImageUrl: video.cover_image_url,
        embedLink: video.embed_link,
        createTime: video.create_time,
        stats: {
          views: video.view_count,
          likes: video.like_count,
          comments: video.comment_count,
          shares: video.share_count
        }
      })),
      cursor: data.data.cursor,
      hasMore: data.data.has_more
    };
  }

  /**
   * Get video insights (requires additional scope approval)
   */
  async getVideoInsights(videoId) {
    const data = await this.request(`/video/insights/?video_id=${videoId}`);
    return data.data;
  }
}

/**
 * Store and retrieve TikTok tokens
 * In production, use secure server-side storage
 */
export const tokenStorage = {
  save(tokens) {
    localStorage.setItem('tiktok_tokens', JSON.stringify({
      ...tokens,
      savedAt: Date.now()
    }));
  },

  get() {
    const stored = localStorage.getItem('tiktok_tokens');
    if (!stored) return null;

    const tokens = JSON.parse(stored);
    
    // Check if token is expired
    const expiresIn = tokens.expires_in * 1000; // Convert to ms
    const savedAt = tokens.savedAt || 0;
    const isExpired = Date.now() > savedAt + expiresIn - 60000; // 1 min buffer

    if (isExpired && tokens.refresh_token) {
      // Token expired, needs refresh
      return { ...tokens, isExpired: true };
    }

    return tokens;
  },

  clear() {
    localStorage.removeItem('tiktok_tokens');
  }
};

export default {
  isTikTokOAuthConfigured,
  initiateTikTokAuth,
  handleTikTokCallback,
  TikTokClient,
  tokenStorage
};
