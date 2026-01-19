/**
 * Settings Page
 * 
 * Account settings and subscription management
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, User, CreditCard, Bell, Shield, Link, LogOut,
  Check, Loader2, ExternalLink, AlertCircle, Zap, Crown
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useSubscription, PlanBadge } from '../services/subscriptionContext';
import { PRICING_TIERS, isStripeConfigured } from '../services/stripe';

export default function SettingsPage({ onBack, connectedUsername, onDisconnectTikTok }) {
  const { user, signOut, isDemoMode } = useAuth();
  const { 
    plan, 
    currentPlan, 
    cancelAtPeriodEnd, 
    currentPeriodEnd,
    cancelSubscription,
    isPaid
  } = useSubscription();
  
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleManageSubscription = async () => {
    setLoading(true);
    setMessage(null);

    const result = await cancelSubscription();
    
    if (!result.success) {
      setMessage({ type: 'error', text: result.error });
    }
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const sections = [
    { id: 'account', icon: User, label: 'Account' },
    { id: 'subscription', icon: CreditCard, label: 'Subscription' },
    { id: 'connections', icon: Link, label: 'Connections' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'security', icon: Shield, label: 'Security' },
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <header className="settings-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1>Settings</h1>
        </header>

        <div className="settings-content">
          {/* Sidebar */}
          <nav className="settings-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
            <div className="nav-divider" />
            <button className="nav-item danger" onClick={handleSignOut}>
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>

          {/* Main Content */}
          <main className="settings-main">
            {message && (
              <div className={`message ${message.type}`}>
                {message.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
                {message.text}
              </div>
            )}

            {/* Account Section */}
            {activeSection === 'account' && (
              <section className="settings-section">
                <h2>Account Information</h2>
                
                <div className="info-card">
                  <div className="info-row">
                    <span className="label">Email</span>
                    <span className="value">{user?.email || 'Not set'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">User ID</span>
                    <span className="value mono">{user?.id?.slice(0, 8)}...</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Account Created</span>
                    <span className="value">{formatDate(user?.created_at)}</span>
                  </div>
                </div>

                {isDemoMode && (
                  <div className="demo-notice">
                    <Zap size={16} />
                    <span>Running in Demo Mode - Add Supabase credentials for real authentication</span>
                  </div>
                )}
              </section>
            )}

            {/* Subscription Section */}
            {activeSection === 'subscription' && (
              <section className="settings-section">
                <h2>Subscription</h2>

                <div className="plan-card">
                  <div className="plan-header">
                    <div className="plan-info">
                      <div className="plan-name-row">
                        <h3>{currentPlan?.name || 'Free'}</h3>
                        <PlanBadge plan={plan} />
                      </div>
                      <p>{currentPlan?.description}</p>
                    </div>
                    {isPaid && (
                      <div className="plan-price">
                        <span className="amount">${currentPlan?.price?.monthly || 0}</span>
                        <span className="interval">/month</span>
                      </div>
                    )}
                  </div>

                  {isPaid && currentPeriodEnd && (
                    <div className="billing-info">
                      {cancelAtPeriodEnd ? (
                        <p className="cancel-notice">
                          <AlertCircle size={16} />
                          Your subscription will end on {formatDate(currentPeriodEnd)}
                        </p>
                      ) : (
                        <p>Next billing date: {formatDate(currentPeriodEnd)}</p>
                      )}
                    </div>
                  )}

                  <div className="plan-features">
                    <h4>Your features:</h4>
                    <ul>
                      {currentPlan?.features?.slice(0, 5).map((feature, i) => (
                        <li key={i}>
                          <Check size={14} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="plan-actions">
                    {!isPaid ? (
                      <button className="btn primary" onClick={onBack}>
                        <Crown size={16} />
                        Upgrade Plan
                      </button>
                    ) : (
                      <button 
                        className="btn secondary"
                        onClick={handleManageSubscription}
                        disabled={loading}
                      >
                        {loading ? <Loader2 size={16} className="spin" /> : <ExternalLink size={16} />}
                        Manage Subscription
                      </button>
                    )}
                  </div>
                </div>

                {!isStripeConfigured() && (
                  <div className="demo-notice">
                    <AlertCircle size={16} />
                    <span>Stripe not configured - Subscriptions run in demo mode</span>
                  </div>
                )}

                {/* Plan Comparison */}
                <div className="plan-comparison">
                  <h3>Compare Plans</h3>
                  <div className="plans-grid">
                    {PRICING_TIERS.filter(t => t.id !== 'free').map(tier => (
                      <div 
                        key={tier.id} 
                        className={`plan-option ${tier.id === plan ? 'current' : ''} ${tier.popular ? 'popular' : ''}`}
                      >
                        {tier.popular && <span className="popular-tag">Most Popular</span>}
                        <h4>{tier.name}</h4>
                        <div className="price">
                          <span className="amount">${tier.price?.monthly || 0}</span>
                          <span>/mo</span>
                        </div>
                        <p>{tier.description}</p>
                        {tier.id === plan ? (
                          <span className="current-tag">Current Plan</span>
                        ) : (
                          <button className="btn small" onClick={onBack}>
                            {tier.price?.monthly > (currentPlan?.price?.monthly || 0) ? 'Upgrade' : 'Switch'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Connections Section */}
            {activeSection === 'connections' && (
              <section className="settings-section">
                <h2>Connected Accounts</h2>

                <div className="connection-card">
                  <div className="connection-icon tiktok">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                  <div className="connection-info">
                    <h4>TikTok</h4>
                    {connectedUsername ? (
                      <p className="connected">@{connectedUsername}</p>
                    ) : (
                      <p className="not-connected">Not connected</p>
                    )}
                  </div>
                  {connectedUsername ? (
                    <button className="btn danger small" onClick={onDisconnectTikTok}>
                      Disconnect
                    </button>
                  ) : (
                    <button className="btn primary small" onClick={onBack}>
                      Connect
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <section className="settings-section">
                <h2>Notification Preferences</h2>

                <div className="toggle-list">
                  {[
                    { id: 'weekly', label: 'Weekly performance report', description: 'Get a summary of your analytics every Monday' },
                    { id: 'trending', label: 'Trending alerts', description: 'Be notified when sounds or hashtags start trending' },
                    { id: 'milestones', label: 'Milestone celebrations', description: 'Celebrate when you hit follower milestones' },
                    { id: 'tips', label: 'Growth tips', description: 'Receive personalized tips to grow your account' },
                  ].map(item => (
                    <div key={item.id} className="toggle-item">
                      <div className="toggle-info">
                        <h4>{item.label}</h4>
                        <p>{item.description}</p>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked={item.id === 'weekly'} />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <p className="note">Email notifications will be sent to {user?.email}</p>
              </section>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <section className="settings-section">
                <h2>Security</h2>

                <div className="security-options">
                  <div className="security-item">
                    <div>
                      <h4>Change Password</h4>
                      <p>Update your account password</p>
                    </div>
                    <button className="btn secondary small">Change</button>
                  </div>

                  <div className="security-item">
                    <div>
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security</p>
                    </div>
                    <button className="btn secondary small">Enable</button>
                  </div>

                  <div className="security-item danger">
                    <div>
                      <h4>Delete Account</h4>
                      <p>Permanently delete your account and all data</p>
                    </div>
                    <button className="btn danger small">Delete</button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .settings-page {
          min-height: 100vh;
          background: #0f172a;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #f8fafc;
        }

        .settings-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 16px;
          padding: 0;
          font-family: inherit;
        }

        .back-btn:hover {
          color: #f8fafc;
        }

        .settings-header h1 {
          font-size: 32px;
          font-weight: 700;
        }

        .settings-content {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-nav .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          font-family: inherit;
        }

        .settings-nav .nav-item:hover {
          background: #1e293b;
          color: #f8fafc;
        }

        .settings-nav .nav-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          color: #f8fafc;
        }

        .settings-nav .nav-item.danger:hover {
          color: #ef4444;
        }

        .nav-divider {
          height: 1px;
          background: #334155;
          margin: 12px 0;
        }

        .settings-main {
          min-height: 500px;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .message.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        .settings-section h2 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .info-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #334155;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row .label {
          color: #64748b;
        }

        .info-row .value {
          font-weight: 500;
        }

        .info-row .value.mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        .demo-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 10px;
          color: #94a3b8;
          font-size: 13px;
          margin-top: 16px;
        }

        .demo-notice svg {
          color: #6366f1;
        }

        .plan-card {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .plan-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .plan-name-row h3 {
          font-size: 24px;
          font-weight: 700;
        }

        .plan-info p {
          color: #94a3b8;
        }

        .plan-price {
          text-align: right;
        }

        .plan-price .amount {
          font-size: 32px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .plan-price .interval {
          color: #64748b;
        }

        .billing-info {
          padding: 12px 16px;
          background: #0f172a;
          border-radius: 10px;
          margin-bottom: 20px;
          color: #94a3b8;
          font-size: 14px;
        }

        .cancel-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f59e0b;
        }

        .plan-features h4 {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 12px;
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .plan-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #f8fafc;
        }

        .plan-features li svg {
          color: #22c55e;
        }

        .plan-actions {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #334155;
        }

        .plan-comparison h3 {
          font-size: 18px;
          margin-bottom: 16px;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .plan-option {
          background: #1e293b;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #334155;
          position: relative;
        }

        .plan-option.current {
          border-color: #6366f1;
        }

        .plan-option.popular {
          border-color: #ec4899;
        }

        .popular-tag {
          position: absolute;
          top: -10px;
          right: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .plan-option h4 {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .plan-option .price {
          margin-bottom: 8px;
        }

        .plan-option .price .amount {
          font-size: 24px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        .plan-option .price span:last-child {
          color: #64748b;
        }

        .plan-option p {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .current-tag {
          display: inline-block;
          padding: 6px 12px;
          background: #22c55e;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .connection-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #1e293b;
          border-radius: 16px;
          padding: 20px;
        }

        .connection-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .connection-icon.tiktok {
          background: linear-gradient(135deg, #25f4ee 0%, #fe2c55 50%, #000 100%);
        }

        .connection-info {
          flex: 1;
        }

        .connection-info h4 {
          font-size: 16px;
          margin-bottom: 4px;
        }

        .connection-info .connected {
          color: #22c55e;
          font-size: 14px;
        }

        .connection-info .not-connected {
          color: #64748b;
          font-size: 14px;
        }

        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e293b;
          border-radius: 12px;
          padding: 16px 20px;
        }

        .toggle-info h4 {
          font-size: 15px;
          margin-bottom: 4px;
        }

        .toggle-info p {
          font-size: 13px;
          color: #64748b;
        }

        .toggle {
          position: relative;
          width: 48px;
          height: 26px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #334155;
          border-radius: 26px;
          transition: 0.3s;
        }

        .slider::before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        input:checked + .slider {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
        }

        input:checked + .slider::before {
          transform: translateX(22px);
        }

        .note {
          margin-top: 16px;
          font-size: 13px;
          color: #64748b;
        }

        .security-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1e293b;
          border-radius: 12px;
          padding: 16px 20px;
        }

        .security-item h4 {
          font-size: 15px;
          margin-bottom: 4px;
        }

        .security-item p {
          font-size: 13px;
          color: #64748b;
        }

        .security-item.danger {
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.2s;
        }

        .btn.small {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn.primary {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          color: white;
        }

        .btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .btn.secondary {
          background: #334155;
          color: #f8fafc;
        }

        .btn.secondary:hover {
          background: #475569;
        }

        .btn.danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn.danger:hover {
          background: #ef4444;
          color: white;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .settings-content {
            grid-template-columns: 1fr;
          }

          .settings-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 16px;
          }

          .plans-grid {
            grid-template-columns: 1fr;
          }

          .plan-features ul {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
