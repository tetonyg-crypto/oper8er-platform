import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithMagicLink } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    const { error: authError } = await signInWithMagicLink(email.trim())
    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#7F77DD] flex items-center justify-center">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E] text-xl">Brevmont</span>
        </div>

        <div className="card p-6">
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#34C759] text-2xl">&#10003;</span>
              </div>
              <h2 className="text-lg font-bold text-[#1C1C1E] mb-2">Check your email</h2>
              <p className="text-sm text-[#636366] mb-4">
                We sent a login link to <strong className="text-[#1C1C1E]">{email}</strong>.
                <br />Click it to access your dashboard.
              </p>
              <p className="text-xs text-[#AEAEB2]">
                Didn't get it? Check spam or{' '}
                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="text-[#7F77DD] underline cursor-pointer"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            /* Login form */
            <>
              <h2 className="text-lg font-bold text-[#1C1C1E] mb-1 text-center">
                Sign in to your dashboard
              </h2>
              <p className="text-sm text-[#636366] mb-6 text-center">
                Enter your email and we'll send you a login link.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
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

                {error && (
                  <p className="text-sm text-[#FF3B30] mb-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send magic link'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer links */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[#AEAEB2] hover:text-[#636366]">
            Back to homepage
          </Link>
          <span className="text-xs text-[#AEAEB2] mx-2">·</span>
          <a href="mailto:founder@brevmont.com" className="text-xs text-[#AEAEB2] hover:text-[#636366]">
            Need help?
          </a>
        </div>
      </div>
    </div>
  )
}
