import { useState } from 'react'
import { Link } from 'react-router-dom'

const PROXY_URL = 'https://oper8er-proxy-production.up.railway.app'

export default function Support() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !message.trim()) return

    setSending(true)
    setError('')

    try {
      const resp = await fetch(`${PROXY_URL}/api/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), message: message.trim(), name: name.trim() }),
      })
      if (!resp.ok) throw new Error('Failed to send')
      setSent(true)
    } catch {
      setError('Something went wrong. Please try emailing us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <nav className="bg-white border-b border-black/5 px-4 md:px-6 py-3">
        <div className="max-w-[600px] mx-auto flex items-center justify-between">
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

      <div className="max-w-[600px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">Contact Support</h1>
        <p className="text-sm text-[#636366] mb-8">
          We typically respond within 4 business hours.
        </p>

        {sent ? (
          <div className="card p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-[#34C759] text-2xl">&#10003;</span>
            </div>
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-2">Message received</h2>
            <p className="text-sm text-[#636366]">
              We received your message. Expect a response within 4 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD]"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gm@yourdealership.com"
                required
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD]"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the issue or question..."
                required
                rows={5}
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD] resize-none"
              />
            </div>

            {error && <p className="text-sm text-[#FF3B30]">{error}</p>}

            <button
              type="submit"
              disabled={sending || !email.trim() || !message.trim()}
              className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        )}

        {/* Alternative contact */}
        <div className="mt-8 space-y-3 text-center">
          <p className="text-sm text-[#636366]">
            Email us directly:{' '}
            <a href="mailto:founder@brevmont.com" className="text-[#7F77DD] underline">founder@brevmont.com</a>
          </p>
          <p className="text-sm text-[#636366]">
            Need urgent help? Call{' '}
            <a href="tel:3076993743" className="text-[#7F77DD] underline">307-699-3743</a>
          </p>
        </div>
      </div>
    </div>
  )
}
