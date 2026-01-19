/**
 * Subscription Context
 * 
 * Manages subscription state throughout the app:
 * - Current plan and status
 * - Feature gating
 * - Plan limits
 * - Demo mode support
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/AuthContext';
import { PRICING_TIERS, isStripeConfigured, demoCheckout, getDemoSubscription } from './stripe';

const SubscriptionContext = createContext({});

export const useSubscription = () => useContext(SubscriptionContext);

// Feature limits by plan
export const PLAN_LIMITS = {
  free: {
    accounts: 1,
    historyDays: 7,
    competitors: 0,
    trendingSounds: 5,
    hashtags: 5,
    exports: false,
    apiAccess: false,
    bestTimes: false,
    whiteLabel: false,
    teamSeats: 1,
  },
  creator: {
    accounts: 1,
    historyDays: 90,
    competitors: 0,
    trendingSounds: -1, // unlimited
    hashtags: -1,
    exports: false,
    apiAccess: false,
    bestTimes: true,
    whiteLabel: false,
    teamSeats: 1,
  },
  pro: {
    accounts: 3,
    historyDays: -1, // unlimited
    competitors: 10,
    trendingSounds: -1,
    hashtags: -1,
    exports: true,
    apiAccess: true,
    bestTimes: true,
    whiteLabel: false,
    teamSeats: 1,
  },
  agency: {
    accounts: 10,
    historyDays: -1,
    competitors: -1, // unlimited
    trendingSounds: -1,
    hashtags: -1,
    exports: true,
    apiAccess: true,
    bestTimes: true,
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
  });

  // Load subscription status
  const loadSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({ plan: 'free', status: 'active', loading: false });
      return;
    }

    try {
      // In demo mode or if Stripe not configured, use local storage
      if (isDemoMode || !isStripeConfigured()) {
        const demoSub = getDemoSubscription();
        setSubscription({
          ...demoSub,
          loading: false,
        });
        return;
      }

      // Fetch real subscription from API
      const response = await fetch(`/api/stripe/subscription-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription({
          plan: data.plan || 'free',
          status: data.status || 'active',
          customerId: data.customerId,
          currentPeriodEnd: data.subscription?.currentPeriodEnd,
          cancelAtPeriodEnd: data.subscription?.cancelAtPeriodEnd,
          loading: false,
        });
      } else {
        setSubscription({ plan: 'free', status: 'active', loading: false });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription({ plan: 'free', status: 'active', loading: false });
    }
  }, [user, isDemoMode]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Check for checkout success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Reload subscription after successful checkout
      setTimeout(loadSubscription, 1500);
    }
  }, [loadSubscription]);

  // Get current plan limits
  const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;

  // Check if feature is available
  const hasFeature = (feature) => {
    const value = limits[feature];
    if (typeof value === 'boolean') return value;
    if (value === -1) return true; // unlimited
    return value > 0;
  };

  // Check if within limit
  const isWithinLimit = (feature, currentUsage) => {
    const limit = limits[feature];
    if (limit === -1) return true; // unlimited
    return currentUsage < limit;
  };

  // Get remaining quota
  const getRemaining = (feature, currentUsage) => {
    const limit = limits[feature];
    if (limit === -1) return Infinity;
    return Math.max(0, limit - currentUsage);
  };

  // Upgrade to a plan (demo mode)
  const upgradePlan = async (planId, billingPeriod = 'monthly') => {
    if (isDemoMode || !isStripeConfigured()) {
      // Demo mode - simulate upgrade
      await demoCheckout(planId);
      setSubscription(prev => ({
        ...prev,
        plan: planId,
        status: 'active',
        currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }));
      return { success: true };
    }

    // Real Stripe checkout
    const tier = PRICING_TIERS.find(t => t.id === planId);
    if (!tier?.priceIds) {
      return { success: false, error: 'Invalid plan' };
    }

    const priceId = tier.priceIds[billingPeriod];
    
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user?.id,
          customerEmail: user?.email,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
        return { success: true };
      }
      
      return { success: false, error: 'Failed to create checkout session' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Cancel subscription (redirect to portal or demo cancel)
  const cancelSubscription = async () => {
    if (isDemoMode || !isStripeConfigured()) {
      // Demo mode - reset to free
      localStorage.removeItem('pulsemetrics_demo_subscription');
      setSubscription({
        plan: 'free',
        status: 'active',
        loading: false,
      });
      return { success: true };
    }

    // Open Stripe customer portal
    if (!subscription.customerId) {
      return { success: false, error: 'No subscription to cancel' };
    }

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subscription.customerId,
          returnUrl: `${window.location.origin}/settings`,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
        return { success: true };
      }

      return { success: false, error: 'Failed to open billing portal' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Get current plan details
  const currentPlan = PRICING_TIERS.find(t => t.id === subscription.plan) || PRICING_TIERS[0];

  const value = {
    // Subscription state
    plan: subscription.plan,
    status: subscription.status,
    loading: subscription.loading,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    
    // Plan info
    currentPlan,
    limits,
    allPlans: PRICING_TIERS,
    
    // Feature checks
    hasFeature,
    isWithinLimit,
    getRemaining,
    
    // Actions
    upgradePlan,
    cancelSubscription,
    refreshSubscription: loadSubscription,
    
    // Convenience
    isPaid: subscription.plan !== 'free',
    isFreePlan: subscription.plan === 'free',
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
 * Upgrade Required Modal
 */
export const UpgradeModal = ({ feature, requiredPlan = 'creator', onClose, onUpgrade }) => {
  const planName = {
    creator: 'Creator',
    pro: 'Pro',
    agency: 'Agency',
  }[requiredPlan] || 'Paid';

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={e => e.stopPropagation()}>
        <div className="upgrade-icon">🔒</div>
        <h3>Upgrade to Unlock</h3>
        <p>
          <strong>{feature}</strong> is available on the {planName} plan and above.
        </p>
        <div className="upgrade-buttons">
          <button className="upgrade-btn primary" onClick={onUpgrade}>
            View Plans
          </button>
          <button className="upgrade-btn secondary" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
      <style>{`
        .upgrade-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .upgrade-modal {
          background: #1e293b;
          border-radius: 24px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
          border: 1px solid #334155;
        }
        .upgrade-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .upgrade-modal h3 {
          color: #f8fafc;
          font-size: 24px;
          margin-bottom: 12px;
        }
        .upgrade-modal p {
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .upgrade-modal strong {
          color: #f8fafc;
        }
        .upgrade-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .upgrade-btn {
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          font-family: inherit;
          transition: all 0.2s;
        }
        .upgrade-btn.primary {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          color: white;
        }
        .upgrade-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }
        .upgrade-btn.secondary {
          background: #334155;
          color: #f8fafc;
        }
        .upgrade-btn.secondary:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

/**
 * Plan Badge Component
 */
export const PlanBadge = ({ plan, showUpgrade = false }) => {
  const colors = {
    free: '#64748b',
    creator: '#6366f1',
    pro: '#8b5cf6',
    agency: '#ec4899',
  };

  return (
    <span 
      className="plan-badge"
      style={{ background: colors[plan] || colors.free }}
    >
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
      <style>{`
        .plan-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
      `}</style>
    </span>
  );
};

export default SubscriptionContext;
