import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
// Pricing constants available at ../../lib/pricing.ts

function useLiveStats() {
  const [stats, setStats] = useState([
    { value: '—', label: 'Outputs Generated' },
    { value: '—', label: 'Dealerships Active' },
    { value: '6', label: 'Platforms Connected' },
    { value: '<3s', label: 'Generation Time' },
  ])

  useEffect(() => {
    Promise.all([
      supabase.from('generation_events').select('id', { count: 'exact', head: true }),
      supabase.from('dealerships').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]).then(([events, dealers]) => {
      const evtCount = events.count || 0
      const dlrCount = dealers.count || 0
      setStats([
        { value: evtCount.toLocaleString(), label: 'Outputs Generated' },
        { value: String(dlrCount), label: 'Dealerships Active' },
        { value: '6', label: 'Platforms Connected' },
        { value: '<3s', label: 'Generation Time' },
      ])
    })
  }, [])

  return stats
}

const PRODUCTS: { name: string; tagline: string; features: string[] }[] = [
  {
    name: 'Floor',
    tagline: 'AI copilot for every rep on the floor.',
    features: [
      'Generate texts, emails, and CRM notes in under 3 seconds',
      'Works inside VinSolutions',
      'Self-serve onboarding',
      'Activity feed shows exactly what every rep is doing, in real time',
    ],
  },
  {
    name: 'Command',
    tagline: 'Full GM visibility and ghost lead recovery.',
    features: [
      'Multi-CRM support',
      'GM dashboard with advanced analytics',
      'Ghost lead queue identifies leads going cold',
      'Voice cloning and objection tracking',
    ],
  },
  {
    name: 'Group',
    tagline: 'Multi-rooftop sales floor intelligence.',
    features: [
      'Everything in Command across all locations',
      'Multi-rooftop rollup and group-level reporting',
      'Dedicated onboarding and priority support',
      'Custom pricing — contact for quote',
    ],
  },
]

const PROXY_URL = 'https://oper8er-proxy-production.up.railway.app'

const PRICING = [
  {
    name: 'Floor',
    price: '$1,350',
    period: '/mo',
    features: [
      'AI text, email, and CRM generation',
      'Self-serve onboarding',
      'VinSolutions integration',
      'Activity feed',
      'Up to 5 reps included',
    ],
    cta: 'Start with Floor',
    tier: 'floor',
    highlighted: false,
  },
  {
    name: 'Command',
    price: '$3,500',
    period: '/mo',
    features: [
      'Everything in Floor',
      'Multi-CRM support',
      'GM dashboard + analytics',
      'Ghost lead queue + recovery',
      'Voice cloning',
      '$35K/year option (save $7,000)',
    ],
    cta: 'Get Command',
    tier: 'command',
    highlighted: true,
  },
  {
    name: 'Group',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Command',
      'Multi-rooftop rollup',
      'Group-level reporting',
      'Dedicated onboarding',
      'Priority support',
      'Contact for quote',
    ],
    cta: 'Contact Us',
    tier: 'group',
    highlighted: false,
  },
]

async function startCheckout(tier: string) {
  if (tier === 'group') {
    window.location.href = 'mailto:founder@brevmont.com?subject=Brevmont Group Pricing'
    return
  }
  try {
    const resp = await fetch(`${PROXY_URL}/api/create-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier })
    })
    const data = await resp.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      alert('Unable to start checkout. Please email founder@brevmont.com.')
    }
  } catch {
    alert('Unable to start checkout. Please email founder@brevmont.com.')
  }
}

export default function Landing() {
  const STATS = useLiveStats()
  const [activeProduct, setActiveProduct] = useState(0)

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-[#1C1C1E] text-lg">Brevmont</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#product" className="text-sm font-medium text-[#636366] hover:text-[#1C1C1E] transition-colors">
              Product
            </a>
            <a href="#pricing" className="text-sm font-medium text-[#636366] hover:text-[#1C1C1E] transition-colors">
              Pricing
            </a>
            <Link to="/dashboard" className="text-sm font-medium text-[#636366] hover:text-[#1C1C1E] transition-colors">
              Dashboard
            </Link>
          </div>
          <a
            href="#cta"
            className="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Book a Demo
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <span className="inline-block bg-[#F0EFFF] text-[#7F77DD] text-xs font-semibold px-3 py-1 rounded-full mb-6">
            AI-Powered Sales Execution
          </span>
          <h1 className="text-5xl font-bold text-[#1C1C1E] leading-tight mb-5 tracking-tight">
            Your dealership's AI sales floor.
          </h1>
          <p className="text-lg text-[#636366] leading-relaxed mb-8 max-w-[640px] mx-auto">
            Brevmont gives every rep an AI copilot that generates texts, emails, and CRM notes in
            seconds — then shows management who's working and who's not.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="#cta"
              className="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Book a Demo
            </a>
            <Link
              to="/dashboard"
              className="border border-black/10 text-[#1C1C1E] text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#F2F2F7] transition-colors"
            >
              See the Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stat Bar */}
      <section className="py-8 border-y border-black/5 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#1C1C1E] tracking-tight">{s.value}</p>
              <p className="text-xs text-[#AEAEB2] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Tabs */}
      <section id="product" className="py-20 px-6">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#7F77DD] text-center mb-3">
            The Platform
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C1E] text-center mb-10 tracking-tight">
            Three tools. One sales floor.
          </h2>
          <div className="flex justify-center gap-2 mb-10">
            {PRODUCTS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setActiveProduct(i)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                  activeProduct === i
                    ? 'bg-[#7F77DD] text-white'
                    : 'bg-[#F2F2F7] text-[#636366] hover:bg-[#E8E8ED]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="card p-8">
            <h3 className="text-xl font-bold text-[#1C1C1E] mb-2">
              {PRODUCTS[activeProduct].name}
            </h3>
            <p className="text-[#636366] mb-6">{PRODUCTS[activeProduct].tagline}</p>
            <ul className="space-y-3">
              {PRODUCTS[activeProduct].features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    &#10003;
                  </span>
                  <span className="text-sm text-[#1C1C1E]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-[#F2F2F7]">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#7F77DD] text-center mb-3">
            Pricing
          </p>
          <h2 className="text-3xl font-bold text-[#1C1C1E] text-center mb-10 tracking-tight">
            Simple pricing. Serious ROI.
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`card p-6 flex flex-col ${
                  plan.highlighted ? 'ring-2 ring-[#7F77DD] relative' : ''
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7F77DD] text-white text-[10px] font-semibold px-3 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-[#1C1C1E] mb-1">{plan.name}</h3>
                <div className="mb-5">
                  <span className="text-3xl font-bold text-[#1C1C1E] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#AEAEB2]">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#7F77DD] text-xs mt-0.5">&#10003;</span>
                      <span className="text-sm text-[#636366]">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout(plan.tier)}
                  className={`block w-full text-center text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer ${
                    plan.highlighted
                      ? 'bg-[#7F77DD] hover:bg-[#534AB7] text-white'
                      : 'border border-black/10 text-[#1C1C1E] hover:bg-[#F2F2F7]'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-20 px-6 bg-[#1C1C1E]">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
            Ready to see your floor in real time?
          </h2>
          <p className="text-[#AEAEB2] mb-8">
            Book a 15-minute demo and see Brevmont running on your dealership's actual data.
          </p>
          <a
            href="mailto:founder@brevmont.com?subject=Brevmont Demo Request"
            className="inline-block bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Book a Demo
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#111113]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#7F77DD] flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-bold text-white">Brevmont</span>
            </div>
            <p className="text-sm text-[#636366] leading-relaxed">
              AI sales execution infrastructure for dealerships. Brevmont Labs LLC.
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
              Product
            </p>
            <ul className="space-y-2">
              <li>
                <a href="#product" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Floor
                </a>
              </li>
              <li>
                <a href="#product" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Command
                </a>
              </li>
              <li>
                <a href="#product" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Group
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
              Company
            </p>
            <ul className="space-y-2">
              <li>
                <a href="mailto:founder@brevmont.com" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-[#AEAEB2] hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1100px] mx-auto mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-[#636366]">
            &copy; {new Date().getFullYear()} Brevmont Labs LLC. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
