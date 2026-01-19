# PulseMetrics - TikTok/Reels Analytics Dashboard

A micro-SaaS analytics dashboard for TikTok and Instagram Reels creators. This MVP includes:

- **Overview Dashboard** - Key metrics at a glance (followers, views, engagement rate)
- **Content Performance** - Track individual video performance over time
- **Best Posting Times** - Heatmap analysis showing when your audience is most active
- **Trending Sounds** - Discover sounds gaining traction in your niche
- **Competitor Tracking** - Compare your metrics against competitors
- **Authentication** - Full auth flow with Supabase (email/password, Google, TikTok) 

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (Demo Mode - no auth required)
npm run dev

# Build for production
npm run build
```

---

## 🔐 Authentication Setup

The app includes a complete authentication system with:
- Email/password login & signup
- Google OAuth
- TikTok OAuth (requires backend setup)
- Password reset flow
- Demo mode for testing

### Demo Mode (Default)

Without Supabase credentials, the app runs in **Demo Mode**:
- Any email/password combination works
- Sessions stored in localStorage
- Perfect for testing and development

### Production Mode (Supabase)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Configure Environment Variables**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env with your credentials
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Enable Google OAuth (Optional)**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Google and add your OAuth credentials
   - Add redirect URL: `https://your-domain.com/dashboard`

4. **Database Schema**
   Run this SQL in Supabase SQL Editor:
   ```sql
   -- Users profile table
   create table public.profiles (
     id uuid references auth.users on delete cascade primary key,
     email text,
     full_name text,
     avatar_url text,
     plan text default 'free',
     created_at timestamp with time zone default now()
   );

   -- Enable Row Level Security
   alter table public.profiles enable row level security;

   -- Policy: Users can read their own profile
   create policy "Users can read own profile"
     on public.profiles for select
     using (auth.uid() = id);

   -- Policy: Users can update their own profile
   create policy "Users can update own profile"
     on public.profiles for update
     using (auth.uid() = id);

   -- Auto-create profile on signup
   create or replace function public.handle_new_user()
   returns trigger as $$
   begin
     insert into public.profiles (id, email, full_name)
     values (new.id, new.email, new.raw_user_meta_data->>'full_name');
     return new;
   end;
   $$ language plpgsql security definer;

   create trigger on_auth_user_created
     after insert on auth.users
     for each row execute procedure public.handle_new_user();
   ```

---

## 🎵 TikTok API Setup

The dashboard supports two data sources:

### Option 1: RapidAPI (Recommended for Quick Start)

RapidAPI provides third-party TikTok data access without needing TikTok developer approval.

1. **Create RapidAPI Account**
   - Sign up at [rapidapi.com](https://rapidapi.com)
   - Subscribe to [TikTok Scraper API](https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7)
   - Free tier: 100 requests/month
   - Basic tier: ~$10/month for 10,000 requests

2. **Add API Key**
   ```bash
   # In your .env file
   VITE_RAPIDAPI_KEY=your-rapidapi-key-here
   ```

3. **Available Data**
   - User profiles and stats
   - User's public videos
   - Trending videos by region
   - Trending sounds/music
   - Trending hashtags
   - Search users and videos

### Option 2: Official TikTok API (For Personal Analytics)

For accessing a user's own account data (requires TikTok approval):

1. **Apply for Developer Access**
   - Go to [developers.tiktok.com](https://developers.tiktok.com)
   - Create a developer account
   - Create a new app
   - Request scopes: `user.info.basic`, `video.list`

2. **Configure OAuth**
   ```bash
   # In your .env file
   VITE_TIKTOK_CLIENT_KEY=your-client-key
   VITE_TIKTOK_CLIENT_SECRET=your-client-secret
   VITE_TIKTOK_REDIRECT_URI=http://localhost:3000/auth/tiktok/callback
   ```

3. **Note on Approval**
   - TikTok approval can take days/weeks
   - Business verification may be required
   - Some scopes need additional justification

### Data Flow Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User enters    │────▶│  RapidAPI        │────▶│  Dashboard      │
│  @username      │     │  (public data)   │     │  displays data  │
└─────────────────┘     └──────────────────┘     └─────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User clicks    │────▶│  TikTok OAuth    │────▶│  Access user's  │
│  "Sign in"      │     │  (official API)  │     │  own analytics  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### API Services Included

| Service | File | Purpose |
|---------|------|---------|
| `tiktokApi.js` | RapidAPI integration | Public profile data, trending content |
| `tiktokOAuth.js` | Official TikTok OAuth | User's personal account access |
| `analytics.js` | Data processing | Engagement rates, best times, trends |
| `hooks.js` | React hooks | Data fetching with caching |

### Usage Example

```javascript
import { useAnalytics, useTrendingSounds } from './services/hooks';

function MyComponent() {
  // Get user analytics
  const { profile, videos, insights, loading } = useAnalytics('username');
  
  // Get trending sounds
  const { sounds } = useTrendingSounds('US');
  
  if (loading) return <Spinner />;
  
  return (
    <div>
      <h1>{profile.nickname}</h1>
      <p>Followers: {profile.stats.followers}</p>
      <p>Engagement: {insights.engagementRate}%</p>
      <p>Best time to post: {insights.postingTimes.bestTimes[0]?.time}</p>
    </div>
  );
}
```

---

## 💳 Stripe Payments Setup

The dashboard includes a complete Stripe integration for subscription payments.

### Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | 1 account, 7-day history, basic metrics |
| **Creator** | $15/mo | 90-day history, trending sounds, best times |
| **Pro** | $39/mo | 3 accounts, competitor tracking, exports |
| **Agency** | $99/mo | 10 accounts, API access, white-label |

### Quick Setup

1. **Create Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from Dashboard → Developers → API keys

2. **Create Products & Prices**
   - Go to Dashboard → Products → Add Product
   - Create products for each tier (Creator, Pro, Agency)
   - Add monthly and yearly prices
   - Copy the Price IDs

3. **Configure Environment Variables**
   ```bash
   # .env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   
   # Price IDs from Stripe Dashboard
   VITE_STRIPE_PRICE_CREATOR_MONTHLY=price_xxx
   VITE_STRIPE_PRICE_CREATOR_YEARLY=price_xxx
   VITE_STRIPE_PRICE_PRO_MONTHLY=price_xxx
   VITE_STRIPE_PRICE_PRO_YEARLY=price_xxx
   VITE_STRIPE_PRICE_AGENCY_MONTHLY=price_xxx
   VITE_STRIPE_PRICE_AGENCY_YEARLY=price_xxx
   ```

4. **Set Up Webhook (Production)**
   ```bash
   # In Stripe Dashboard → Developers → Webhooks
   # Add endpoint: https://your-domain.com/api/stripe/webhook
   # Select events:
   # - checkout.session.completed
   # - customer.subscription.created
   # - customer.subscription.updated
   # - customer.subscription.deleted
   # - invoice.payment_succeeded
   # - invoice.payment_failed
   ```

### Demo Mode

Without Stripe credentials, the app runs in **demo mode**:
- Users can "upgrade" plans (stored in localStorage)
- Checkout flow is simulated
- Great for testing the UI before connecting Stripe

### API Routes (Vercel Serverless)

The `/api/stripe/` directory contains serverless functions:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/stripe/create-checkout-session` | POST | Creates Stripe Checkout session |
| `/api/stripe/create-portal-session` | POST | Opens customer billing portal |
| `/api/stripe/subscription-status` | GET | Gets user's subscription status |
| `/api/stripe/webhook` | POST | Handles Stripe webhook events |

### Database Schema Addition

Add these columns to your Supabase `profiles` table:

```sql
ALTER TABLE public.profiles 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN plan TEXT DEFAULT 'free',
ADD COLUMN subscription_status TEXT DEFAULT 'active';
```

### Using Subscription in Components

```javascript
import { useSubscription } from './services/subscriptionContext';

function MyComponent() {
  const { 
    plan,           // 'free', 'creator', 'pro', 'agency'
    isPaid,         // boolean
    hasFeature,     // (feature) => boolean
    isWithinLimit,  // (feature, count) => boolean
    upgradePlan,    // (planId) => Promise
  } = useSubscription();

  // Gate features by plan
  if (!hasFeature('competitors')) {
    return <UpgradePrompt feature="Competitor Tracking" />;
  }

  // Check limits
  if (!isWithinLimit('accounts', currentAccountCount)) {
    return <UpgradePrompt feature="Multiple Accounts" />;
  }
}
```

---

## 🚀 Roadmap to Revenue

### Phase 1: MVP Launch (Week 1-2)

**Current State:** Beautiful UI with mock data + authentication

**Immediate Actions:**

1. **Deploy the MVP**
   ```bash
   # Deploy to Vercel (free)
   npm i -g vercel
   vercel
   ```

2. **Set up a landing page** (use the dashboard as a "demo")
   - Add email capture form
   - "Get Early Access" waitlist

3. **Validate demand**
   - Post in TikTok creator communities
   - Reddit: r/TikTokCreators, r/NewTubers, r/socialmedia
   - Twitter/X: Tag creators, use relevant hashtags
   - Goal: 100 email signups before building backend

---

### Phase 2: Real Data Integration (Week 3-4)

#### Option A: TikTok API (Official)

TikTok requires business verification for API access:

1. Apply at [TikTok for Developers](https://developers.tiktok.com/)
2. Request access to:
   - User Info (followers, profile)
   - Video List (your videos)
   - Video Insights (views, likes, shares)

**Limitation:** TikTok's API is restrictive. You can only access data for users who authorize your app.

#### Option B: Unofficial Data Sources (Faster to Market)

Several third-party APIs aggregate TikTok data:

- **RapidAPI TikTok APIs** - Search "TikTok" on RapidAPI
- **Apify TikTok Scrapers** - Automated data collection
- **SocialBlade API** - Historical follower data

**Example integration:**

```javascript
// services/tiktokApi.js
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export async function getUserStats(username) {
  const response = await fetch(
    `https://tiktok-api23.p.rapidapi.com/api/user/info?username=${username}`,
    {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com'
      }
    }
  );
  return response.json();
}

export async function getTrendingSounds() {
  const response = await fetch(
    'https://tiktok-api23.p.rapidapi.com/api/trending/music',
    {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'tiktok-api23.p.rapidapi.com'
      }
    }
  );
  return response.json();
}
```

#### Option C: Instagram Reels (Easier API)

Instagram's API is more accessible via Facebook:

1. Create Facebook Developer App
2. Request Instagram Basic Display API
3. Add Instagram Graph API for business accounts

```javascript
// services/instagramApi.js
export async function getReelsInsights(accessToken, mediaId) {
  const response = await fetch(
    `https://graph.instagram.com/${mediaId}/insights?metric=plays,reach,likes&access_token=${accessToken}`
  );
  return response.json();
}
```

---

### Phase 3: Backend & Authentication (Week 5-6)

#### Recommended Stack

```
Frontend: React (current) + Vite
Backend:  Node.js + Express OR Next.js API routes
Database: Supabase (free tier, includes auth)
Payments: Stripe
Hosting:  Vercel (frontend) + Railway (backend)
```

#### Supabase Setup

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// Database schema
/*
users
  - id (uuid)
  - email
  - tiktok_username
  - plan (free/pro/business)
  - created_at

connected_accounts
  - id
  - user_id (fk)
  - platform (tiktok/instagram)
  - access_token (encrypted)
  - refresh_token (encrypted)

tracked_competitors
  - id
  - user_id (fk)
  - competitor_username
  - platform

analytics_snapshots
  - id
  - user_id (fk)
  - followers
  - total_views
  - engagement_rate
  - snapshot_date
*/
```

#### Authentication Flow

```javascript
// pages/auth/callback.js (for TikTok OAuth)
export default async function TikTokCallback(req, res) {
  const { code } = req.query;
  
  // Exchange code for access token
  const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TIKTOK_REDIRECT_URI
    })
  });
  
  const tokens = await tokenResponse.json();
  
  // Store tokens securely in database
  // Redirect to dashboard
}
```

---

### Phase 4: Monetization (Week 7-8)

#### Pricing Strategy

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0 | 1 account, 7-day history, basic metrics |
| **Creator** | $15/mo | 1 account, 90-day history, trending sounds, best times |
| **Pro** | $39/mo | 3 accounts, unlimited history, competitor tracking, export |
| **Agency** | $99/mo | 10 accounts, white-label reports, API access |

#### Stripe Integration

```javascript
// pages/api/create-checkout.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { priceId, userId } = req.body;
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.BASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.BASE_URL}/pricing?canceled=true`,
    metadata: { userId }
  });
  
  res.json({ url: session.url });
}
```

---

### Phase 5: Automation & Scaling (Week 9+)

#### Daily Data Collection (Cron Job)

```javascript
// jobs/collectAnalytics.js
import { supabase } from '../lib/supabase';
import { getUserStats } from '../services/tiktokApi';

export async function collectDailyAnalytics() {
  // Get all users with connected accounts
  const { data: users } = await supabase
    .from('connected_accounts')
    .select('user_id, platform, access_token');
  
  for (const user of users) {
    const stats = await getUserStats(user.access_token);
    
    await supabase.from('analytics_snapshots').insert({
      user_id: user.user_id,
      followers: stats.followers,
      total_views: stats.total_views,
      engagement_rate: stats.engagement_rate,
      snapshot_date: new Date().toISOString()
    });
  }
}

// Run with: cron job every 6 hours
// Or use: Vercel Cron, Railway Cron, or AWS Lambda
```

#### Automated Alerts

```javascript
// jobs/sendAlerts.js
export async function checkAndSendAlerts() {
  // Check for viral content (sudden spike)
  // Check for trending sounds in user's niche
  // Check for competitor activity
  
  // Send email/push notification
}
```

---

## 📊 Metrics That Matter

Track these for your business:

- **MRR (Monthly Recurring Revenue)** - Target: $500+ within 3 months
- **Churn Rate** - Keep below 5%/month
- **CAC (Customer Acquisition Cost)** - Target: < $30
- **LTV (Lifetime Value)** - Target: > $100

---

## 🎯 Marketing Channels

1. **Content Marketing**
   - Write "How to grow on TikTok" guides
   - Create TikTok tutorials about analytics
   - Guest post on creator economy blogs

2. **Community Building**
   - Discord server for creators
   - Weekly "trending sounds" newsletter

3. **Product-Led Growth**
   - Free tier with viral sharing features
   - "Analyzed by PulseMetrics" watermark on free reports

4. **Partnerships**
   - Creator management agencies
   - TikTok course creators
   - Social media management tools

---

## 🛠 Tech Stack Summary

| Component | Technology | Cost |
|-----------|------------|------|
| Frontend | React + Vite | Free |
| Hosting | Vercel | Free tier |
| Backend | Next.js API Routes | Free |
| Database | Supabase | Free tier (500MB) |
| Auth | Supabase Auth | Free |
| Payments | Stripe | 2.9% + $0.30/txn |
| Data API | RapidAPI / Apify | ~$50-100/mo |
| Email | Resend | Free tier |

**Estimated Monthly Costs at 100 users:** $50-150/mo
**Estimated Monthly Revenue at 100 users:** $1,500+ (assuming 10% convert to $15/mo)

---

## Next Steps

1. ✅ Dashboard UI complete
2. ✅ Authentication system complete
3. ✅ TikTok API integration complete
4. ✅ Stripe payments complete
5. ⬜ Deploy to Vercel
6. ⬜ Create landing page with waitlist
7. ⬜ Post in 5 creator communities
8. ⬜ Get 100 email signups

---

## File Structure

```
pulsemetrics/
├── src/
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # React entry point
│   ├── lib/
│   │   ├── supabase.js            # Supabase client
│   │   └── AuthContext.jsx        # Auth state management
│   ├── pages/
│   │   ├── LoginPage.jsx          # Login form
│   │   ├── SignupPage.jsx         # Signup form
│   │   ├── ForgotPasswordPage.jsx # Password reset
│   │   ├── PricingPage.jsx        # Subscription plans
│   │   └── SettingsPage.jsx       # Account settings
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard with API data
│   │   └── ConnectTikTok.jsx      # TikTok account connection
│   ├── services/
│   │   ├── index.js               # Services barrel export
│   │   ├── tiktokApi.js           # RapidAPI integration
│   │   ├── tiktokOAuth.js         # Official TikTok OAuth
│   │   ├── analytics.js           # Data processing
│   │   ├── hooks.js               # React data hooks
│   │   ├── stripe.js              # Stripe payments
│   │   └── subscriptionContext.jsx # Subscription state
│   └── styles/
│       └── dashboard.css          # Dashboard styles
├── api/
│   └── stripe/                    # Vercel serverless functions
│       ├── create-checkout-session.js
│       ├── create-portal-session.js
│       ├── subscription-status.js
│       └── webhook.js
├── public/
├── index.html
├── package.json
├── vite.config.js
├── .env.example                   # Environment variables template
└── README.md
```

---

Built for the creator economy. Ship fast, iterate faster. 🚀
