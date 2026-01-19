import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isDemoMode } from './supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Demo user for testing without Supabase
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@pulsemetrics.io',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, check localStorage for demo session
      const demoSession = localStorage.getItem('pulsemetrics_demo_session');
      if (demoSession) {
        setUser(DEMO_USER);
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName) => {
    setError(null);
    
    if (isDemoMode) {
      // Demo mode signup
      localStorage.setItem('pulsemetrics_demo_session', 'true');
      setUser({ ...DEMO_USER, email, user_metadata: { full_name: fullName } });
      return { data: { user: DEMO_USER }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
      return { data: null, error };
    }

    return { data, error: null };
  };

  const signIn = async (email, password) => {
    setError(null);

    if (isDemoMode) {
      // Demo mode signin - accept any credentials
      localStorage.setItem('pulsemetrics_demo_session', 'true');
      setUser({ ...DEMO_USER, email });
      return { data: { user: DEMO_USER }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return { data: null, error };
    }

    return { data, error: null };
  };

  const signInWithGoogle = async () => {
    setError(null);

    if (isDemoMode) {
      localStorage.setItem('pulsemetrics_demo_session', 'true');
      setUser(DEMO_USER);
      return { data: { user: DEMO_USER }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setError(error.message);
    }

    return { data, error };
  };

  const signInWithTikTok = async () => {
    setError(null);
    
    // TikTok OAuth requires custom implementation
    // This would redirect to your backend which handles TikTok OAuth
    if (isDemoMode) {
      localStorage.setItem('pulsemetrics_demo_session', 'true');
      setUser(DEMO_USER);
      return { data: { user: DEMO_USER }, error: null };
    }

    // In production, redirect to your OAuth endpoint
    window.location.href = '/api/auth/tiktok';
    return { data: null, error: null };
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('pulsemetrics_demo_session');
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    }
  };

  const resetPassword = async (email) => {
    setError(null);

    if (isDemoMode) {
      return { data: { message: 'Demo mode: Password reset simulated' }, error: null };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return { data: null, error };
    }

    return { data, error: null };
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithTikTok,
    signOut,
    resetPassword,
    isDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
