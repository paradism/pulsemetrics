/**
 * TikTok Dashboard with Real API Integration
 * 
 * This component integrates with:
 * - RapidAPI for public TikTok data
 * - TikTok OAuth for personal analytics
 * - Analytics service for data processing
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, Eye, Heart, MessageCircle, Clock, Music, 
  Zap, Search, Bell, Settings, Play, ExternalLink, Flame, 
  Target, Calendar, LogOut, Plus, X, RefreshCw, AlertCircle,
  Loader2, User, Share2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area 
} from 'recharts';
import { useAuth } from '../lib/AuthContext';
import { 
  useDashboardData, 
  useUserSearch, 
  useTrendingHashtags 
} from '../services/hooks';
import { isApiConfigured } from '../services/tiktokApi';
import { formatNumber, timeAgo } from '../services/analytics';

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, change, changeType, loading }) => (
  <div className="metric-card">
    <div className="metric-icon">
      <Icon size={20} />
    </div>
    <div className="metric-content">
      <span className="metric-label">{label}</span>
      {loading ? (
        <span className="metric-value loading">
          <Loader2 size={20} className="spin" />
        </span>
      ) : (
        <>
          <span className="metric-value">{value}</span>
          {change && (
            <span className={`metric-change ${changeType}`}>
              {changeType === 'positive' ? '↑' : '↓'} {change}
            </span>
          )}
        </>
      )}
    </div>
  </div>
);

// Heatmap Cell for posting times
const HeatmapCell = ({ value }) => {
  const intensity = Math.min(value / 100, 1);
  const backgroundColor = `rgba(99, 102, 241, ${intensity * 0.8 + 0.1})`;
  return (
    <div 
      className="heatmap-cell" 
      style={{ backgroundColor }}
      title={`Engagement score: ${value}`}
    >
      {value > 80 && <Flame size={12} />}
    </div>
  );
};

// Add Competitor Modal
const AddCompetitorModal = ({ onClose, onAdd }) => {
  const [username, setUsername] = useState('');
  const { results, loading, search } = useUserSearch();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (username.length >= 2) {
        search(username);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [username, search]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Competitor</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value.replace('@', ''))}
            placeholder="Search TikTok username..."
            autoFocus
          />
          {loading && <Loader2 size={18} className="spin" />}
        </div>

        <div className="search-results">
          {results.map(user => (
            <button
              key={user.id}
              className="search-result-item"
              onClick={() => { onAdd(user.username); onClose(); }}
            >
              <div className="result-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="result-info">
                <span className="result-username">@{user.username}</span>
                <span className="result-followers">
                  {formatNumber(user.followers)} followers
                </span>
              </div>
              <Plus size={18} />
            </button>
          ))}
          {username.length >= 2 && !loading && results.length === 0 && (
            <p className="no-results">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function Dashboard({ connectedUsername }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  
  const { user, signOut, isDemoMode } = useAuth();
  
  // Fetch all dashboard data
  const {
    profile,
    videos,
    insights,
    trendingSounds,
    competitors,
    competitorData,
    addCompetitor,
    removeCompetitor,
    loading,
    error
  } = useDashboardData(connectedUsername);

  // Fetch trending hashtags
  const { hashtags: trendingHashtags } = useTrendingHashtags();

  // Check if API is configured
  const apiConfigured = isApiConfigured();

  // Generate chart data from videos
  const engagementData = videos?.slice(0, 7).reverse().map((video, i) => ({
    date: timeAgo(video.createTime).replace(' ago', ''),
    views: video.stats?.views || 0,
    likes: video.stats?.likes || 0,
    comments: video.stats?.comments || 0,
    shares: video.stats?.shares || 0
  })) || [];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="dashboard">
      {/* API Status Banner */}
      {!apiConfigured && (
        <div className="api-banner warning">
          <AlertCircle size={16} />
          <span>
            Running with mock data. Add <code>VITE_RAPIDAPI_KEY</code> to .env for real TikTok data.
          </span>
        </div>
      )}
      
      {isDemoMode && (
        <div className="api-banner demo">
          <Zap size={16} />
          <span>Demo Mode - Authentication simulated locally</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon"><Zap size={24} /></div>
          <span className="logo-text">PulseMetrics</span>
        </div>
        
        <nav className="nav">
          {['overview', 'content', 'best-times', 'sounds', 'competitors'].map(tab => (
            <button 
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && <TrendingUp size={18} />}
              {tab === 'content' && <Play size={18} />}
              {tab === 'best-times' && <Clock size={18} />}
              {tab === 'sounds' && <Music size={18} />}
              {tab === 'competitors' && <Target size={18} />}
              <span>{tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="nav-item sign-out" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
          {user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <span className="user-email">{user.email}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Analytics Dashboard</h1>
            {connectedUsername && (
              <span className="connected-account">@{connectedUsername}</span>
            )}
            <div className="time-selector">
              {['24h', '7d', '30d', '90d'].map(range => (
                <button 
                  key={range}
                  className={timeRange === range ? 'active' : ''}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
            </button>
            <button className="icon-btn"><Bell size={20} /></button>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="metrics-grid">
              <MetricCard 
                icon={Users} 
                label="Followers" 
                value={formatNumber(profile?.stats?.followers || 0)}
                change={insights?.growthPrediction?.changePercent ? `${insights.growthPrediction.changePercent}%` : null}
                changeType="positive"
                loading={loading}
              />
              <MetricCard 
                icon={Eye} 
                label="Total Views" 
                value={formatNumber(insights?.totalViews || 0)}
                change={insights?.contentTrends?.growth ? `${insights.contentTrends.growth}%` : null}
                changeType={insights?.contentTrends?.growth >= 0 ? 'positive' : 'negative'}
                loading={loading}
              />
              <MetricCard 
                icon={Heart} 
                label="Engagement Rate" 
                value={`${insights?.engagementRate || 0}%`}
                loading={loading}
              />
              <MetricCard 
                icon={MessageCircle} 
                label="Avg. Views" 
                value={formatNumber(insights?.avgViews || 0)}
                loading={loading}
              />
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Engagement Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatNumber} />
                    <Tooltip 
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f8fafc' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#6366f1" 
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Quick Insights</h3>
                <div className="insights-list">
                  {insights?.postingTimes?.bestTimes?.[0] && (
                    <div className="insight-item">
                      <Clock size={18} />
                      <div>
                        <strong>Best Posting Time</strong>
                        <span>{insights.postingTimes.bestTimes[0].day} at {insights.postingTimes.bestTimes[0].time}</span>
                      </div>
                    </div>
                  )}
                  {trendingSounds?.[0] && (
                    <div className="insight-item">
                      <Music size={18} />
                      <div>
                        <strong>Trending Sound</strong>
                        <span>{trendingSounds[0].title}</span>
                      </div>
                    </div>
                  )}
                  {insights?.growthPrediction && (
                    <div className="insight-item">
                      <TrendingUp size={18} />
                      <div>
                        <strong>Growth Prediction</strong>
                        <span>+{formatNumber(insights.growthPrediction.change)} followers in {insights.growthPrediction.timeframe}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="content-section">
              <h3>Top Performing Content</h3>
              <div className="content-table">
                <div className="table-header">
                  <span>Content</span>
                  <span>Views</span>
                  <span>Likes</span>
                  <span>Comments</span>
                  <span>Engagement</span>
                </div>
                {loading ? (
                  <div className="loading-state"><Loader2 size={24} className="spin" /></div>
                ) : (
                  insights?.contentTrends?.topPerformers?.map((video, i) => (
                    <div key={video.id || i} className="table-row">
                      <span className="content-title">{video.description || 'Untitled'}</span>
                      <span>{formatNumber(video.views)}</span>
                      <span>{formatNumber(video.likes || 0)}</span>
                      <span>{formatNumber(video.comments || 0)}</span>
                      <span className="engagement-badge">{video.engagement}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="tab-content">
            <div className="content-section">
              <h3>All Videos ({videos?.length || 0})</h3>
              <div className="video-grid">
                {loading ? (
                  <div className="loading-state"><Loader2 size={32} className="spin" /></div>
                ) : (
                  videos?.map((video, i) => (
                    <div key={video.id || i} className="video-card">
                      <div className="video-thumbnail">
                        {video.video?.cover ? (
                          <img src={video.video.cover} alt="" />
                        ) : (
                          <Play size={32} />
                        )}
                      </div>
                      <div className="video-info">
                        <p className="video-title">{video.description?.substring(0, 60) || 'Untitled'}...</p>
                        <div className="video-stats">
                          <span><Eye size={14} /> {formatNumber(video.stats?.views || 0)}</span>
                          <span><Heart size={14} /> {formatNumber(video.stats?.likes || 0)}</span>
                          <span><MessageCircle size={14} /> {formatNumber(video.stats?.comments || 0)}</span>
                        </div>
                        <span className="video-date">{timeAgo(video.createTime)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Best Times Tab */}
        {activeTab === 'best-times' && (
          <div className="tab-content">
            <div className="content-section">
              <h3>Best Posting Times</h3>
              <p className="section-desc">Based on engagement analysis of your recent videos</p>
              
              <div className="heatmap-container">
                <div className="heatmap-header">
                  <span></span>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                {insights?.postingTimes?.heatmap?.filter((_, i) => i % 3 === 0).map((row, i) => (
                  <div key={i} className="heatmap-row">
                    <span className="hour-label">{row.hour}</span>
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                      <HeatmapCell key={day} value={row[day] || 0} />
                    ))}
                  </div>
                ))}
              </div>

              <div className="best-times-summary">
                <h4>Top Posting Windows</h4>
                <div className="times-list">
                  {insights?.postingTimes?.bestTimes?.map((time, i) => (
                    <div key={i} className="time-item">
                      <span className="time-rank">#{i + 1}</span>
                      <span className="time-slot">{time.day} at {time.time}</span>
                      <span className="time-engagement">{time.engagement} engagement</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sounds Tab */}
        {activeTab === 'sounds' && (
          <div className="tab-content">
            <div className="content-section">
              <h3>Trending Sounds</h3>
              <p className="section-desc">Popular sounds to boost your reach</p>
              
              <div className="sounds-list">
                {loading ? (
                  <div className="loading-state"><Loader2 size={24} className="spin" /></div>
                ) : (
                  trendingSounds?.map((sound, i) => (
                    <div key={sound.id || i} className="sound-item">
                      <div className="sound-rank">#{i + 1}</div>
                      <div className="sound-icon"><Music size={24} /></div>
                      <div className="sound-info">
                        <span className="sound-name">{sound.title}</span>
                        <span className="sound-author">by {sound.author}</span>
                      </div>
                      <div className="sound-stats">
                        <span className="sound-usage">{formatNumber(sound.usageCount)} uses</span>
                        {sound.growth && (
                          <span className="sound-growth">{sound.growth}</span>
                        )}
                      </div>
                      <div className="sound-heat">
                        <div className="heat-bar" style={{ width: `${Math.min((sound.usageCount / 5000000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {trendingHashtags?.length > 0 && (
                <>
                  <h3 style={{ marginTop: '32px' }}>Trending Hashtags</h3>
                  <div className="hashtags-grid">
                    {trendingHashtags.slice(0, 10).map((tag, i) => (
                      <div key={tag.id || i} className="hashtag-item">
                        <span className="hashtag-name">#{tag.name}</span>
                        <span className="hashtag-views">{formatNumber(tag.viewCount)} views</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === 'competitors' && (
          <div className="tab-content">
            <div className="content-section">
              <div className="section-header">
                <div>
                  <h3>Competitor Tracking</h3>
                  <p className="section-desc">Monitor your competition's performance</p>
                </div>
                <button 
                  className="add-btn"
                  onClick={() => setShowAddCompetitor(true)}
                >
                  <Plus size={18} />
                  Add Competitor
                </button>
              </div>

              {competitors.length === 0 ? (
                <div className="empty-state">
                  <Target size={48} />
                  <h4>No competitors tracked yet</h4>
                  <p>Add competitors to compare your performance</p>
                  <button 
                    className="add-btn primary"
                    onClick={() => setShowAddCompetitor(true)}
                  >
                    <Plus size={18} />
                    Add Your First Competitor
                  </button>
                </div>
              ) : (
                <div className="competitors-grid">
                  {/* Your stats */}
                  {profile && (
                    <div className="competitor-card you">
                      <div className="competitor-header">
                        <div className="competitor-avatar you">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.username} />
                          ) : (
                            <User size={24} />
                          )}
                        </div>
                        <div className="competitor-info">
                          <span className="competitor-name">@{profile.username}</span>
                          <span className="you-badge">You</span>
                        </div>
                      </div>
                      <div className="competitor-stats">
                        <div className="stat">
                          <span className="stat-value">{formatNumber(profile.stats?.followers || 0)}</span>
                          <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{formatNumber(insights?.avgViews || 0)}</span>
                          <span className="stat-label">Avg Views</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{insights?.engagementRate || 0}%</span>
                          <span className="stat-label">Engagement</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Competitors */}
                  {competitors.map(username => {
                    const data = competitorData[username];
                    return (
                      <div key={username} className="competitor-card">
                        <button 
                          className="remove-competitor"
                          onClick={() => removeCompetitor(username)}
                        >
                          <X size={16} />
                        </button>
                        <div className="competitor-header">
                          <div className="competitor-avatar">
                            {data?.avatar ? (
                              <img src={data.avatar} alt={username} />
                            ) : (
                              <User size={24} />
                            )}
                          </div>
                          <div className="competitor-info">
                            <span className="competitor-name">@{username}</span>
                            {data?.verified && <span className="verified">✓</span>}
                          </div>
                        </div>
                        {data ? (
                          <div className="competitor-stats">
                            <div className="stat">
                              <span className="stat-value">{formatNumber(data.stats?.followers || 0)}</span>
                              <span className="stat-label">Followers</span>
                            </div>
                            <div className="stat">
                              <span className="stat-value">{formatNumber(data.avgViews || 0)}</span>
                              <span className="stat-label">Avg Views</span>
                            </div>
                            <div className="stat">
                              <span className="stat-value">{data.avgEngagement}</span>
                              <span className="stat-label">Engagement</span>
                            </div>
                          </div>
                        ) : (
                          <div className="loading-state small">
                            <Loader2 size={20} className="spin" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Competitor Modal */}
      {showAddCompetitor && (
        <AddCompetitorModal 
          onClose={() => setShowAddCompetitor(false)}
          onAdd={addCompetitor}
        />
      )}
    </div>
  );
}
