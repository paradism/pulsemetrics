/**
 * Subscription Context
 * 
 * Manages subscription state throughout the app:
 * - Current plan
 * - Feature access
 * - Upgrade prompts
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  isStripeConfigured, 
  getSubscriptionStatus, 
  getDemoSubscription,
  createPortalSession,
  PRICING_TIERS 
} from './stripe';

const SubscriptionContext = createContext({});

export const useSubscription = () => useContext(SubscriptionContext);

// Feature limits per plan
const PLAN_LIMITS = {
  free: {
    accounts: 1,
    historyDays: 7,
    competitors: 0,
    trendingSounds: 5,
    export: false,
    apiAccess: false,
    whiteLabel: false,
    teamSeats: 1,
  },
  creator: {
    accounts: 1,
    historyDays: 90,
    competitors: 0,
    trendingSounds: -1, // unlimited
    export: false,
    apiAccess: false,
    whiteLabel: false,
    teamSeats: 1,
  },
  pro: {
    accounts: 3,
    historyDays: -1, // unlimited
    competitors: 5,
    trendingSounds: -1,
    export: true,
    apiAccess: false,
    whiteLabel: false,
    teamSeats: 1,
  },
  agency: {
    accounts: 10,
    historyDays: -1,
    competitors: -1, // unlimited
    trendingSounds: -1,
    export: true,
    apiAccess: true,
    whiteLabel: true,
    teamSeats: 5,
  },
};

export const SubscriptionProvider = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const [subscription, setSubscription] = useState({
    plan: 'free',
    status: 'active',
    loading: true,
    customerId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    trialEnd: null,
  });

  // Fetch subscription status
  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(s => ({ ...s, plan: 'free', status: 'active', loading: false }));
      return;
    }

    try {
      if (isDemoMode || !isStripeConfigured()) {
        // Use demo subscription
        const demoSub = getDemoSubscription();
        setSubscription({
          ...demoSub,
          loading: false,
          customerId: null,
        });
      } else {
        // Fetch real subscription status
        const status = await getSubscriptionStatus(user.id);
        setSubscription({
          plan: status.plan || 'free',
          status: status.status || 'active',
          customerId: status.customerId,
          currentPeriodEnd: status.subscription?.currentPeriodEnd,
          cancelAtPeriodEnd: status.subscription?.cancelAtPeriodEnd,
          trialEnd: status.subscription?.trialEnd,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(s => ({ ...s, plan: 'free', status: 'active', loading: false }));
    }
  }, [user, isDemoMode]);

  // Fetch on mount and user change
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Check URL params for checkout success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Refresh subscription after successful checkout
      setTimeout(refreshSubscription, 2000);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshSubscription]);

  // Get limits for current plan
  const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;

  // Check if a feature is available
  const hasFeature = (feature) => {
    const limit = limits[feature];
    if (limit === undefined) return false;
    if (typeof limit === 'boolean') return limit;
    return limit !== 0;
  };

  // Check if within limit
  const checkLimit = (feature, currentCount) => {
    const limit = limits[feature];
    if (limit === -1) return true; // unlimited
    return currentCount < limit;
  };

  // Get remaining quota
  const getRemainingQuota = (feature, currentCount) => {
    const limit = limits[feature];
    if (limit === -1) return Infinity;
    return Math.max(0, limit - currentCount);
  };

  // Open customer portal
  const openCustomerPortal = async () => {
    if (!subscription.customerId) {
      console.error('No customer ID for portal');
      return;
    }

    try {
      const { url } = await createPortalSession(
        subscription.customerId,
        window.location.href
      );
      window.location.href = url;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  // Get current plan details
  const currentPlanDetails = PRICING_TIERS.find(t => t.id === subscription.plan) || PRICING_TIERS[0];

  // Check if on trial
  const isOnTrial = subscription.trialEnd && subscription.trialEnd > Date.now();
  const trialDaysRemaining = isOnTrial 
    ? Math.ceil((subscription.trialEnd - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Check if subscription is expiring soon
  const isExpiringSoon = subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd;
  const daysUntilExpiry = isExpiringSoon
    ? Math.ceil((subscription.currentPeriodEnd - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const value = {
    // Subscription state
    plan: subscription.plan,
    status: subscription.status,
    loading: subscription.loading,
    customerId: subscription.customerId,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    
    // Plan details
    limits,
    currentPlanDetails,
    
    // Trial info
    isOnTrial,
    trialDaysRemaining,
    trialEnd: subscription.trialEnd,
    
    // Expiry info
    isExpiringSoon,
    daysUntilExpiry,
    
    // Helper functions
    hasFeature,
    checkLimit,
    getRemainingQuota,
    refreshSubscription,
    openCustomerPortal,
    
    // Plan comparison
    isPaid: subscription.plan !== 'free',
    isCreator: subscription.plan === 'creator',
    isPro: subscription.plan === 'pro',
    isAgency: subscription.plan === 'agency',
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Upgrade Prompt Component
 * Shows when user tries to access a feature above their plan
 */
export const UpgradePrompt = ({ feature, requiredPlan, onClose }) => {
  const planNames = {
    creator: 'Creator',
    pro: 'Pro',
    agency: 'Agency',
  };

  return (
    <div className="upgrade-prompt-overlay" onClick={onClose}>
      <div className="upgrade-prompt" onClick={e => e.stopPropagation()}>
        <div className="upgrade-icon">🔒</div>
        <h3>Upgrade Required</h3>
        <p>
          {feature} is available on the <strong>{planNames[requiredPlan]}</strong> plan and above.
        </p>
        <div className="upgrade-buttons">
          <button className="upgrade-btn" onClick={() => window.location.href = '/pricing'}>
            View Plans
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
      <style>{`
        .upgrade-prompt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .upgrade-prompt {
          background: #1e293b;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
          border: 1px solid #334155;
        }
        .upgrade-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .upgrade-prompt h3 {
          color: #f8fafc;
          font-size: 24px;
          margin-bottom: 12px;
        }
        .upgrade-prompt p {
          color: #94a3b8;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .upgrade-prompt strong {
          color: #6366f1;
        }
        .upgrade-buttons {
          display: flex;
          gap: 12px;
        }
        .upgrade-btn {
          flex: 1;
          padding: 12px 24px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .cancel-btn {
          flex: 1;
          padding: 12px 24px;
          background: #334155;
          border: none;
          border-radius: 10px;
          color: #f8fafc;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

/**
 * Plan Badge Component
 * Shows current plan with optional upgrade button
 */
export const PlanBadge = ({ showUpgrade = false }) => {
  const { plan, isOnTrial, trialDaysRemaining, isExpiringSoon, daysUntilExpiry } = useSubscription();

  const planColors = {
    free: '#64748b',
    creator: '#6366f1',
    pro: '#8b5cf6',
    agency: '#ec4899',
  };

  return (
    <div className="plan-badge-container">
      <div 
        className="plan-badge"
        style={{ background: planColors[plan] }}
      >
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
        {isOnTrial && <span className="trial-label">Trial</span>}
      </div>
      
      {isOnTrial && (
        <span className="trial-info">{trialDaysRemaining} days left</span>
      )}
      
      {isExpiringSoon && (
        <span className="expiry-warning">Expires in {daysUntilExpiry} days</span>
      )}
      
      {showUpgrade && plan === 'free' && (
        <a href="/pricing" className="upgrade-link">Upgrade</a>
      )}
      
      <style>{`
        .plan-badge-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .plan-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .trial-label {
          background: rgba(255,255,255,0.2);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
        }
        .trial-info {
          font-size: 12px;
          color: #f59e0b;
        }
        .expiry-warning {
          font-size: 12px;
          color: #ef4444;
        }
        .upgrade-link {
          font-size: 12px;
          color: #6366f1;
          text-decoration: none;
        }
        .upgrade-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default {
  SubscriptionProvider,
  useSubscription,
  UpgradePrompt,
  PlanBadge,
  PLAN_LIMITS,
};
