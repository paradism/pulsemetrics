/**
 * TikTok API Service
 * 
 * This service provides a unified interface for TikTok data from multiple sources:
 * 1. Official TikTok API (OAuth) - For user's own account data
 * 2. RapidAPI (third-party) - For trending content, competitor data, public profiles
 * 
 * Usage:
 * - Set VITE_RAPIDAPI_KEY in .env for third-party data
 * - Users connect their TikTok account via OAuth for personal analytics
 */

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'tiktok-scraper7.p.rapidapi.com';

// Alternative APIs on RapidAPI (fallbacks)
const RAPIDAPI_HOSTS = {
  primary: 'tiktok-scraper7.p.rapidapi.com',
  trending: 'tiktok-trending-data.p.rapidapi.com',
  viral: 'tiktok-most-trending-and-viral-content.p.rapidapi.com'
};

/**
 * Check if API is configured
 */
export const isApiConfigured = () => {
  return !!RAPIDAPI_KEY;
};

/**
 * Make a request to RapidAPI
 */
async function rapidApiRequest(endpoint, host = RAPIDAPI_HOST, params = {}) {
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not configured. Using mock data.');
    return null;
  }

  const url = new URL(`https://${host}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': host
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('RapidAPI request failed:', error);
    return null;
  }
}

/**
 * Get user profile by username
 */
export async function getUserProfile(username) {
  const data = await rapidApiRequest('/user/info', RAPIDAPI_HOST, {
    unique_id: username
  });

  if (!data) {
    return getMockUserProfile(username);
  }

  // Normalize response
  return {
    id: data.data?.user?.id || data.id,
    username: data.data?.user?.uniqueId || username,
    nickname: data.data?.user?.nickname || username,
    avatar: data.data?.user?.avatarLarger || data.data?.user?.avatarMedium,
    bio: data.data?.user?.signature || '',
    verified: data.data?.user?.verified || false,
    stats: {
      followers: data.data?.stats?.followerCount || 0,
      following: data.data?.stats?.followingCount || 0,
      likes: data.data?.stats?.heartCount || 0,
      videos: data.data?.stats?.videoCount || 0
    },
    raw: data
  };
}

/**
 * Get user's videos
 */
export async function getUserVideos(username, count = 30) {
  const data = await rapidApiRequest('/user/posts', RAPIDAPI_HOST, {
    unique_id: username,
    count: count.toString()
  });

  if (!data || !data.data?.videos) {
    return getMockUserVideos(username);
  }

  return data.data.videos.map(normalizeVideo);
}

/**
 * Get trending videos
 */
export async function getTrendingVideos(region = 'US', count = 30) {
  const data = await rapidApiRequest('/feed/list', RAPIDAPI_HOST, {
    region,
    count: count.toString()
  });

  if (!data || !data.data) {
    return getMockTrendingVideos();
  }

  return (data.data || []).map(normalizeVideo);
}

/**
 * Get trending sounds/music
 */
export async function getTrendingSounds(region = 'US') {
  // Try the trending data API
  const data = await rapidApiRequest('/trending/sounds', RAPIDAPI_HOSTS.trending, {
    region
  });

  if (!data) {
    return getMockTrendingSounds();
  }

  return (data.sounds || data.data || []).map(sound => ({
    id: sound.id || sound.musicId,
    title: sound.title || sound.musicName,
    author: sound.author || sound.authorName,
    playUrl: sound.playUrl || sound.musicUrl,
    coverUrl: sound.coverUrl || sound.coverLarge,
    duration: sound.duration,
    usageCount: sound.usageCount || sound.userCount || 0,
    raw: sound
  }));
}

/**
 * Get trending hashtags
 */
export async function getTrendingHashtags(region = 'US') {
  const data = await rapidApiRequest('/trending/hashtags', RAPIDAPI_HOSTS.trending, {
    region
  });

  if (!data) {
    return getMockTrendingHashtags();
  }

  return (data.hashtags || data.data || []).map(tag => ({
    id: tag.id || tag.challengeId,
    name: tag.name || tag.challengeName,
    description: tag.description || tag.desc,
    viewCount: tag.viewCount || tag.stats?.viewCount || 0,
    videoCount: tag.videoCount || tag.stats?.videoCount || 0,
    raw: tag
  }));
}

/**
 * Search for users
 */
export async function searchUsers(query, count = 20) {
  const data = await rapidApiRequest('/search/user', RAPIDAPI_HOST, {
    keywords: query,
    count: count.toString()
  });

  if (!data || !data.data) {
    return [];
  }

  return (data.data || []).map(user => ({
    id: user.user?.id || user.id,
    username: user.user?.uniqueId || user.uniqueId,
    nickname: user.user?.nickname || user.nickname,
    avatar: user.user?.avatarMedium || user.avatarMedium,
    followers: user.user?.followerCount || user.followerCount || 0,
    verified: user.user?.verified || false
  }));
}

/**
 * Search for videos
 */
export async function searchVideos(query, count = 20) {
  const data = await rapidApiRequest('/search/video', RAPIDAPI_HOST, {
    keywords: query,
    count: count.toString()
  });

  if (!data || !data.data) {
    return [];
  }

  return (data.data || []).map(normalizeVideo);
}

/**
 * Get video details by URL or ID
 */
export async function getVideoDetails(videoUrl) {
  const data = await rapidApiRequest('/video/info', RAPIDAPI_HOST, {
    url: videoUrl
  });

  if (!data || !data.data) {
    return null;
  }

  return normalizeVideo(data.data);
}

/**
 * Get hashtag info and videos
 */
export async function getHashtagVideos(hashtag, count = 30) {
  const data = await rapidApiRequest('/challenge/posts', RAPIDAPI_HOST, {
    challenge_name: hashtag,
    count: count.toString()
  });

  if (!data || !data.data) {
    return { info: null, videos: [] };
  }

  return {
    info: {
      id: data.challengeInfo?.challenge?.id,
      name: data.challengeInfo?.challenge?.title,
      description: data.challengeInfo?.challenge?.desc,
      viewCount: data.challengeInfo?.stats?.viewCount,
      videoCount: data.challengeInfo?.stats?.videoCount
    },
    videos: (data.data.videos || []).map(normalizeVideo)
  };
}

/**
 * Normalize video data from different API responses
 */
function normalizeVideo(video) {
  return {
    id: video.id || video.video_id || video.aweme_id,
    description: video.desc || video.description || video.title || '',
    createTime: video.createTime || video.create_time,
    author: {
      id: video.author?.id,
      username: video.author?.uniqueId || video.author?.unique_id,
      nickname: video.author?.nickname,
      avatar: video.author?.avatarMedium || video.author?.avatar_medium
    },
    stats: {
      views: video.stats?.playCount || video.play_count || video.playCount || 0,
      likes: video.stats?.diggCount || video.digg_count || video.diggCount || 0,
      comments: video.stats?.commentCount || video.comment_count || video.commentCount || 0,
      shares: video.stats?.shareCount || video.share_count || video.shareCount || 0
    },
    video: {
      url: video.video?.playAddr || video.play_url || video.downloadAddr,
      cover: video.video?.cover || video.cover || video.origin_cover,
      duration: video.video?.duration || video.duration
    },
    music: video.music ? {
      id: video.music.id,
      title: video.music.title,
      author: video.music.authorName,
      playUrl: video.music.playUrl
    } : null,
    hashtags: (video.challenges || video.textExtra || [])
      .filter(t => t.hashtagName || t.name)
      .map(t => t.hashtagName || t.name),
    raw: video
  };
}

// ============================================
// MOCK DATA (for development without API key)
// ============================================

function getMockUserProfile(username) {
  return {
    id: 'mock-' + username,
    username: username,
    nickname: username.charAt(0).toUpperCase() + username.slice(1),
    avatar: null,
    bio: 'This is a mock profile for development',
    verified: false,
    stats: {
      followers: Math.floor(Math.random() * 1000000),
      following: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 5000000),
      videos: Math.floor(Math.random() * 500)
    }
  };
}

function getMockUserVideos(username) {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `mock-video-${i}`,
    description: `Mock video ${i + 1} by @${username}`,
    createTime: Date.now() / 1000 - (i * 86400),
    author: {
      id: 'mock-author',
      username: username,
      nickname: username
    },
    stats: {
      views: Math.floor(Math.random() * 500000),
      likes: Math.floor(Math.random() * 50000),
      comments: Math.floor(Math.random() * 2000),
      shares: Math.floor(Math.random() * 1000)
    },
    video: {
      url: null,
      cover: null,
      duration: Math.floor(Math.random() * 60) + 10
    },
    hashtags: ['fyp', 'viral', 'trending']
  }));
}

function getMockTrendingVideos() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `trending-${i}`,
    description: `Trending video #${i + 1} 🔥`,
    createTime: Date.now() / 1000 - (i * 3600),
    author: {
      id: `author-${i}`,
      username: `creator${i}`,
      nickname: `Creator ${i}`
    },
    stats: {
      views: Math.floor(Math.random() * 10000000),
      likes: Math.floor(Math.random() * 1000000),
      comments: Math.floor(Math.random() * 50000),
      shares: Math.floor(Math.random() * 100000)
    },
    video: { url: null, cover: null, duration: 30 },
    hashtags: ['fyp', 'trending', 'viral']
  }));
}

function getMockTrendingSounds() {
  const sounds = [
    { name: 'Original Sound - @musicmaker', author: 'musicmaker', category: 'Music' },
    { name: 'Aesthetic vibes remix', author: 'dj_aesthetic', category: 'Ambient' },
    { name: 'Voiceover trending clip', author: 'voiceguy', category: 'Voice' },
    { name: 'Dance challenge beat', author: 'beatdrop', category: 'Dance' },
    { name: 'ASMR cooking sounds', author: 'asmr_chef', category: 'ASMR' },
    { name: 'Chill lo-fi beats', author: 'lofi_girl', category: 'Music' },
    { name: 'Comedy skit audio', author: 'funnybone', category: 'Comedy' },
    { name: 'Motivational speech', author: 'inspire_daily', category: 'Motivation' }
  ];

  return sounds.map((sound, i) => ({
    id: `sound-${i}`,
    title: sound.name,
    author: sound.author,
    category: sound.category,
    playUrl: null,
    coverUrl: null,
    duration: Math.floor(Math.random() * 30) + 10,
    usageCount: Math.floor(Math.random() * 5000000),
    growth: `+${Math.floor(Math.random() * 400)}%`
  }));
}

function getMockTrendingHashtags() {
  const hashtags = [
    'fyp', 'viral', 'trending', 'foryou', 'dance', 
    'comedy', 'food', 'travel', 'fashion', 'fitness',
    'makeup', 'pets', 'music', 'art', 'diy'
  ];

  return hashtags.map((tag, i) => ({
    id: `hashtag-${i}`,
    name: tag,
    description: `Trending hashtag #${tag}`,
    viewCount: Math.floor(Math.random() * 10000000000),
    videoCount: Math.floor(Math.random() * 10000000)
  }));
}

export default {
  isApiConfigured,
  getUserProfile,
  getUserVideos,
  getTrendingVideos,
  getTrendingSounds,
  getTrendingHashtags,
  searchUsers,
  searchVideos,
  getVideoDetails,
  getHashtagVideos
};
