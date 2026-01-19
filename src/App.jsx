/**
 * PulseMetrics - TikTok Analytics Dashboard
 * 
 * Main application entry point with:
 * - Authentication (Supabase)
 * - Subscription management (Stripe)
 * - TikTok account connection
 * - Dashboard with real API data
 */

import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { SubscriptionProvider, useSubscription } from './services/subscriptionContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import Dashboard from './components/Dashboard';
import ConnectTikTok from './components/ConnectTikTok';
import './styles/dashboard.css';

// App Content - handles routing based on auth state
function AppContent() {
  const { user, loading, signIn, signUp, signInWithGoogle, signInWithTikTok, resetPassword } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'pricing', 'settings'
  const [connectedUsername, setConnectedUsername] = useState(() => {
    return localStorage.getItem('pulsemetrics_connected_username') || null;
  });

  // Check URL for routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/pricing') setCurrentPage('pricing');
    else if (path === '/settings') setCurrentPage('settings');
    else setCurrentPage('dashboard');

    // Check for checkout success/cancel
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Show success message or refresh subscription
      window.history.replaceState({}, '', '/dashboard');
      setCurrentPage('dashboard');
    }
  }, []);

  // Handle navigation
  const navigateTo = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', page === 'dashboard' ? '/' : `/${page}`);
  };

  // Save connected username to localStorage
  useEffect(() => {
    if (connectedUsername) {
      localStorage.setItem('pulsemetrics_connected_username', connectedUsername);
    } else {
      localStorage.removeItem('pulsemetrics_connected_username');
    }
  }, [connectedUsername]);

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
          <p>Loading PulseMetrics...</p>
        </div>
        <style>{`
          .loading-screen {
            min-height: 100vh;
            background: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', system-ui, sans-serif;
            color: #f8fafc;
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
            margin: 0 auto 16px;
          }
          .loading-content p {
            color: #64748b;
            font-size: 14px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Allow pricing page without auth
  if (currentPage === 'pricing' && !user) {
    return (
      <PricingPage 
        onClose={() => navigateTo('dashboard')}
        onLogin={() => setAuthPage('login')}
      />
    );
  }

  // Authenticated - check if TikTok is connected
  if (user) {
    // Show pricing page
    if (currentPage === 'pricing') {
      return (
        <PricingPage 
          onClose={() => navigateTo('dashboard')}
        />
      );
    }

    // Show settings page
    if (currentPage === 'settings') {
      return (
        <SettingsPage 
          onBack={() => navigateTo('dashboard')}
          connectedUsername={connectedUsername}
          onDisconnectTikTok={() => setConnectedUsername(null)}
        />
      );
    }

    if (!connectedUsername) {
      // Show TikTok connection screen
      return (
        <ConnectTikTok 
          onConnect={setConnectedUsername}
          currentUsername={connectedUsername}
        />
      );
    }
    
    // Show dashboard with connected account
    return (
      <Dashboard 
        connectedUsername={connectedUsername}
        onDisconnect={() => setConnectedUsername(null)}
        onNavigate={navigateTo}
      />
    );
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

// Root App with Providers
export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
