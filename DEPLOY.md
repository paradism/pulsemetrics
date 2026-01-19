# 🚀 Deploying PulseMetrics to Vercel

This guide walks you through deploying your TikTok Analytics Dashboard to Vercel.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) installed
- [Vercel account](https://vercel.com/signup) (free)
- Your environment variables ready

---

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub

```bash
# Initialize git repo
cd tiktok-dashboard
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: PulseMetrics TikTok Analytics Dashboard"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/pulsemetrics.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `pulsemetrics` repo
4. Vercel auto-detects Vite - click **Continue**

### Step 3: Configure Environment Variables

In the Vercel deployment screen, add these environment variables:

**Required for Auth (Supabase):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Required for TikTok Data (RapidAPI):**
```
VITE_RAPIDAPI_KEY=your-rapidapi-key
```

**Required for Payments (Stripe):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

VITE_STRIPE_PRICE_CREATOR_MONTHLY=price_xxx
VITE_STRIPE_PRICE_CREATOR_YEARLY=price_xxx
VITE_STRIPE_PRICE_PRO_MONTHLY=price_xxx
VITE_STRIPE_PRICE_PRO_YEARLY=price_xxx
VITE_STRIPE_PRICE_AGENCY_MONTHLY=price_xxx
VITE_STRIPE_PRICE_AGENCY_YEARLY=price_xxx
```

**App URL (update after first deploy):**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy!

Click **"Deploy"** and wait ~2 minutes.

Your app will be live at: `https://your-project.vercel.app`

---

## Option 2: Deploy via CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From project directory
cd tiktok-dashboard
vercel
```

Follow the prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Select your account
- **Link to existing project?** → N
- **Project name?** → pulsemetrics (or your choice)
- **Directory?** → ./
- **Override settings?** → N

### Step 4: Add Environment Variables

```bash
# Add each variable
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_RAPIDAPI_KEY
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
# ... etc

# Or add via dashboard: vercel.com/[your-project]/settings/environment-variables
```

### Step 5: Redeploy with Variables

```bash
vercel --prod
```

---

## Post-Deployment Setup

### 1. Update App URL

After deployment, update the `NEXT_PUBLIC_APP_URL` environment variable:

```
NEXT_PUBLIC_APP_URL=https://pulsemetrics.vercel.app
```

### 2. Configure Stripe Webhook

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-app.vercel.app/api/stripe/webhook
   ```
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add it as `STRIPE_WEBHOOK_SECRET`

### 3. Configure Supabase Redirect URLs

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → URL Configuration**
3. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/auth/callback
   ```

### 4. Test Everything

- [ ] Sign up with email
- [ ] Sign in with Google (if configured)
- [ ] Connect TikTok account
- [ ] View dashboard with data
- [ ] Test checkout flow (use Stripe test mode)
- [ ] Verify webhook receives events

---

## Custom Domain (Optional)

### Add Domain in Vercel

1. Go to your project → **Settings → Domains**
2. Add your domain: `pulsemetrics.io`
3. Follow DNS configuration instructions

### Update Environment Variables

```
NEXT_PUBLIC_APP_URL=https://pulsemetrics.io
```

Update Stripe webhook and Supabase redirect URLs to use your custom domain.

---

## Troubleshooting

### Build Fails

```bash
# Check logs
vercel logs

# Common fixes:
# 1. Make sure all dependencies are in package.json
# 2. Check for TypeScript errors
# 3. Verify environment variables are set
```

### API Routes Not Working

1. Check that `/api` folder is at project root
2. Verify functions have correct export format
3. Check Vercel function logs for errors

### Stripe Payments Fail

1. Verify Price IDs are correct
2. Check Stripe API keys (test vs live mode)
3. Ensure webhook secret matches

### Auth Redirects Fail

1. Add Vercel URL to Supabase allowed redirects
2. Check Site URL in Supabase settings
3. Clear browser cookies and retry

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_RAPIDAPI_KEY` | No* | RapidAPI key for TikTok data |
| `VITE_STRIPE_PUBLISHABLE_KEY` | No* | Stripe publishable key |
| `STRIPE_SECRET_KEY` | No* | Stripe secret key (server-side) |
| `STRIPE_WEBHOOK_SECRET` | No* | Stripe webhook signing secret |
| `VITE_STRIPE_PRICE_*` | No* | Stripe Price IDs for each tier |
| `NEXT_PUBLIC_APP_URL` | Yes | Your deployed app URL |

*App works in demo mode without these, using mock data

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Initial deployment successful
- [ ] App URL updated in env vars
- [ ] Supabase redirect URLs configured
- [ ] Stripe webhook configured (if using payments)
- [ ] Custom domain added (optional)
- [ ] Production tested

---

## Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

🎉 **Congratulations!** Your PulseMetrics dashboard is now live!
