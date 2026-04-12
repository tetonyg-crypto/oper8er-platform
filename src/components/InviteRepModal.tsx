import { useState } from 'react'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface InviteRepModalProps {
  open: boolean
  onClose: () => void
  accessToken: string
  onSuccess: () => void
}

export default function InviteRepModal({ open, onClose, accessToken, onSuccess }: InviteRepModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  if (!open) return null

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    try {
      const resp = await fetch(`${PROXY_URL}/api/owner/invite-rep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await resp.json()

      if (!resp.ok) {
        setError(data.error || 'Failed to send invite')
        setLoading(false)
        return
      }

      setSent(true)
      setLoading(false)
      setTimeout(() => {
        onSuccess()
        onClose()
        setSent(false)
        setEmail('')
      }, 1500)
    } catch {
      setError('Network error. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card w-[420px]">
        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-3">
              <span className="text-[#34C759] text-xl">&#10003;</span>
            </div>
            <p className="text-sm font-semibold text-[#1C1C1E]">Invite sent to {email}</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-1">Invite a Rep</h2>
            <p className="text-sm text-[#636366] mb-4">
              They'll receive an email with the extension install link and your license key.
            </p>

            <div className="mb-4">
              <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1.5">
                Rep's email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rep@dealership.com"
                className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD]"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>

            {error && <p className="text-sm text-[#FF3B30] mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-[#636366] hover:bg-[#F2F2F7] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !email.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#7F77DD] hover:bg-[#534AB7] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
