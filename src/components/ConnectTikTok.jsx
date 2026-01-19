/**
 * Connect TikTok Account Component
 * 
 * Allows users to connect their TikTok account by:
 * 1. Entering their username (for public data via RapidAPI)
 * 2. OAuth login (for personal analytics - requires TikTok developer approval)
 */

import React, { useState } from 'react';
import { Search, User, Link2, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { getUserProfile } from '../services/tiktokApi';
import { isTikTokOAuthConfigured, initiateTikTokAuth } from './tiktokOAuth';

export default function ConnectTikTok({ onConnect, currentUsername }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewProfile, setPreviewProfile] = useState(null);

  const handleSearch = async () => {
    if (!username.trim()) return;

    const cleaned = username.replace('@', '').trim();
    setLoading(true);
    setError('');
    setPreviewProfile(null);

    try {
      const profile = await getUserProfile(cleaned);
      setPreviewProfile(profile);
    } catch (err) {
      setError('Could not find this user. Check the username and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (previewProfile) {
      onConnect(previewProfile.username);
    }
  };

  const handleOAuth = async () => {
    try {
      await initiateTikTokAuth();
    } catch (err) {
      setError('OAuth not configured. Please add TikTok credentials.');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="connect-tiktok">
      <div className="connect-card">
        <div className="connect-header">
          <div className="connect-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
          <h2>Connect Your TikTok</h2>
          <p>Enter your TikTok username to start tracking your analytics</p>
        </div>

        {currentUsername && (
          <div className="current-connection">
            <CheckCircle size={16} />
            <span>Currently tracking: <strong>@{currentUsername}</strong></span>
          </div>
        )}

        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="at-symbol">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch} 
              disabled={loading || !username.trim()}
              className="search-btn"
            >
              {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {previewProfile && (
          <div className="profile-preview">
            <div className="profile-header">
              <div className="profile-avatar">
                {previewProfile.avatar ? (
                  <img src={previewProfile.avatar} alt={previewProfile.username} />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div className="profile-info">
                <h3>@{previewProfile.username}</h3>
                <p>{previewProfile.nickname}</p>
                {previewProfile.verified && (
                  <span className="verified-badge">✓ Verified</span>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{formatNumber(previewProfile.stats?.followers || 0)}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatNumber(previewProfile.stats?.following || 0)}</span>
                <span className="stat-label">Following</span>
              </div>
              <div className="stat">
                <span className="stat-value">{formatNumber(previewProfile.stats?.likes || 0)}</span>
                <span className="stat-label">Likes</span>
              </div>
              <div className="stat">
                <span className="stat-value">{previewProfile.stats?.videos || 0}</span>
                <span className="stat-label">Videos</span>
              </div>
            </div>

            {previewProfile.bio && (
              <p className="profile-bio">{previewProfile.bio}</p>
            )}

            <button onClick={handleConnect} className="connect-btn">
              <Link2 size={18} />
              Connect This Account
            </button>
          </div>
        )}

        <div className="divider">
          <span>or</span>
        </div>

        <div className="oauth-section">
          <button 
            onClick={handleOAuth} 
            className="oauth-btn"
            disabled={!isTikTokOAuthConfigured()}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            Sign in with TikTok
            <ExternalLink size={14} />
          </button>
          <p className="oauth-note">
            {isTikTokOAuthConfigured() 
              ? 'Connect your official TikTok account for personal analytics'
              : 'OAuth requires TikTok developer credentials'}
          </p>
        </div>

        <div className="info-box">
          <h4>📊 What data can we access?</h4>
          <ul>
            <li><strong>Username lookup:</strong> Public profile, video stats, engagement metrics</li>
            <li><strong>OAuth login:</strong> Personal analytics, detailed insights (requires TikTok approval)</li>
          </ul>
          <p>We never post on your behalf or access private messages.</p>
        </div>
      </div>

      <style>{`
        .connect-tiktok {
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .connect-card {
          width: 100%;
          max-width: 480px;
          background: #1e293b;
          border-radius: 24px;
          padding: 40px;
          border: 1px solid #334155;
        }

        .connect-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .connect-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #25f4ee 0%, #fe2c55 50%, #000 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
        }

        .connect-header h2 {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .connect-header p {
          color: #64748b;
          font-size: 15px;
        }

        .current-connection {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          color: #22c55e;
          font-size: 14px;
          margin-bottom: 24px;
        }

        .current-connection strong {
          color: #4ade80;
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 4px;
          transition: all 0.2s;
        }

        .search-input-wrapper:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .at-symbol {
          padding: 12px 0 12px 16px;
          color: #64748b;
          font-weight: 500;
        }

        .search-input-wrapper input {
          flex: 1;
          padding: 12px 8px;
          background: transparent;
          border: none;
          color: #f8fafc;
          font-size: 15px;
          outline: none;
          font-family: inherit;
        }

        .search-input-wrapper input::placeholder {
          color: #475569;
        }

        .search-btn {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .search-btn:hover:not(:disabled) {
          transform: scale(1.05);
        }

        .search-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .profile-preview {
          background: #0f172a;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .profile-avatar {
          width: 64px;
          height: 64px;
          background: #334155;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #64748b;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info h3 {
          font-size: 18px;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 4px;
        }

        .profile-info p {
          color: #94a3b8;
          font-size: 14px;
        }

        .verified-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #3b82f6;
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 4px;
          margin-top: 4px;
        }

        .profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
          font-family: 'JetBrains Mono', monospace;
        }

        .stat-label {
          font-size: 11px;
          color: #64748b;
          text-transform: uppercase;
        }

        .profile-bio {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 20px;
          padding-top: 16px;
          border-top: 1px solid #334155;
        }

        .connect-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #334155;
        }

        .divider span {
          color: #64748b;
          font-size: 13px;
        }

        .oauth-section {
          text-align: center;
        }

        .oauth-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          color: #f8fafc;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .oauth-btn:hover:not(:disabled) {
          border-color: #fe2c55;
          background: rgba(254, 44, 85, 0.1);
        }

        .oauth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .oauth-note {
          color: #64748b;
          font-size: 12px;
          margin-top: 12px;
        }

        .info-box {
          margin-top: 24px;
          padding: 20px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 12px;
        }

        .info-box h4 {
          color: #f8fafc;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .info-box ul {
          list-style: none;
          padding: 0;
          margin: 0 0 12px;
        }

        .info-box li {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 8px;
          padding-left: 16px;
          position: relative;
        }

        .info-box li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: #6366f1;
        }

        .info-box li strong {
          color: #f8fafc;
        }

        .info-box p {
          color: #64748b;
          font-size: 12px;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
