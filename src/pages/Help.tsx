import { useState } from 'react'
import { Link } from 'react-router-dom'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What CRMs does Brevmont support?',
    answer: 'Currently VinSolutions, with Gmail, Facebook, LinkedIn, and Instagram messaging platforms. DealerSocket and Tekion support coming soon.',
  },
  {
    question: 'How long does setup take?',
    answer: 'Under 5 minutes. Install the Chrome extension, enter your license key, and start generating.',
  },
  {
    question: 'Do my reps need to change their process?',
    answer: "No. Brevmont lives inside the tools they already use. It adds a sidebar \u2014 it doesn\u2019t replace anything.",
  },
  {
    question: 'How does the voice feature work?',
    answer: "Click the mic icon in the sidebar, describe the situation in plain language, and Brevmont generates the response. Works with your device\u2019s built-in microphone.",
  },
  {
    question: 'What are the pricing tiers?',
    answer: 'Founding Dealer Pilot ($2,500 one-time for 90 days, first 5 dealers only, converts to $1,999/mo founding rate), Command ($2,999/mo or $29,990/year for your entire floor), and Group (starts at $9,999/mo for 3+ rooftops).',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes. We use SHA-256 hashing for customer identities, row-level security in our database, and HMAC-signed API requests. See our privacy policy at /privacy.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. No annual contracts required. Cancel through the billing portal in your owner dashboard.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Email founder@brevmont.com or visit /support. We respond within 4 business hours.',
  },
]

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <nav className="bg-white border-b border-black/5 px-4 md:px-6 py-3">
        <div className="max-w-[700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-[#1C1C1E] text-lg">Brevmont</span>
          </div>
          <Link to="/owner" className="text-sm text-[#7F77DD] hover:underline">
            Back to dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-[700px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">Help Center</h1>
        <p className="text-sm text-[#636366] mb-8">
          Frequently asked questions about Brevmont.
        </p>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-[#F9F9FB] transition-colors"
              >
                <span className="text-sm font-semibold text-[#1C1C1E] pr-4">{item.question}</span>
                <svg
                  className={`w-4 h-4 text-[#AEAEB2] shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-[#636366] leading-relaxed border-t border-black/5 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still need help */}
        <div className="mt-10 text-center">
          <p className="text-sm text-[#636366] mb-3">Still have questions?</p>
          <Link
            to="/support"
            className="inline-block bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
