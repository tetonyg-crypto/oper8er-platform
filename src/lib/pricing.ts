/**
 * SINGLE SOURCE OF TRUTH — Brevmont Pricing
 * Locked: 2026-04-12
 *
 * ALL pricing references across the codebase should import from this file.
 * Do NOT hardcode dollar amounts anywhere else.
 *
 * To change pricing: update this file, then grep for any remaining
 * hardcoded amounts and update those too.
 */

export const PRICING = {
  FOUNDING_PILOT: {
    name: 'Founding Dealer Pilot',
    price: 5000,
    period: '90 days',
    priceDisplay: '$5,000',
    periodDisplay: 'flat for 90 days',
    description: 'First 5 dealers only. Converts to Command at founding rates after pilot.',
    duration_days: 90,
    loyalty_discount_pct: 15,
    rate_lock_months: 12,
    max_dealers: 5,
    money_back_days: 30,
  },
  FLOOR: {
    name: 'Floor',
    price: 1350,
    period: 'month',
    priceDisplay: '$1,350',
    periodDisplay: '/mo',
    description: 'Self-serve VinSolutions integration',
    features: [
      'AI text, email, and CRM generation',
      'Self-serve onboarding',
      'VinSolutions integration',
      'Activity feed',
      'Up to 5 reps included',
    ],
  },
  COMMAND: {
    name: 'Command',
    price_monthly: 3500,
    price_annual: 35000,
    annual_savings: 7000,
    onboarding_fee: 2500,
    priceDisplay: '$3,500/mo or $35K/year',
    periodDisplay: '/mo',
    description: 'Multi-CRM, voice cloning, advanced analytics',
    features: [
      'Everything in Floor',
      'Multi-CRM support',
      'GM dashboard + analytics',
      'Ghost lead queue + recovery',
      'Voice cloning',
      'Advanced objection tracking',
    ],
  },
  GROUP: {
    name: 'Group',
    priceDisplay: 'Custom',
    periodDisplay: '',
    description: 'Multi-rooftop dealer groups. Contact for quote.',
    features: [
      'Everything in Command',
      'Multi-rooftop rollup',
      'Group-level reporting',
      'Dedicated onboarding',
      'Priority support',
    ],
  },
} as const;

/** Tier keys for type-safe lookups */
export type PricingTier = keyof typeof PRICING;

/** Format a price for display — e.g. formatPrice(3500) => "$3,500" */
export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

/** Get the full pricing line for a tier */
export function getPricingLine(tier: PricingTier): string {
  const t = PRICING[tier];
  if (tier === 'FOUNDING_PILOT') return `${t.priceDisplay} flat for ${PRICING.FOUNDING_PILOT.duration_days} days`;
  if (tier === 'FLOOR') return `${t.priceDisplay}/mo`;
  if (tier === 'COMMAND') return `${PRICING.COMMAND.priceDisplay}`;
  if (tier === 'GROUP') return 'Custom — contact for quote';
  return t.priceDisplay;
}
