/**
 * Stripe Webhook Handler
 * 
 * Vercel Serverless Function
 * POST /api/stripe/webhook
 * 
 * Handles subscription events:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 */

// Disable body parsing for webhook signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to get raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Map price IDs to plan names
const getPlanFromPriceId = (priceId) => {
  const planMap = {
    [process.env.VITE_STRIPE_PRICE_CREATOR_MONTHLY]: 'creator',
    [process.env.VITE_STRIPE_PRICE_CREATOR_YEARLY]: 'creator',
    [process.env.VITE_STRIPE_PRICE_PRO_MONTHLY]: 'pro',
    [process.env.VITE_STRIPE_PRICE_PRO_YEARLY]: 'pro',
    [process.env.VITE_STRIPE_PRICE_AGENCY_MONTHLY]: 'agency',
    [process.env.VITE_STRIPE_PRICE_AGENCY_YEARLY]: 'agency',
  };
  return planMap[priceId] || 'free';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check configuration
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe not configured for webhooks');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log('Received webhook:', event.type);

    // Initialize Supabase if configured
    let supabase = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const userId = session.metadata?.userId;

        if (userId && supabase) {
          await supabase
            .from('profiles')
            .update({ 
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
        }

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanFromPriceId(priceId);

          if (userId && supabase) {
            await supabase
              .from('profiles')
              .update({ 
                plan,
                subscription_status: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userId);
          }
        }

        console.log('Checkout completed for customer:', customerId);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const status = subscription.status;

        if (supabase) {
          await supabase
            .from('profiles')
            .update({ 
              plan,
              subscription_status: status,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }

        console.log(`Subscription ${event.type} for customer:`, customerId, 'Plan:', plan);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (supabase) {
          await supabase
            .from('profiles')
            .update({ 
              plan: 'free',
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }

        console.log('Subscription cancelled for customer:', customerId);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Payment succeeded for customer:', invoice.customer);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (supabase) {
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_customer_id', customerId);
        }

        console.log('Payment failed for customer:', customerId);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
