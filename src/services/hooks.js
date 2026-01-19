/**
 * React Hooks for TikTok Data
 * 
 * These hooks manage data fetching, caching, and state
 * for the analytics dashboard.
 */

import { useState, useEffect, useCallback } from 'react';
import * as tiktokApi from '../services/tiktokApi';
import * as analytics from '../services/analytics';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_DURATION
  });
}

/**
 * Hook for fetching user profile
 */
export function useUserProfile(username) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    const cacheKey = `profile:${username}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setProfile(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tiktokApi.getUserProfile(username);
      setProfile(data);
      setCache(cacheKey, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}

/**
 * Hook for fetching user's videos
 */
export function useUserVideos(username, count = 30) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(async () => {
    if (!username) return;

    const cacheKey = `videos:${username}:${count}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setVideos(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tiktokApi.getUserVideos(username, count);
      setVideos(data);
      setCache(cacheKey, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username, count]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refetch: fetchVideos };
}

/**
 * Hook for trending sounds
 */
export function useTrendingSounds(region = 'US') {
  const [sounds, setSounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSounds = useCallback(async () => {
    const cacheKey = `trending-sounds:${region}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setSounds(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tiktokApi.getTrendingSounds(region);
      setSounds(data);
      setCache(cacheKey, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchSounds();
  }, [fetchSounds]);

  return { sounds, loading, error, refetch: fetchSounds };
}

/**
 * Hook for trending hashtags
 */
export function useTrendingHashtags(region = 'US') {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHashtags = useCallback(async () => {
    const cacheKey = `trending-hashtags:${region}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setHashtags(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tiktokApi.getTrendingHashtags(region);
      setHashtags(data);
      setCache(cacheKey, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    fetchHashtags();
  }, [fetchHashtags]);

  return { hashtags, loading, error, refetch: fetchHashtags };
}

/**
 * Hook for trending videos
 */
export function useTrendingVideos(region = 'US', count = 30) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVideos = useCallback(async () => {
    const cacheKey = `trending-videos:${region}:${count}`;
    const cached = getCached(cacheKey);
    if (cached) {
      setVideos(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tiktokApi.getTrendingVideos(region, count);
      setVideos(data);
      setCache(cacheKey, data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [region, count]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refetch: fetchVideos };
}

/**
 * Hook for user search
 */
export function useUserSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await tiktokApi.searchUsers(query);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, search };
}

/**
 * Hook for complete analytics data
 * Combines profile, videos, and generates insights
 */
export function useAnalytics(username) {
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(username);
  const { videos, loading: videosLoading, error: videosError } = useUserVideos(username, 50);
  
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (profile && videos && videos.length > 0) {
      // Generate insights from the data
      const engagementRate = analytics.calculateEngagementRate(
        { 
          likes: profile.stats?.likes || 0,
          comments: videos.reduce((sum, v) => sum + (v.stats?.comments || 0), 0),
          shares: videos.reduce((sum, v) => sum + (v.stats?.shares || 0), 0)
        },
        profile.stats?.followers || 0
      );

      const postingTimes = analytics.analyzeBestPostingTimes(videos);
      const contentTrends = analytics.analyzeContentTrends(videos);
      const hashtagPerformance = analytics.analyzeHashtagPerformance(videos);
      const growthPrediction = analytics.predictGrowth(
        profile.stats?.followers || 0, 
        videos
      );

      setInsights({
        engagementRate,
        postingTimes,
        contentTrends,
        hashtagPerformance,
        growthPrediction,
        totalViews: videos.reduce((sum, v) => sum + (v.stats?.views || 0), 0),
        avgViews: Math.round(
          videos.reduce((sum, v) => sum + (v.stats?.views || 0), 0) / videos.length
        )
      });
    }
  }, [profile, videos]);

  return {
    profile,
    videos,
    insights,
    loading: profileLoading || videosLoading,
    error: profileError || videosError
  };
}

/**
 * Hook for managing competitor tracking
 */
export function useCompetitors() {
  const [competitors, setCompetitors] = useState(() => {
    const saved = localStorage.getItem('pulsemetrics_competitors');
    return saved ? JSON.parse(saved) : [];
  });

  const [competitorData, setCompetitorData] = useState({});
  const [loading, setLoading] = useState(false);

  // Save to localStorage when competitors change
  useEffect(() => {
    localStorage.setItem('pulsemetrics_competitors', JSON.stringify(competitors));
  }, [competitors]);

  // Fetch data for all competitors
  const fetchCompetitorData = useCallback(async () => {
    if (competitors.length === 0) return;

    setLoading(true);
    const data = {};

    for (const username of competitors) {
      try {
        const profile = await tiktokApi.getUserProfile(username);
        const videos = await tiktokApi.getUserVideos(username, 10);
        
        const avgViews = videos.length > 0
          ? Math.round(videos.reduce((sum, v) => sum + (v.stats?.views || 0), 0) / videos.length)
          : 0;

        const avgEngagement = videos.length > 0
          ? (videos.reduce((sum, v) => 
              sum + parseFloat(analytics.calculateVideoEngagement(v)), 0) / videos.length
            ).toFixed(2)
          : 0;

        data[username] = {
          ...profile,
          avgViews,
          avgEngagement: avgEngagement + '%'
        };
      } catch (err) {
        console.error(`Failed to fetch data for ${username}:`, err);
      }
    }

    setCompetitorData(data);
    setLoading(false);
  }, [competitors]);

  useEffect(() => {
    fetchCompetitorData();
  }, [fetchCompetitorData]);

  const addCompetitor = useCallback((username) => {
    const cleaned = username.replace('@', '').trim();
    if (cleaned && !competitors.includes(cleaned)) {
      setCompetitors(prev => [...prev, cleaned]);
    }
  }, [competitors]);

  const removeCompetitor = useCallback((username) => {
    setCompetitors(prev => prev.filter(c => c !== username));
    setCompetitorData(prev => {
      const newData = { ...prev };
      delete newData[username];
      return newData;
    });
  }, []);

  return {
    competitors,
    competitorData,
    loading,
    addCompetitor,
    removeCompetitor,
    refetch: fetchCompetitorData
  };
}

/**
 * Hook for dashboard data aggregation
 */
export function useDashboardData(username) {
  const { profile, videos, insights, loading: analyticsLoading, error: analyticsError } = useAnalytics(username);
  const { sounds, loading: soundsLoading } = useTrendingSounds();
  const { competitors, competitorData, loading: competitorsLoading, addCompetitor, removeCompetitor } = useCompetitors();

  return {
    profile,
    videos,
    insights,
    trendingSounds: sounds,
    competitors,
    competitorData,
    addCompetitor,
    removeCompetitor,
    loading: analyticsLoading || soundsLoading || competitorsLoading,
    error: analyticsError
  };
}

export default {
  useUserProfile,
  useUserVideos,
  useTrendingSounds,
  useTrendingHashtags,
  useTrendingVideos,
  useUserSearch,
  useAnalytics,
  useCompetitors,
  useDashboardData
};
