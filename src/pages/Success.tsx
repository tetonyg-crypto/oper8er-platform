import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const PROXY_URL = 'https://web-production-af474.up.railway.app'
const CWS_URL = 'https://chromewebstore.google.com/detail/brevmont'

interface SessionData {
  dealership_name: string
  license_key: string
  email: string
  status: string
}

export default function Success() {
  const [data, setData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (!sessionId) {
      setLoading(false)
      return
    }

    fetch(`${PROXY_URL}/api/session/${sessionId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const copyKey = () => {
    if (data?.license_key) {
      navigator.clipboard.writeText(data.license_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-[#7F77DD] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">B</span>
          </div>
          <p className="text-[#636366]">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (!data || data.status !== 'paid') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-[500px] text-center">
          <div className="w-10 h-10 rounded-lg bg-[#7F77DD] flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1C1C1E] mb-3">Something went wrong</h1>
          <p className="text-[#636366] mb-6">
            We couldn't confirm your payment. If you were charged, email{' '}
            <a href="mailto:founder@brevmont.com" className="text-[#7F77DD] underline">founder@brevmont.com</a>{' '}
            and we'll get you set up immediately.
          </p>
          <Link to="/" className="text-sm font-semibold text-[#7F77DD] hover:underline">
            Back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-black/5 px-6 py-3">
        <div className="max-w-[800px] mx-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E] text-lg">Brevmont</span>
        </div>
      </nav>

      <div className="max-w-[640px] mx-auto px-6 py-16">
        {/* Confirmation */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-5">
            <span className="text-[#34C759] text-3xl">&#10003;</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1C1C1E] mb-2">
            Welcome to Brevmont{data.dealership_name ? `, ${data.dealership_name}` : ''}
          </h1>
          <p className="text-[#636366]">
            Your account is active. Get your first rep generating in under 10 minutes.
          </p>
        </div>

        {/* License Key */}
        <div className="card mb-8 border-2 border-[#7F77DD]/20">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-2">
            Your License Key
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-2xl font-bold text-[#7F77DD] tracking-wider font-mono">
              {data.license_key}
            </code>
            <button
              onClick={copyKey}
              className="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-[#AEAEB2] mt-2">
            Every rep on your floor needs this key. Forward it or share your screen.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-[#1C1C1E]">Get your team live in 3 steps</h2>

          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#7F77DD] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1C1C1E] mb-1">Install the Chrome extension</h3>
              <p className="text-sm text-[#636366] mb-3">
                Each rep installs Brevmont from the Chrome Web Store. Takes 30 seconds.
              </p>
              <a
                href={CWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#1C1C1E] hover:bg-[#333] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Install Extension
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#7F77DD] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1C1C1E] mb-1">Reps complete the 2-minute setup</h3>
              <p className="text-sm text-[#636366]">
                The extension walks each rep through a 4-step onboarding: name, dealership, communication style, and common objections. They enter the license key in step 2. The whole thing takes under 2 minutes.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#7F77DD] flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1C1C1E] mb-1">Open VinSolutions and click the purple button</h3>
              <p className="text-sm text-[#636366]">
                Navigate to any customer in VinSolutions. The Brevmont button appears automatically. Click it, describe the situation, and hit Generate. Text, email, and CRM note in under 5 seconds.
              </p>
            </div>
          </div>
        </div>

        {/* Support + Dashboard links */}
        <div className="mt-12 pt-8 border-t border-black/8 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#636366]">
              Need help? Email{' '}
              <a href="mailto:founder@brevmont.com" className="text-[#7F77DD] underline">founder@brevmont.com</a>
            </p>
            <p className="text-xs text-[#AEAEB2] mt-1">We respond within the hour during MST business hours.</p>
          </div>
          <Link
            to="/dashboard"
            className="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Open Dashboard
          </Link>
        </div>

        {/* Check email reminder */}
        {data.email && (
          <div className="mt-6 bg-[#F2F2F7] rounded-xl p-4 text-center">
            <p className="text-sm text-[#636366]">
              We also sent these instructions to <strong className="text-[#1C1C1E]">{data.email}</strong>.
              <br />Forward that email to your sales floor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
