/**
 * SINGLE SOURCE OF TRUTH — Brevmont Pricing (Grand Slam Offer v1.0)
 * Locked: 2026-04-12 — Updated from ATLAS Grand Slam Offer Strategy Document
 *
 * ALL pricing references across the codebase should import from this file.
 * Do NOT hardcode dollar amounts anywhere else.
 * Do NOT modify pricing without explicit founder approval.
 *
 * Source: brevmont_brand/strategy/grand-slam-offer-v1.md
 */

export const PRICING = {
  FOUNDING_PILOT: {
    name: 'Founding Dealer Pilot',
    price: 2500,
    period: '90 days',
    priceDisplay: '$2,500',
    periodDisplay: 'one-time for 90 days',
    description: 'First 5 dealers only. Full Command access. Converts to $1,999/mo founding rate.',
    duration_days: 90,
    max_dealers: 5,
    founding_rate_monthly: 1999,
    founding_rate_lock_months: 12,
    founding_rate_savings: 12000, // vs standard Command annually
    guarantee: '1,500 messages or full refund',
    guarantee_metric: 1500,
    bonuses: [
      { name: 'Pre-pilot rep training workshop', value: 2000 },
      { name: 'Custom objection-handling library', value: 1500 },
      { name: '30-day execution audit with founder', value: 1500 },
      { name: 'TCPA compliance template pack', value: 1000 },
    ],
    total_bonus_value: 6000,
  },
  COMMAND: {
    name: 'Command',
    price_monthly: 2999,
    price_annual: 29990,
    annual_savings_vs_monthly: 5998,
    priceDisplay: '$2,999/mo or $29,990/year',
    periodDisplay: '/mo',
    description: 'Multi-channel AI sales execution for your entire floor.',
    features: [
      'AI text, email, and CRM note generation',
      'Multi-channel: VinSolutions, Gmail, LinkedIn, Facebook, Messenger, Instagram',
      'Voice-first input — dictate from anywhere on the lot',
      'Custom dealership voice training',
      'Real-time GM dashboard with rep leaderboard',
      'Ghost lead queue + recovery alerts',
      'Objection coaching with live classification',
      'Rep-level analytics and streaks',
      'Owner ROI dashboard',
      '30-day money-back guarantee',
    ],
  },
  GROUP: {
    name: 'Group',
    price_starting: 9999,
    min_rooftops: 3,
    price_per_rooftop_approx: 3333,
    priceDisplay: 'Starts at $9,999/mo for 3 rooftops',
    periodDisplay: '/mo',
    description: 'Multi-rooftop dealer groups with cross-store benchmarking.',
    features: [
      'Everything in Command',
      'Multi-rooftop owner dashboard',
      'Cross-store rep benchmarking',
      'Dedicated implementation support',
      'Managed services by founder',
      'Volume pricing for 5+ rooftops',
    ],
  },
  // Competitor anchors — for landing page and demo deck
  COMPETITORS: {
    conversica: { name: 'Conversica', price_annual: 36000, note: 'Lead follow-up only. No multi-channel. No GM dashboard. 12-month lock-in. No money-back.' },
    numa: { name: 'Numa', price_annual: 30000, note: 'Inbound response only. One surface. No outbound coaching.' },
    bdc_hire: { name: 'BDC Specialist Hire', price_annual_low: 55000, price_annual_high: 75000, note: 'One set of eyes. 40 hours/week. One channel at a time.' },
  },
} as const;

/** Tier keys for type-safe lookups */
export type PricingTier = 'FOUNDING_PILOT' | 'COMMAND' | 'GROUP';

/** Format a price for display — e.g. formatPrice(2999) => "$2,999" */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

/** Get the full pricing line for a tier */
export function getPricingLine(tier: PricingTier): string {
  if (tier === 'FOUNDING_PILOT') return `${PRICING.FOUNDING_PILOT.priceDisplay} one-time for ${PRICING.FOUNDING_PILOT.duration_days} days`;
  if (tier === 'COMMAND') return PRICING.COMMAND.priceDisplay;
  if (tier === 'GROUP') return PRICING.GROUP.priceDisplay;
  return '';
}
