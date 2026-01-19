/**
 * Get Subscription Status
 * 
 * Vercel Serverless Function
 * GET /api/stripe/subscription-status
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, customerId } = req.query;

    if (!userId && !customerId) {
      return res.status(400).json({ error: 'User ID or Customer ID is required' });
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      // Return free plan if Stripe not configured
      return res.status(200).json({
        plan: 'free',
        status: 'active',
        customerId: null,
        subscription: null,
      });
    }

    let stripeCustomerId = customerId;

    // If we have userId but no customerId, look it up in Supabase
    if (userId && !customerId && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (profile?.stripe_customer_id) {
        stripeCustomerId = profile.stripe_customer_id;
      }
    }

    // No customer found - return free plan
    if (!stripeCustomerId) {
      return res.status(200).json({
        plan: 'free',
        status: 'active',
        customerId: null,
        subscription: null,
      });
    }

    // Get customer's subscriptions from Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.status(200).json({
        plan: 'free',
        status: 'active',
        customerId: stripeCustomerId,
        subscription: null,
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;

    // Map price ID to plan name
    const planMap = {
      [process.env.VITE_STRIPE_PRICE_CREATOR_MONTHLY]: 'creator',
      [process.env.VITE_STRIPE_PRICE_CREATOR_YEARLY]: 'creator',
      [process.env.VITE_STRIPE_PRICE_PRO_MONTHLY]: 'pro',
      [process.env.VITE_STRIPE_PRICE_PRO_YEARLY]: 'pro',
      [process.env.VITE_STRIPE_PRICE_AGENCY_MONTHLY]: 'agency',
      [process.env.VITE_STRIPE_PRICE_AGENCY_YEARLY]: 'agency',
    };

    const plan = planMap[priceId] || 'free';

    return res.status(200).json({
      plan,
      status: subscription.status,
      customerId: stripeCustomerId,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end * 1000,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? subscription.trial_end * 1000 : null,
      },
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to get subscription status' 
    });
  }
}
