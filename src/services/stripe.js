/**
 * Stripe Configuration
 * 
 * Handles Stripe integration for subscriptions:
 * - Checkout sessions
 * - Customer portal
 * - Subscription management
 * 
 * Setup:
 * 1. Create Stripe account at https://stripe.com
 * 2. Create products and prices in Stripe Dashboard
 * 3. Add keys to .env
 */

// Price IDs from Stripe Dashboard
// Replace these with your actual Stripe Price IDs
export const PRICE_IDS = {
  creator_monthly: import.meta.env.VITE_STRIPE_PRICE_CREATOR_MONTHLY || 'price_creator_monthly',
  creator_yearly: import.meta.env.VITE_STRIPE_PRICE_CREATOR_YEARLY || 'price_creator_yearly',
  pro_monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  pro_yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  agency_monthly: import.meta.env.VITE_STRIPE_PRICE_AGENCY_MONTHLY || 'price_agency_monthly',
  agency_yearly: import.meta.env.VITE_STRIPE_PRICE_AGENCY_YEARLY || 'price_agency_yearly',
};

// Pricing tiers configuration
export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic analytics',
    price: { monthly: 0, yearly: 0 },
    features: [
      '1 TikTok account',
      '7-day analytics history',
      'Basic engagement metrics',
      'Top 5 trending sounds',
      'Community support',
    ],
    limitations: [
      'No competitor tracking',
      'No export features',
      'Limited best times data',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'creator',
    name: 'Creator',
    description: 'Perfect for growing creators',
    price: { monthly: 15, yearly: 144 }, // $12/mo billed yearly
    priceIds: {
      monthly: PRICE_IDS.creator_monthly,
      yearly: PRICE_IDS.creator_yearly,
    },
    features: [
      '1 TikTok account',
      '90-day analytics history',
      'Advanced engagement metrics',
      'All trending sounds',
      'Best posting times heatmap',
      'Hashtag performance tracking',
      'Email support',
    ],
    limitations: [
      'No competitor tracking',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious content creators',
    price: { monthly: 39, yearly: 348 }, // $29/mo billed yearly
    priceIds: {
      monthly: PRICE_IDS.pro_monthly,
      yearly: PRICE_IDS.pro_yearly,
    },
    features: [
      '3 TikTok accounts',
      'Unlimited analytics history',
      'Advanced engagement metrics',
      'All trending sounds & hashtags',
      'Best posting times heatmap',
      'Competitor tracking (up to 5)',
      'CSV/PDF export',
      'Priority email support',
      'Weekly email reports',
    ],
    limitations: [],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'For teams and agencies',
    price: { monthly: 99, yearly: 948 }, // $79/mo billed yearly
    priceIds: {
      monthly: PRICE_IDS.agency_monthly,
      yearly: PRICE_IDS.agency_yearly,
    },
    features: [
      '10 TikTok accounts',
      'Unlimited analytics history',
      'White-label reports',
      'Unlimited competitor tracking',
      'API access',
      'Team collaboration (5 seats)',
      'Custom integrations',
      'Dedicated account manager',
      'Phone & email support',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
  },
];

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = () => {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
};

/**
 * Create a Stripe Checkout session
 * This calls your backend API to create the session
 */
export async function createCheckoutSession(priceId, customerId, successUrl, cancelUrl) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      customerId,
      successUrl: successUrl || `${window.location.origin}/dashboard?checkout=success`,
      cancelUrl: cancelUrl || `${window.location.origin}/pricing?checkout=cancelled`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Create a Customer Portal session
 * Allows users to manage their subscription
 */
export async function createPortalSession(customerId, returnUrl) {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerId,
      returnUrl: returnUrl || `${window.location.origin}/dashboard`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create portal session');
  }

  return response.json();
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId) {
  const response = await fetch(`/api/stripe/subscription-status?userId=${userId}`);

  if (!response.ok) {
    return { status: 'free', plan: 'free' };
  }

  return response.json();
}

/**
 * Demo mode checkout (simulates subscription)
 */
export function demoCheckout(tierId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful checkout in demo mode
      localStorage.setItem('pulsemetrics_subscription', JSON.stringify({
        plan: tierId,
        status: 'active',
        currentPeriodEnd: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: Date.now(),
      }));
      resolve({ success: true, plan: tierId });
    }, 1500);
  });
}

/**
 * Get demo subscription status
 */
export function getDemoSubscription() {
  const stored = localStorage.getItem('pulsemetrics_subscription');
  if (!stored) {
    return { plan: 'free', status: 'active' };
  }

  const subscription = JSON.parse(stored);
  
  // Check if expired
  if (Date.now() > subscription.currentPeriodEnd) {
    return { plan: 'free', status: 'expired' };
  }

  return subscription;
}

/**
 * Cancel demo subscription
 */
export function cancelDemoSubscription() {
  localStorage.removeItem('pulsemetrics_subscription');
}

export default {
  PRICING_TIERS,
  PRICE_IDS,
  isStripeConfigured,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
  demoCheckout,
  getDemoSubscription,
  cancelDemoSubscription,
};
