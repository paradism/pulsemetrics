import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Eye, Heart, MessageCircle, Clock, Music, Zap, ChevronDown, Search, Bell, Settings, Play, ExternalLink, Flame, Target, Calendar, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Mock data for demonstration
const engagementData = [
  { date: 'Jan 1', views: 45000, likes: 3200, comments: 180, shares: 420 },
  { date: 'Jan 8', views: 52000, likes: 4100, comments: 220, shares: 510 },
  { date: 'Jan 15', views: 48000, likes: 3800, comments: 195, shares: 480 },
  { date: 'Jan 22', views: 67000, likes: 5200, comments: 310, shares: 680 },
  { date: 'Jan 29', views: 72000, likes: 5800, comments: 340, shares: 720 },
  { date: 'Feb 5', views: 85000, likes: 6900, comments: 420, shares: 890 },
  { date: 'Feb 12', views: 91000, likes: 7400, comments: 480, shares: 950 },
];

const postingTimeData = [
  { hour: '6am', mon: 12, tue: 18, wed: 15, thu: 22, fri: 28, sat: 45, sun: 52 },
  { hour: '9am', mon: 35, tue: 42, wed: 38, thu: 45, fri: 52, sat: 68, sun: 72 },
  { hour: '12pm', mon: 65, tue: 72, wed: 68, thu: 75, fri: 82, sat: 88, sun: 85 },
  { hour: '3pm', mon: 78, tue: 85, wed: 82, thu: 88, fri: 92, sat: 75, sun: 70 },
  { hour: '6pm', mon: 92, tue: 95, wed: 98, thu: 96, fri: 88, sat: 82, sun: 78 },
  { hour: '9pm', mon: 88, tue: 92, wed: 95, thu: 90, fri: 72, sat: 65, sun: 62 },
];

const recentVideos = [
  { id: 1, thumbnail: '🎬', title: 'Day in my life as a creator', views: 124000, likes: 8900, comments: 342, date: '2 days ago', growth: '+23%' },
  { id: 2, thumbnail: '🎤', title: 'Viral sound tutorial', views: 89000, likes: 6200, comments: 218, date: '5 days ago', growth: '+15%' },
  { id: 3, thumbnail: '✨', title: 'Get ready with me', views: 67000, likes: 4800, comments: 156, date: '1 week ago', growth: '+8%' },
  { id: 4, thumbnail: '🎯', title: 'Marketing tips that work', views: 45000, likes: 3100, comments: 98, date: '2 weeks ago', growth: '-2%' },
];

const trendingSounds = [
  { id: 1, name: 'Original Sound - @musicmaker', uses: '2.4M', growth: '+340%', category: 'Music', heat: 98 },
  { id: 2, name: 'Aesthetic vibes remix', uses: '1.8M', growth: '+220%', category: 'Ambient', heat: 92 },
  { id: 3, name: 'Voiceover trending clip', uses: '890K', growth: '+180%', category: 'Voice', heat: 85 },
  { id: 4, name: 'Dance challenge beat', uses: '650K', growth: '+150%', category: 'Dance', heat: 78 },
  { id: 5, name: 'ASMR cooking sounds', uses: '420K', growth: '+120%', category: 'ASMR', heat: 72 },
];

const competitors = [
  { name: '@competitor1', followers: '1.2M', avgViews: '89K', engagement: '8.2%', trend: 'up' },
  { name: '@competitor2', followers: '890K', avgViews: '72K', engagement: '7.8%', trend: 'up' },
  { name: '@competitor3', followers: '650K', avgViews: '45K', engagement: '6.5%', trend: 'down' },
];

const MetricCard = ({ icon: Icon, label, value, change, changeType }) => (
  <div className="metric-card">
    <div className="metric-icon">
      <Icon size={20} />
    </div>
    <div className="metric-content">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      <span className={`metric-change ${changeType}`}>
        {changeType === 'positive' ? '↑' : '↓'} {change}
      </span>
    </div>
  </div>
);

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

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const { user, signOut, isDemoMode } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="dashboard">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <span>🎯 Demo Mode - Add Supabase credentials to enable real authentication</span>
        </div>
      )}
      
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={24} />
          </div>
          <span className="logo-text">PulseMetrics</span>
        </div>
        
        <nav className="nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={18} />
            <span>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Play size={18} />
            <span>Content</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'timing' ? 'active' : ''}`}
            onClick={() => setActiveTab('timing')}
          >
            <Clock size={18} />
            <span>Best Times</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'sounds' ? 'active' : ''}`}
            onClick={() => setActiveTab('sounds')}
          >
            <Music size={18} />
            <span>Trending</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'competitors' ? 'active' : ''}`}
            onClick={() => setActiveTab('competitors')}
          >
            <Target size={18} />
            <span>Competitors</span>
          </button>
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
            <div className="time-selector">
              {['24h', '7d', '30d', '90d'].map(range => (
                <button 
                  key={range}
                  className={`time-btn ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="header-right">
            <div className="search-box">
              <Search size={16} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="icon-btn">
              <Bell size={18} />
              <span className="notification-dot"></span>
            </button>
            <div className="avatar">M</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content">
          {activeTab === 'overview' && (
            <>
              {/* Metrics Row */}
              <div className="metrics-grid">
                <MetricCard icon={Users} label="Followers" value="142.8K" change="12.4%" changeType="positive" />
                <MetricCard icon={Eye} label="Total Views" value="2.4M" change="18.2%" changeType="positive" />
                <MetricCard icon={Heart} label="Engagement Rate" value="8.7%" change="2.1%" changeType="positive" />
                <MetricCard icon={MessageCircle} label="Comments" value="12.4K" change="5.3%" changeType="negative" />
              </div>

              {/* Charts Row */}
              <div className="charts-grid">
                <div className="chart-card large">
                  <div className="chart-header">
                    <h3>Engagement Over Time</h3>
                    <div className="chart-legend">
                      <span className="legend-item views">Views</span>
                      <span className="legend-item likes">Likes</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={engagementData}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="likesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v/1000}K`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                        }}
                        labelStyle={{ color: '#f8fafc' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#viewsGradient)" />
                      <Area type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} fill="url(#likesGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Top Performing Content</h3>
                  </div>
                  <div className="video-list">
                    {recentVideos.slice(0, 3).map(video => (
                      <div key={video.id} className="video-item">
                        <div className="video-thumbnail">{video.thumbnail}</div>
                        <div className="video-info">
                          <span className="video-title">{video.title}</span>
                          <span className="video-stats">{(video.views/1000).toFixed(0)}K views</span>
                        </div>
                        <span className={`video-growth ${video.growth.startsWith('+') ? 'positive' : 'negative'}`}>
                          {video.growth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="insights-row">
                <div className="insight-card">
                  <div className="insight-icon best-time">
                    <Clock size={20} />
                  </div>
                  <div className="insight-content">
                    <span className="insight-label">Best Time to Post</span>
                    <span className="insight-value">6:00 PM - 9:00 PM</span>
                    <span className="insight-detail">Wednesday & Thursday</span>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon trending">
                    <Music size={20} />
                  </div>
                  <div className="insight-content">
                    <span className="insight-label">Trending Sound</span>
                    <span className="insight-value">Original Sound - @musicmaker</span>
                    <span className="insight-detail">+340% this week</span>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon growth">
                    <TrendingUp size={20} />
                  </div>
                  <div className="insight-content">
                    <span className="insight-label">Growth Prediction</span>
                    <span className="insight-value">+15K followers</span>
                    <span className="insight-detail">Next 30 days estimate</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'content' && (
            <div className="content-section">
              <div className="section-header">
                <h2>Content Performance</h2>
                <button className="btn-secondary">
                  <Calendar size={16} />
                  Filter by date
                </button>
              </div>
              <div className="content-table">
                <div className="table-header">
                  <span>Video</span>
                  <span>Views</span>
                  <span>Likes</span>
                  <span>Comments</span>
                  <span>Posted</span>
                  <span>Growth</span>
                </div>
                {recentVideos.map(video => (
                  <div key={video.id} className="table-row">
                    <div className="video-cell">
                      <div className="video-thumbnail">{video.thumbnail}</div>
                      <span>{video.title}</span>
                    </div>
                    <span>{(video.views/1000).toFixed(0)}K</span>
                    <span>{(video.likes/1000).toFixed(1)}K</span>
                    <span>{video.comments}</span>
                    <span>{video.date}</span>
                    <span className={`growth-badge ${video.growth.startsWith('+') ? 'positive' : 'negative'}`}>
                      {video.growth}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timing' && (
            <div className="timing-section">
              <div className="section-header">
                <h2>Best Times to Post</h2>
                <p className="section-subtitle">Based on your audience engagement patterns</p>
              </div>
              
              <div className="heatmap-card">
                <div className="heatmap-header">
                  <span></span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
                {postingTimeData.map((row, i) => (
                  <div key={i} className="heatmap-row">
                    <span className="heatmap-label">{row.hour}</span>
                    <HeatmapCell value={row.mon} />
                    <HeatmapCell value={row.tue} />
                    <HeatmapCell value={row.wed} />
                    <HeatmapCell value={row.thu} />
                    <HeatmapCell value={row.fri} />
                    <HeatmapCell value={row.sat} />
                    <HeatmapCell value={row.sun} />
                  </div>
                ))}
                <div className="heatmap-legend">
                  <span>Low engagement</span>
                  <div className="legend-gradient"></div>
                  <span>High engagement</span>
                </div>
              </div>

              <div className="timing-insights">
                <div className="timing-insight-card">
                  <Flame size={24} className="fire-icon" />
                  <h4>Peak Hours</h4>
                  <p>Your audience is most active between <strong>6PM - 9PM</strong> on weekdays</p>
                </div>
                <div className="timing-insight-card">
                  <Calendar size={24} className="calendar-icon" />
                  <h4>Best Days</h4>
                  <p><strong>Wednesday</strong> and <strong>Thursday</strong> show highest engagement rates</p>
                </div>
                <div className="timing-insight-card">
                  <Target size={24} className="target-icon" />
                  <h4>Recommendation</h4>
                  <p>Schedule your next post for <strong>Wed 6:30 PM</strong> for maximum reach</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sounds' && (
            <div className="sounds-section">
              <div className="section-header">
                <h2>Trending Sounds</h2>
                <p className="section-subtitle">Sounds gaining traction in your niche</p>
              </div>
              
              <div className="sounds-grid">
                {trendingSounds.map((sound, index) => (
                  <div key={sound.id} className="sound-card">
                    <div className="sound-rank">#{index + 1}</div>
                    <div className="sound-info">
                      <div className="sound-header">
                        <Music size={18} />
                        <span className="sound-name">{sound.name}</span>
                      </div>
                      <div className="sound-meta">
                        <span className="sound-uses">{sound.uses} uses</span>
                        <span className="sound-category">{sound.category}</span>
                      </div>
                    </div>
                    <div className="sound-stats">
                      <div className="heat-meter">
                        <div className="heat-fill" style={{ width: `${sound.heat}%` }}></div>
                      </div>
                      <span className="sound-growth">{sound.growth}</span>
                    </div>
                    <button className="use-sound-btn">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="sound-tip">
                <Zap size={20} />
                <p><strong>Pro Tip:</strong> Using trending sounds within the first 24-48 hours of their rise can increase your reach by up to 3x</p>
              </div>
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="competitors-section">
              <div className="section-header">
                <h2>Competitor Analysis</h2>
                <button className="btn-primary">
                  + Add Competitor
                </button>
              </div>

              <div className="competitors-grid">
                {competitors.map((comp, i) => (
                  <div key={i} className="competitor-card">
                    <div className="competitor-header">
                      <div className="competitor-avatar">{comp.name.charAt(1).toUpperCase()}</div>
                      <div className="competitor-name">
                        <span>{comp.name}</span>
                        <span className={`trend-indicator ${comp.trend}`}>
                          {comp.trend === 'up' ? '↑ Growing' : '↓ Declining'}
                        </span>
                      </div>
                    </div>
                    <div className="competitor-stats">
                      <div className="comp-stat">
                        <span className="comp-stat-label">Followers</span>
                        <span className="comp-stat-value">{comp.followers}</span>
                      </div>
                      <div className="comp-stat">
                        <span className="comp-stat-label">Avg Views</span>
                        <span className="comp-stat-value">{comp.avgViews}</span>
                      </div>
                      <div className="comp-stat">
                        <span className="comp-stat-label">Engagement</span>
                        <span className="comp-stat-value">{comp.engagement}</span>
                      </div>
                    </div>
                    <button className="view-details-btn">View Full Analysis</button>
                  </div>
                ))}
              </div>

              <div className="comparison-chart">
                <h3>Your Performance vs Competitors</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { metric: 'Followers', you: 142, comp1: 1200, comp2: 890, comp3: 650 },
                    { metric: 'Avg Views', you: 45, comp1: 89, comp2: 72, comp3: 45 },
                    { metric: 'Engagement', you: 8.7, comp1: 8.2, comp2: 7.8, comp3: 6.5 },
                  ]}>
                    <XAxis dataKey="metric" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: 'none', 
                        borderRadius: '8px' 
                      }}
                    />
                    <Bar dataKey="you" fill="#6366f1" radius={[4, 4, 0, 0]} name="You" />
                    <Bar dataKey="comp1" fill="#64748b" radius={[4, 4, 0, 0]} name="@competitor1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #0f172a;
          font-family: 'DM Sans', sans-serif;
          color: #f8fafc;
        }

        /* Sidebar */
        .sidebar {
          width: 240px;
          background: #1e293b;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #334155;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px 24px;
          border-bottom: 1px solid #334155;
          margin-bottom: 24px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-weight: 700;
          font-size: 18px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .nav-item:hover {
          background: #334155;
          color: #f8fafc;
        }

        .nav-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          color: #f8fafc;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          width: 3px;
          height: 24px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          border-top: 1px solid #334155;
          padding-top: 16px;
        }

        /* Main Content */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background: #1e293b;
          border-bottom: 1px solid #334155;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .header-left h1 {
          font-size: 24px;
          font-weight: 700;
        }

        .time-selector {
          display: flex;
          gap: 4px;
          background: #0f172a;
          padding: 4px;
          border-radius: 8px;
        }

        .time-btn {
          padding: 8px 16px;
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .time-btn:hover {
          color: #f8fafc;
        }

        .time-btn.active {
          background: #6366f1;
          color: #fff;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #0f172a;
          border-radius: 8px;
          border: 1px solid #334155;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 14px;
          outline: none;
          width: 180px;
          font-family: inherit;
        }

        .search-box input::placeholder {
          color: #64748b;
        }

        .search-box svg {
          color: #64748b;
        }

        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          border-color: #6366f1;
          color: #f8fafc;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ec4899;
          border-radius: 50%;
        }

        .avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 16px;
        }

        /* Content */
        .content {
          padding: 32px;
          flex: 1;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .metric-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          border: 1px solid #334155;
          transition: all 0.3s;
        }

        .metric-card:hover {
          border-color: #6366f1;
          transform: translateY(-2px);
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .metric-content {
          display: flex;
          flex-direction: column;
        }

        .metric-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 24px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .metric-change {
          font-size: 12px;
          font-weight: 500;
          margin-top: 4px;
        }

        .metric-change.positive {
          color: #22c55e;
        }

        .metric-change.negative {
          color: #ef4444;
        }

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #334155;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h3 {
          font-size: 16px;
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          gap: 16px;
        }

        .legend-item {
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-item::before {
          content: '';
          width: 12px;
          height: 3px;
          border-radius: 2px;
        }

        .legend-item.views::before {
          background: #6366f1;
        }

        .legend-item.likes::before {
          background: #ec4899;
        }

        /* Video List */
        .video-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .video-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #0f172a;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .video-item:hover {
          background: #334155;
        }

        .video-thumbnail {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .video-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .video-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .video-stats {
          font-size: 12px;
          color: #64748b;
        }

        .video-growth {
          font-size: 13px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        .video-growth.positive {
          color: #22c55e;
        }

        .video-growth.negative {
          color: #ef4444;
        }

        /* Insights Row */
        .insights-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .insight-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 16px;
          border: 1px solid #334155;
        }

        .insight-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .insight-icon.best-time {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .insight-icon.trending {
          background: rgba(236, 72, 153, 0.2);
          color: #ec4899;
        }

        .insight-icon.growth {
          background: rgba(99, 102, 241, 0.2);
          color: #6366f1;
        }

        .insight-content {
          display: flex;
          flex-direction: column;
        }

        .insight-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .insight-value {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .insight-detail {
          font-size: 12px;
          color: #6366f1;
        }

        /* Section Headers */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
        }

        .section-subtitle {
          color: #64748b;
          font-size: 14px;
          margin-top: 4px;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #334155;
          border: none;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-secondary:hover {
          background: #475569;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        /* Content Table */
        .content-table {
          background: #1e293b;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #334155;
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
          padding: 16px 24px;
          align-items: center;
        }

        .table-header {
          background: #0f172a;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          border-top: 1px solid #334155;
          font-size: 14px;
          transition: background 0.2s;
        }

        .table-row:hover {
          background: #334155;
        }

        .video-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .growth-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        .growth-badge.positive {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .growth-badge.negative {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        /* Heatmap */
        .heatmap-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #334155;
          margin-bottom: 24px;
        }

        .heatmap-header, .heatmap-row {
          display: grid;
          grid-template-columns: 60px repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }

        .heatmap-header span {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-align: center;
        }

        .heatmap-label {
          font-size: 12px;
          color: #64748b;
          display: flex;
          align-items: center;
        }

        .heatmap-cell {
          height: 40px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: transform 0.2s;
          cursor: pointer;
        }

        .heatmap-cell:hover {
          transform: scale(1.1);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
          font-size: 12px;
          color: #64748b;
        }

        .legend-gradient {
          width: 120px;
          height: 8px;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.9) 100%);
          border-radius: 4px;
        }

        /* Timing Insights */
        .timing-insights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .timing-insight-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #334155;
          text-align: center;
        }

        .timing-insight-card svg {
          margin-bottom: 12px;
        }

        .timing-insight-card .fire-icon {
          color: #f97316;
        }

        .timing-insight-card .calendar-icon {
          color: #6366f1;
        }

        .timing-insight-card .target-icon {
          color: #22c55e;
        }

        .timing-insight-card h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .timing-insight-card p {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .timing-insight-card strong {
          color: #f8fafc;
        }

        /* Sounds Section */
        .sounds-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .sound-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #1e293b;
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid #334155;
          transition: all 0.2s;
        }

        .sound-card:hover {
          border-color: #6366f1;
        }

        .sound-rank {
          font-size: 18px;
          font-weight: 700;
          color: #6366f1;
          font-family: 'JetBrains Mono', monospace;
          width: 40px;
        }

        .sound-info {
          flex: 1;
        }

        .sound-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .sound-header svg {
          color: #ec4899;
        }

        .sound-name {
          font-weight: 500;
        }

        .sound-meta {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #64748b;
        }

        .sound-category {
          padding: 2px 8px;
          background: #334155;
          border-radius: 4px;
        }

        .sound-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          width: 120px;
        }

        .heat-meter {
          width: 100%;
          height: 6px;
          background: #334155;
          border-radius: 3px;
          overflow: hidden;
        }

        .heat-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #ec4899 100%);
          border-radius: 3px;
        }

        .sound-growth {
          font-size: 13px;
          font-weight: 600;
          color: #22c55e;
          font-family: 'JetBrains Mono', monospace;
        }

        .use-sound-btn {
          width: 36px;
          height: 36px;
          background: #334155;
          border: none;
          border-radius: 8px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .use-sound-btn:hover {
          background: #6366f1;
          color: #fff;
        }

        .sound-tip {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
        }

        .sound-tip svg {
          color: #6366f1;
          flex-shrink: 0;
        }

        .sound-tip p {
          font-size: 14px;
          color: #94a3b8;
        }

        .sound-tip strong {
          color: #f8fafc;
        }

        /* Competitors Section */
        .competitors-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }

        .competitor-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #334155;
        }

        .competitor-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .competitor-avatar {
          width: 48px;
          height: 48px;
          background: #334155;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 18px;
        }

        .competitor-name span:first-child {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .trend-indicator {
          font-size: 12px;
          font-weight: 500;
        }

        .trend-indicator.up {
          color: #22c55e;
        }

        .trend-indicator.down {
          color: #ef4444;
        }

        .competitor-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .comp-stat {
          display: flex;
          justify-content: space-between;
        }

        .comp-stat-label {
          color: #64748b;
          font-size: 13px;
        }

        .comp-stat-value {
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        .view-details-btn {
          width: 100%;
          padding: 12px;
          background: #334155;
          border: none;
          border-radius: 8px;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .view-details-btn:hover {
          background: #475569;
        }

        .comparison-chart {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #334155;
        }

        .comparison-chart h3 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .charts-grid {
            grid-template-columns: 1fr;
          }
          
          .insights-row,
          .timing-insights,
          .competitors-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
          
          .header {
            flex-direction: column;
            gap: 16px;
          }
          
          .header-left,
          .header-right {
            width: 100%;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        .demo-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          text-align: center;
          padding: 8px;
          font-size: 13px;
          font-weight: 500;
          z-index: 1000;
        }

        .sign-out:hover {
          color: #ef4444 !important;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          margin-top: 8px;
          border-top: 1px solid #334155;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .user-email {
          font-size: 12px;
          color: #94a3b8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 140px;
        }
      `}</style>
    </div>
  );
}

// Main App Component with Authentication
function AppContent() {
  const { user, loading, signIn, signUp, signInWithGoogle, signInWithTikTok, resetPassword } = useAuth();
  const [authPage, setAuthPage] = useState('login'); // 'login', 'signup', 'forgot'

  // Listen for auth events from child components
  useEffect(() => {
    const handleSignIn = async (e) => {
      const { email, password } = e.detail;
      await signIn(email, password);
    };

    const handleSignUp = async (e) => {
      const { email, password, fullName } = e.detail;
      await signUp(email, password, fullName);
    };

    const handleGoogle = async () => {
      await signInWithGoogle();
    };

    const handleTikTok = async () => {
      await signInWithTikTok();
    };

    const handleResetPassword = async (e) => {
      const { email } = e.detail;
      await resetPassword(email);
    };

    window.addEventListener('auth:signin', handleSignIn);
    window.addEventListener('auth:signup', handleSignUp);
    window.addEventListener('auth:google', handleGoogle);
    window.addEventListener('auth:tiktok', handleTikTok);
    window.addEventListener('auth:reset-password', handleResetPassword);

    return () => {
      window.removeEventListener('auth:signin', handleSignIn);
      window.removeEventListener('auth:signup', handleSignUp);
      window.removeEventListener('auth:google', handleGoogle);
      window.removeEventListener('auth:tiktok', handleTikTok);
      window.removeEventListener('auth:reset-password', handleResetPassword);
    };
  }, [signIn, signUp, signInWithGoogle, signInWithTikTok, resetPassword]);

  // Loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <Zap size={32} />
          </div>
          <div className="loading-spinner-large"></div>
        </div>
        <style>{`
          .loading-screen {
            min-height: 100vh;
            background: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', system-ui, sans-serif;
          }
          .loading-content {
            text-align: center;
          }
          .loading-logo {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin: 0 auto 24px;
          }
          .loading-spinner-large {
            width: 32px;
            height: 32px;
            border: 3px solid #334155;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Authenticated - show dashboard
  if (user) {
    return <Dashboard />;
  }

  // Not authenticated - show auth pages
  if (authPage === 'signup') {
    return (
      <SignupPage 
        onSwitchToLogin={() => setAuthPage('login')} 
      />
    );
  }

  if (authPage === 'forgot') {
    return (
      <ForgotPasswordPage 
        onBackToLogin={() => setAuthPage('login')} 
      />
    );
  }

  return (
    <LoginPage 
      onSwitchToSignup={() => setAuthPage('signup')}
      onForgotPassword={() => setAuthPage('forgot')}
    />
  );
}

// Root App with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
