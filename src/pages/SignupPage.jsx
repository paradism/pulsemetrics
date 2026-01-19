import React, { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, User, Check } from 'lucide-react';

export default function SignupPage({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    window.dispatchEvent(new CustomEvent('auth:signup', { 
      detail: { email, password, fullName } 
    }));
  };

  const handleGoogleSignIn = () => {
    window.dispatchEvent(new CustomEvent('auth:google'));
  };

  if (success) {
    return (
      <div className="signup-page">
        <div className="success-container">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h2>Check your email</h2>
          <p>We've sent a confirmation link to <strong>{email}</strong></p>
          <p className="success-note">Click the link in the email to activate your account.</p>
          <button onClick={onSwitchToLogin} className="back-to-login">
            Back to login
          </button>
        </div>
        <style>{successStyles}</style>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Left side - Form */}
        <div className="signup-form-container">
          <div className="signup-form-wrapper">
            <div className="mobile-logo">
              <div className="logo-icon">
                <Zap size={24} />
              </div>
              <span>PulseMetrics</span>
            </div>

            <div className="form-header">
              <h2>Create your account</h2>
              <p>Start your 14-day free trial. No credit card required.</p>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="strength-bar"
                          style={{
                            background: i < passwordStrength() ? strengthColors[passwordStrength() - 1] : '#334155'
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ color: strengthColors[passwordStrength() - 1] || '#64748b' }}>
                      {password.length < 8 ? 'Min 8 characters' : strengthLabels[passwordStrength() - 1]}
                    </span>
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <span>or sign up with</span>
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
              <button type="button" className="social-btn tiktok" onClick={() => window.dispatchEvent(new CustomEvent('auth:tiktok'))}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </button>
            </div>

            <p className="terms-text">
              By signing up, you agree to our{' '}
              <a href="/terms">Terms of Service</a> and{' '}
              <a href="/privacy">Privacy Policy</a>
            </p>

            <p className="switch-text">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin}>
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Right side - Branding */}
        <div className="signup-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-icon">
                <Zap size={32} />
              </div>
              <span className="logo-text">PulseMetrics</span>
            </div>
            
            <h1>Join 10,000+ creators growing their audience</h1>
            
            <div className="testimonial">
              <p>"PulseMetrics helped me find the perfect posting times. My views went up 340% in just one month!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">S</div>
                <div>
                  <strong>Sarah Chen</strong>
                  <span>@sarahcreates • 2.1M followers</span>
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Creators</span>
              </div>
              <div className="stat">
                <span className="stat-value">50M+</span>
                <span className="stat-label">Videos Analyzed</span>
              </div>
              <div className="stat">
                <span className="stat-value">4.9★</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
          
          <div className="brand-decoration">
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
          </div>
        </div>
      </div>

      <style>{`
        .signup-page {
          min-height: 100vh;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .signup-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1100px;
          width: 100%;
          background: #1e293b;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Form Side */
        .signup-form-container {
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
        }

        .signup-form-wrapper {
          width: 100%;
          max-width: 380px;
        }

        .mobile-logo {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }

        .mobile-logo .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .mobile-logo span {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .form-header {
          margin-bottom: 28px;
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
          margin-bottom: 20px;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
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

        .password-strength {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
        }

        .strength-bar {
          width: 40px;
          height: 4px;
          border-radius: 2px;
          transition: background 0.3s;
        }

        .password-strength span {
          font-size: 12px;
          font-weight: 500;
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
          margin-top: 4px;
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
          margin: 20px 0;
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

        .terms-text {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          margin-top: 20px;
          line-height: 1.5;
        }

        .terms-text a {
          color: #6366f1;
          text-decoration: none;
        }

        .terms-text a:hover {
          text-decoration: underline;
        }

        .switch-text {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          margin-top: 16px;
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

        /* Branding Side */
        .signup-branding {
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

        .signup-branding h1 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          margin-bottom: 32px;
        }

        .testimonial {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .testimonial p {
          font-size: 16px;
          color: white;
          line-height: 1.6;
          margin-bottom: 16px;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 44px;
          height: 44px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }

        .testimonial-author strong {
          display: block;
          color: white;
          font-weight: 600;
        }

        .testimonial-author span {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
        }

        .stats-row {
          display: flex;
          gap: 32px;
        }

        .stat {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: white;
        }

        .stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
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

        @media (max-width: 900px) {
          .signup-container {
            grid-template-columns: 1fr;
            max-width: 480px;
          }

          .signup-branding {
            display: none;
          }

          .mobile-logo {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}

const successStyles = `
  .signup-page {
    min-height: 100vh;
    background: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .success-container {
    text-align: center;
    max-width: 400px;
    padding: 48px;
    background: #1e293b;
    border-radius: 24px;
    border: 1px solid #334155;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: white;
  }

  .success-container h2 {
    font-size: 24px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 12px;
  }

  .success-container p {
    color: #94a3b8;
    margin-bottom: 8px;
  }

  .success-container strong {
    color: #f8fafc;
  }

  .success-note {
    font-size: 14px;
    margin-bottom: 24px !important;
  }

  .back-to-login {
    padding: 12px 24px;
    background: #334155;
    border: none;
    border-radius: 10px;
    color: #f8fafc;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
  }

  .back-to-login:hover {
    background: #475569;
  }
`;
