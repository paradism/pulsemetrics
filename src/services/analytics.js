/**
 * Analytics Service
 * 
 * Processes TikTok data to generate insights:
 * - Engagement rates
 * - Best posting times
 * - Growth trends
 * - Content performance
 */

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(stats, followers) {
  if (!followers || followers === 0) return 0;
  
  const engagements = (stats.likes || 0) + (stats.comments || 0) + (stats.shares || 0);
  return ((engagements / followers) * 100).toFixed(2);
}

/**
 * Calculate video engagement rate
 */
export function calculateVideoEngagement(video) {
  const views = video.stats?.views || 0;
  if (views === 0) return 0;
  
  const engagements = (video.stats?.likes || 0) + 
                      (video.stats?.comments || 0) + 
                      (video.stats?.shares || 0);
  return ((engagements / views) * 100).toFixed(2);
}

/**
 * Analyze best posting times based on video performance
 */
export function analyzeBestPostingTimes(videos) {
  // Initialize grid: 7 days x 24 hours
  const engagementByTime = {};
  
  for (let day = 0; day < 7; day++) {
    engagementByTime[day] = {};
    for (let hour = 0; hour < 24; hour++) {
      engagementByTime[day][hour] = { total: 0, count: 0 };
    }
  }

  // Process each video
  videos.forEach(video => {
    const timestamp = video.createTime * 1000; // Convert to ms
    const date = new Date(timestamp);
    const day = date.getDay(); // 0 = Sunday
    const hour = date.getHours();
    
    const engagement = parseFloat(calculateVideoEngagement(video));
    
    engagementByTime[day][hour].total += engagement;
    engagementByTime[day][hour].count += 1;
  });

  // Calculate averages and find best times
  const results = {
    heatmap: [],
    bestTimes: [],
    bestDays: []
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayTotals = {};

  // Build heatmap data
  for (let hour = 0; hour < 24; hour++) {
    const hourLabel = hour === 0 ? '12am' : 
                      hour < 12 ? `${hour}am` : 
                      hour === 12 ? '12pm' : `${hour - 12}pm`;
    
    const row = { hour: hourLabel };
    
    for (let day = 0; day < 7; day++) {
      const cell = engagementByTime[day][hour];
      const avg = cell.count > 0 ? cell.total / cell.count : 0;
      const dayKey = dayNames[day].toLowerCase();
      row[dayKey] = Math.round(avg * 10); // Scale for heatmap
      
      // Track day totals
      if (!dayTotals[day]) dayTotals[day] = { total: 0, count: 0 };
      dayTotals[day].total += avg;
      dayTotals[day].count += cell.count > 0 ? 1 : 0;
    }
    
    results.heatmap.push(row);
  }

  // Find best posting slots
  const slots = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const cell = engagementByTime[day][hour];
      if (cell.count > 0) {
        slots.push({
          day: dayNames[day],
          hour,
          avgEngagement: cell.total / cell.count,
          sampleSize: cell.count
        });
      }
    }
  }

  // Sort by engagement and take top 5
  slots.sort((a, b) => b.avgEngagement - a.avgEngagement);
  results.bestTimes = slots.slice(0, 5).map(slot => ({
    day: slot.day,
    time: formatHour(slot.hour),
    engagement: slot.avgEngagement.toFixed(2) + '%'
  }));

  // Find best days
  const dayStats = Object.entries(dayTotals)
    .map(([day, stats]) => ({
      day: dayNames[parseInt(day)],
      avgEngagement: stats.count > 0 ? stats.total / stats.count : 0
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement);
  
  results.bestDays = dayStats.slice(0, 3);

  return results;
}

/**
 * Format hour for display
 */
function formatHour(hour) {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

/**
 * Analyze content performance trends
 */
export function analyzeContentTrends(videos) {
  if (!videos || videos.length === 0) {
    return { trend: 'neutral', growth: 0, avgViews: 0, topPerformers: [] };
  }

  // Sort by date (newest first)
  const sorted = [...videos].sort((a, b) => 
    (b.createTime || 0) - (a.createTime || 0)
  );

  // Split into recent and older
  const midpoint = Math.floor(sorted.length / 2);
  const recent = sorted.slice(0, midpoint);
  const older = sorted.slice(midpoint);

  // Calculate average views for each period
  const recentAvg = recent.reduce((sum, v) => sum + (v.stats?.views || 0), 0) / recent.length;
  const olderAvg = older.reduce((sum, v) => sum + (v.stats?.views || 0), 0) / older.length;

  // Calculate growth rate
  const growth = olderAvg > 0 
    ? ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1)
    : 0;

  // Determine trend
  let trend = 'neutral';
  if (growth > 10) trend = 'growing';
  else if (growth < -10) trend = 'declining';

  // Find top performers
  const topPerformers = [...sorted]
    .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
    .slice(0, 5)
    .map(video => ({
      id: video.id,
      description: video.description?.substring(0, 50) + '...',
      views: video.stats?.views || 0,
      engagement: calculateVideoEngagement(video) + '%',
      hashtags: video.hashtags || []
    }));

  return {
    trend,
    growth: parseFloat(growth),
    avgViews: Math.round(recentAvg),
    avgViewsOlder: Math.round(olderAvg),
    topPerformers
  };
}

/**
 * Analyze hashtag performance
 */
export function analyzeHashtagPerformance(videos) {
  const hashtagStats = {};

  videos.forEach(video => {
    const hashtags = video.hashtags || [];
    const views = video.stats?.views || 0;
    const engagement = parseFloat(calculateVideoEngagement(video));

    hashtags.forEach(tag => {
      if (!hashtagStats[tag]) {
        hashtagStats[tag] = { 
          count: 0, 
          totalViews: 0, 
          totalEngagement: 0 
        };
      }
      hashtagStats[tag].count += 1;
      hashtagStats[tag].totalViews += views;
      hashtagStats[tag].totalEngagement += engagement;
    });
  });

  // Calculate averages and sort
  const ranked = Object.entries(hashtagStats)
    .map(([tag, stats]) => ({
      tag,
      useCount: stats.count,
      avgViews: Math.round(stats.totalViews / stats.count),
      avgEngagement: (stats.totalEngagement / stats.count).toFixed(2) + '%'
    }))
    .sort((a, b) => b.avgViews - a.avgViews);

  return {
    topByViews: ranked.slice(0, 10),
    topByUsage: [...ranked].sort((a, b) => b.useCount - a.useCount).slice(0, 10)
  };
}

/**
 * Generate growth prediction based on historical data
 */
export function predictGrowth(currentFollowers, videos, days = 30) {
  if (!videos || videos.length < 3) {
    return {
      predicted: currentFollowers,
      change: 0,
      changePercent: 0,
      confidence: 'low'
    };
  }

  // Calculate average engagement rate
  const avgEngagement = videos.reduce((sum, v) => 
    sum + parseFloat(calculateVideoEngagement(v)), 0) / videos.length;

  // Estimate daily follower gain based on engagement
  // This is a simplified model - real predictions need more data
  const dailyGrowthRate = avgEngagement * 0.001; // Convert engagement to growth estimate
  const predictedChange = Math.round(currentFollowers * dailyGrowthRate * days);
  
  const confidence = videos.length > 20 ? 'high' : videos.length > 10 ? 'medium' : 'low';

  return {
    predicted: currentFollowers + predictedChange,
    change: predictedChange,
    changePercent: ((predictedChange / currentFollowers) * 100).toFixed(1),
    confidence,
    timeframe: `${days} days`
  };
}

/**
 * Compare user against competitors
 */
export function compareWithCompetitors(userProfile, userVideos, competitors) {
  const userAvgEngagement = userVideos.length > 0
    ? userVideos.reduce((sum, v) => sum + parseFloat(calculateVideoEngagement(v)), 0) / userVideos.length
    : 0;

  const userAvgViews = userVideos.length > 0
    ? userVideos.reduce((sum, v) => sum + (v.stats?.views || 0), 0) / userVideos.length
    : 0;

  const comparison = {
    user: {
      username: userProfile.username,
      followers: userProfile.stats?.followers || 0,
      avgViews: Math.round(userAvgViews),
      avgEngagement: userAvgEngagement.toFixed(2) + '%'
    },
    competitors: competitors.map(comp => ({
      username: comp.username,
      followers: comp.stats?.followers || 0,
      avgViews: comp.avgViews || 0,
      avgEngagement: comp.avgEngagement || '0%'
    })),
    rankings: {
      followers: 1, // Position among competitors
      engagement: 1,
      views: 1
    }
  };

  // Calculate rankings
  const allFollowers = [
    comparison.user.followers,
    ...comparison.competitors.map(c => c.followers)
  ].sort((a, b) => b - a);
  
  comparison.rankings.followers = allFollowers.indexOf(comparison.user.followers) + 1;

  return comparison;
}

/**
 * Format large numbers for display
 */
export function formatNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Calculate time since timestamp
 */
export function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

export default {
  calculateEngagementRate,
  calculateVideoEngagement,
  analyzeBestPostingTimes,
  analyzeContentTrends,
  analyzeHashtagPerformance,
  predictGrowth,
  compareWithCompetitors,
  formatNumber,
  timeAgo
};
