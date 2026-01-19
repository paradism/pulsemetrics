import React, { useState } from 'react';
import { Zap, Mail, ArrowLeft, ArrowRight, AlertCircle, Check } from 'lucide-react';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    window.dispatchEvent(new CustomEvent('auth:reset-password', { 
      detail: { email } 
    }));

    // Simulate success for UI
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="forgot-page">
        <div className="forgot-container">
          <div className="success-state">
            <div className="success-icon">
              <Check size={32} />
            </div>
            <h2>Check your email</h2>
            <p>We've sent password reset instructions to:</p>
            <p className="email-sent">{email}</p>
            <p className="note">Didn't receive the email? Check your spam folder or try again.</p>
            <button onClick={onBackToLogin} className="back-btn">
              <ArrowLeft size={18} />
              Back to login
            </button>
          </div>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <button onClick={onBackToLogin} className="back-link">
          <ArrowLeft size={18} />
          Back to login
        </button>

        <div className="forgot-header">
          <div className="logo-icon">
            <Zap size={28} />
          </div>
          <h2>Forgot password?</h2>
          <p>No worries, we'll send you reset instructions.</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Reset Password
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .forgot-page {
    min-height: 100vh;
    background: #0f172a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .forgot-container {
    width: 100%;
    max-width: 420px;
    background: #1e293b;
    border-radius: 24px;
    padding: 40px;
    border: 1px solid #334155;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #64748b;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 32px;
    font-family: inherit;
    padding: 0;
    transition: color 0.2s;
  }

  .back-link:hover {
    color: #f8fafc;
  }

  .forgot-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 20px;
  }

  .forgot-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 8px;
  }

  .forgot-header p {
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

  .forgot-form {
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

  /* Success State */
  .success-state {
    text-align: center;
  }

  .success-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 24px;
  }

  .success-state h2 {
    font-size: 24px;
    font-weight: 700;
    color: #f8fafc;
    margin-bottom: 8px;
  }

  .success-state p {
    color: #94a3b8;
    margin-bottom: 4px;
  }

  .email-sent {
    color: #f8fafc !important;
    font-weight: 600;
    margin-bottom: 16px !important;
  }

  .note {
    font-size: 13px;
    margin-bottom: 24px !important;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
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

  .back-btn:hover {
    background: #475569;
  }
`;
