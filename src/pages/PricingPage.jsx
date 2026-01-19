/**
 * Pricing Page Component
 * 
 * Displays subscription tiers and handles checkout
 */

import React, { useState } from 'react';
import { Check, X, Zap, Loader2, ArrowRight, Sparkles, Shield, Clock, Users, ArrowLeft } from 'lucide-react';
import { PRICING_TIERS, isStripeConfigured } from '../services/stripe';
import { useSubscription } from '../services/subscriptionContext';
import { useAuth } from '../lib/AuthContext';

export default function PricingPage({ onClose, onLogin }) {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'yearly'
  const [loading, setLoading] = useState(null); // tier id being processed
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const subscription = useSubscription();
  const currentPlan = subscription?.plan || 'free';

  const handleSelectPlan = async (tier) => {
    if (tier.id === 'free' || tier.id === currentPlan) return;
    
    // Require login first
    if (!user && onLogin) {
      onLogin();
      return;
    }
    
    if (tier.id === 'agency') {
      // Open contact form for agency tier
      window.open('mailto:sales@pulsemetrics.io?subject=Agency Plan Inquiry', '_blank');
      return;
    }

    setLoading(tier.id);
    setError('');

    try {
      const result = await subscription.upgradePlan(tier.id, billingPeriod);
      if (!result.success) {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const yearlyDiscount = 20; // 20% discount for yearly

  return (
    <div className="pricing-page">
      <div className="pricing-container">
        {/* Header */}
        <div className="pricing-header">
          <div className="logo">
            <div className="logo-icon"><Zap size={28} /></div>
            <span>PulseMetrics</span>
          </div>
          
          <h1>Choose Your Plan</h1>
          <p>Start free, upgrade when you're ready. Cancel anytime.</p>

          {/* Billing Toggle */}
          <div className="billing-toggle">
            <button 
              className={billingPeriod === 'monthly' ? 'active' : ''}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button 
              className={billingPeriod === 'yearly' ? 'active' : ''}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly
              <span className="discount-badge">Save {yearlyDiscount}%</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {PRICING_TIERS.map((tier) => {
            const isCurrentPlan = tier.id === currentPlan;
            const price = billingPeriod === 'yearly' 
              ? Math.round(tier.price.yearly / 12) 
              : tier.price.monthly;

            return (
              <div 
                key={tier.id} 
                className={`pricing-card ${tier.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}
              >
                {tier.popular && (
                  <div className="popular-badge">
                    <Sparkles size={14} />
                    Most Popular
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="current-badge">Current Plan</div>
                )}

                <div className="card-header">
                  <h3>{tier.name}</h3>
                  <p>{tier.description}</p>
                </div>

                <div className="card-price">
                  <span className="currency">$</span>
                  <span className="amount">{price}</span>
                  <span className="period">
                    /mo
                    {billingPeriod === 'yearly' && tier.price.yearly > 0 && (
                      <span className="billed-yearly">billed yearly</span>
                    )}
                  </span>
                </div>

                <button 
                  className={`select-plan-btn ${isCurrentPlan ? 'current' : ''} ${tier.popular ? 'popular' : ''}`}
                  onClick={() => handleSelectPlan(tier)}
                  disabled={isCurrentPlan || loading === tier.id}
                >
                  {loading === tier.id ? (
                    <Loader2 size={18} className="spin" />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    <>
                      {tier.cta}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="features-list">
                  <p className="features-title">What's included:</p>
                  {tier.features.map((feature, i) => (
                    <div key={i} className="feature-item included">
                      <Check size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {tier.limitations.map((limitation, i) => (
                    <div key={i} className="feature-item excluded">
                      <X size={16} />
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="trust-section">
          <div className="trust-badges">
            <div className="trust-badge">
              <Shield size={20} />
              <span>Secure Payments</span>
            </div>
            <div className="trust-badge">
              <Clock size={20} />
              <span>14-Day Free Trial</span>
            </div>
            <div className="trust-badge">
              <Users size={20} />
              <span>10,000+ Creators</span>
            </div>
          </div>
          <p className="guarantee">
            💯 30-day money-back guarantee. No questions asked.
          </p>
        </div>

        {/* FAQ */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we\'ll prorate the difference.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. All payments are securely processed by Stripe.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. You can cancel your subscription at any time from your account settings. No cancellation fees.'
              },
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {onClose && (
          <button className="close-pricing" onClick={onClose}>
            ← Back to Dashboard
          </button>
        )}
      </div>

      <style>{`
        .pricing-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%);
          padding: 40px 20px 80px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .pricing-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .pricing-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo span {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pricing-header h1 {
          font-size: 48px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 12px;
        }

        .pricing-header p {
          font-size: 18px;
          color: #94a3b8;
          margin-bottom: 32px;
        }

        .billing-toggle {
          display: inline-flex;
          background: #1e293b;
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
        }

        .billing-toggle button {
          padding: 12px 24px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .billing-toggle button:hover {
          color: #f8fafc;
        }

        .billing-toggle button.active {
          background: #334155;
          color: #f8fafc;
        }

        .discount-badge {
          background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .error-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          font-size: 14px;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 64px;
        }

        .pricing-card {
          background: #1e293b;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #334155;
          position: relative;
          transition: all 0.3s;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          border-color: #475569;
        }

        .pricing-card.popular {
          border-color: #6366f1;
          background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, #1e293b 100%);
        }

        .pricing-card.current {
          border-color: #22c55e;
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          white-space: nowrap;
        }

        .current-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 6px 16px;
          background: #22c55e;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .card-header {
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .card-header p {
          font-size: 14px;
          color: #94a3b8;
        }

        .card-price {
          display: flex;
          align-items: baseline;
          margin-bottom: 24px;
        }

        .currency {
          font-size: 24px;
          font-weight: 600;
          color: #f8fafc;
        }

        .amount {
          font-size: 56px;
          font-weight: 700;
          color: #f8fafc;
          line-height: 1;
          font-family: 'JetBrains Mono', monospace;
        }

        .period {
          font-size: 16px;
          color: #64748b;
          margin-left: 4px;
        }

        .billed-yearly {
          display: block;
          font-size: 12px;
          color: #64748b;
        }

        .select-plan-btn {
          width: 100%;
          padding: 14px 24px;
          background: #334155;
          border: none;
          border-radius: 12px;
          color: #f8fafc;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .select-plan-btn:hover:not(:disabled) {
          background: #475569;
        }

        .select-plan-btn.popular {
          background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
        }

        .select-plan-btn.popular:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .select-plan-btn.current {
          background: #22c55e;
          cursor: default;
        }

        .select-plan-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .features-list {
          border-top: 1px solid #334155;
          padding-top: 24px;
        }

        .features-title {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
        }

        .feature-item.included {
          color: #f8fafc;
        }

        .feature-item.included svg {
          color: #22c55e;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-item.excluded {
          color: #64748b;
        }

        .feature-item.excluded svg {
          color: #64748b;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .trust-section {
          text-align: center;
          margin-bottom: 64px;
        }

        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 48px;
          margin-bottom: 24px;
        }

        .trust-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 14px;
        }

        .trust-badge svg {
          color: #6366f1;
        }

        .guarantee {
          color: #f8fafc;
          font-size: 16px;
        }

        .faq-section {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-section h2 {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 32px;
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .faq-item {
          background: #1e293b;
          border-radius: 16px;
          padding: 24px;
        }

        .faq-item h4 {
          font-size: 16px;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 8px;
        }

        .faq-item p {
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.6;
        }

        .close-pricing {
          display: block;
          margin: 48px auto 0;
          padding: 12px 24px;
          background: transparent;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .close-pricing:hover {
          border-color: #6366f1;
          color: #f8fafc;
        }

        @media (max-width: 1200px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .pricing-header h1 {
            font-size: 32px;
          }

          .pricing-grid {
            grid-template-columns: 1fr;
          }

          .trust-badges {
            flex-direction: column;
            gap: 16px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
