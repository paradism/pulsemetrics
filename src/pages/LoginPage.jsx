import React, { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage({ onSwitchToSignup, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Import auth from parent to avoid circular deps
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // This will be connected to AuthContext in the main App
    window.dispatchEvent(new CustomEvent('auth:signin', { 
      detail: { email, password } 
    }));
  };

  const handleGoogleSignIn = () => {
    window.dispatchEvent(new CustomEvent('auth:google'));
  };

  const handleTikTokSignIn = () => {
    window.dispatchEvent(new CustomEvent('auth:tiktok'));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-icon">
                <Zap size={32} />
              </div>
              <span className="logo-text">PulseMetrics</span>
            </div>
            
            <h1>Unlock Your Content's Potential</h1>
            <p>Deep analytics for TikTok & Reels. Track competitors, find trending sounds, and discover your best posting times.</p>
            
            <div className="brand-features">
              <div className="feature">
                <div className="feature-icon">📊</div>
                <div>
                  <strong>Real-time Analytics</strong>
                  <span>Track views, engagement, and growth</span>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🎵</div>
                <div>
                  <strong>Trending Sounds</strong>
                  <span>Discover what's going viral</span>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">⏰</div>
                <div>
                  <strong>Best Posting Times</strong>
                  <span>Maximize your reach</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="brand-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="form-header">
              <h2>Welcome back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label>Password</label>
                  <button 
                    type="button" 
                    className="forgot-link"
                    onClick={onForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>or continue with</span>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-btn google" onClick={handleGoogleSignIn}>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-btn tiktok" onClick={handleTikTokSignIn}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </button>
            </div>

            <p className="switch-text">
              Don't have an account?{' '}
              <button type="button" onClick={onSwitchToSignup}>
                Sign up for free
              </button>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1100px;
          width: 100%;
          background: #1e293b;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Branding Side */
        .login-branding {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .brand-content {
          position: relative;
          z-index: 1;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .login-branding h1 {
          font-size: 36px;
          font-weight: 700;
          color: white;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .login-branding > .brand-content > p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .feature div {
          display: flex;
          flex-direction: column;
        }

        .feature strong {
          color: white;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .feature span {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .brand-decoration {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .circle-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -100px;
        }

        .circle-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          left: -50px;
        }

        .circle-3 {
          width: 100px;
          height: 100px;
          bottom: 100px;
          right: 50px;
        }

        /* Form Side */
        .login-form-container {
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 380px;
        }

        .form-header {
          margin-bottom: 32px;
        }

        .form-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .form-header p {
          color: #64748b;
          font-size: 15px;
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
          margin-bottom: 24px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 500;
          color: #f8fafc;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 14px 14px 46px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f8fafc;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .input-wrapper input::placeholder {
          color: #64748b;
        }

        .toggle-password {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
        }

        .toggle-password:hover {
          color: #f8fafc;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          margin-top: 8px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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

        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f8fafc;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .social-btn:hover {
          border-color: #6366f1;
          background: #1e293b;
        }

        .social-btn.tiktok:hover {
          border-color: #ff0050;
        }

        .switch-text {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          margin-top: 24px;
        }

        .switch-text button {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
        }

        .switch-text button:hover {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .login-branding {
            padding: 32px;
          }

          .login-branding h1 {
            font-size: 28px;
          }

          .brand-features {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
