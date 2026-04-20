import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'
import { supabase } from '../lib/supabase'

const PROXY_URL = 'https://oper8er-proxy-production.up.railway.app'

/**
 * Invite-accept landing. Reps click the "Join {Dealership}" button in the
 * branded invite email (routes to `/join/:dealershipId`). Prior to this page
 * existing, that URL 404'd and the invite accept rate was 0%.
 *
 * Flow:
 *   1. Validate the dealership exists via GET /api/join/:dealership_uuid
 *   2. If already signed in: POST /api/owner/join-dealership → redirect
 *      to /dashboard on success
 *   3. If not signed in: show a magic-link form; on sign-in, bounce back
 *      to this route so step 2 fires
 *
 * Edge cases handled:
 *   - Dealership not found / not active → clean "ask for a new invite"
 *   - Already a member → fast-redirect to /dashboard
 *   - No invite on file for this email (non-founder) → explain + re-request
 *   - Invite expired → explain + re-request
 */

interface DealerInfo {
  dealership_name: string
  tier: string | null
}

export default function Join() {
  const { dealershipId } = useParams<{ dealershipId: string }>()
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()

  const [dealer, setDealer] = useState<DealerInfo | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [magicEmail, setMagicEmail] = useState('')
  const [magicSending, setMagicSending] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  // Step 1: validate dealership on mount
  useEffect(() => {
    let cancelled = false
    async function lookup() {
      if (!dealershipId) {
        setLookupError('Missing dealership id in URL.')
        return
      }
      try {
        const resp = await fetch(
          `${PROXY_URL}/api/join/${encodeURIComponent(dealershipId)}`
        )
        if (!resp.ok) {
          const d = await resp.json().catch(() => ({}))
          if (!cancelled)
            setLookupError(
              d.error ||
                'Invite link invalid or expired. Ask your dealership to resend it.'
            )
          return
        }
        const data = await resp.json()
        if (!cancelled) setDealer(data)
      } catch (e) {
        if (!cancelled)
          setLookupError(e instanceof Error ? e.message : 'Network error')
      }
    }
    lookup()
    return () => {
      cancelled = true
    }
  }, [dealershipId])

  // Step 2: if authed + dealership resolved, fire the join
  useEffect(() => {
    if (authLoading || !session || !dealer || !dealershipId) return
    if (joining || joinError) return
    let cancelled = false
    async function join() {
      setJoining(true)
      setJoinError(null)
      try {
        const resp = await fetch(`${PROXY_URL}/api/owner/join-dealership`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session!.access_token}`,
          },
          body: JSON.stringify({ dealership_id: dealershipId }),
        })
        const data = await resp.json().catch(() => ({}))
        if (!resp.ok) {
          if (!cancelled) {
            if (resp.status === 404 && data.error === 'no invitation for this email') {
              setJoinError(
                `This account isn't on the invite list for ${dealer?.dealership_name}. Sign in with the email your dealership invited, or ask them to add ${session?.user?.email}.`
              )
            } else if (resp.status === 410) {
              setJoinError('Your invite has expired. Ask your dealership to resend it.')
            } else {
              setJoinError(data.error || `Join failed (HTTP ${resp.status})`)
            }
          }
          return
        }
        // Success — go to dashboard
        if (!cancelled) {
          // Small delay so the success state is visible before the redirect
          setTimeout(() => navigate('/dashboard'), 600)
        }
      } catch (e) {
        if (!cancelled) setJoinError(e instanceof Error ? e.message : 'Join failed')
      } finally {
        if (!cancelled) setJoining(false)
      }
    }
    join()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session, dealer, dealershipId])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!magicEmail.trim()) return
    setMagicSending(true)
    setJoinError(null)
    try {
      // Bounce back to this exact join URL after auth so step 2 fires
      const redirectTo = `${window.location.origin}/join/${dealershipId}`
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail.trim(),
        options: { emailRedirectTo: redirectTo },
      })
      if (error) {
        setJoinError(error.message)
      } else {
        setMagicSent(true)
      }
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Magic link failed')
    } finally {
      setMagicSending(false)
    }
  }

  if (lookupError) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6 flex items-start justify-center">
        <div className="max-w-lg w-full card mt-16">
          <p className="text-base font-semibold text-[#1C1C1E] mb-2">
            Invite unavailable
          </p>
          <p className="text-sm text-[#636366] mb-4">{lookupError}</p>
          <Link
            to="/"
            className="inline-block text-sm font-medium text-[#7F77DD] hover:underline"
          >
            brevmont.com →
          </Link>
        </div>
      </div>
    )
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6 flex items-start justify-center">
        <div className="max-w-lg w-full card mt-16">
          <p className="text-sm text-[#AEAEB2]">Checking your invite…</p>
        </div>
      </div>
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6 flex items-start justify-center">
        <div className="max-w-lg w-full card mt-16">
          <p className="text-sm text-[#AEAEB2]">Loading your session…</p>
        </div>
      </div>
    )
  }

  // Not authenticated — magic link form
  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6 flex items-start justify-center">
        <div className="max-w-lg w-full card mt-16 space-y-5">
          <div>
            <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">
              You've been invited
            </p>
            <p className="text-xl font-semibold text-[#1C1C1E]">
              Join {dealer.dealership_name}
            </p>
            <p className="text-sm text-[#636366] mt-1">
              Sign in with the email your dealership invited. We'll send a one-time
              link.
            </p>
          </div>

          {magicSent ? (
            <div className="rounded-xl bg-[#EAF7EF] border border-[#34C759]/20 p-4">
              <p className="text-sm font-medium text-[#1C1C1E] mb-1">
                Magic link sent
              </p>
              <p className="text-xs text-[#636366]">
                Check <span className="font-semibold">{magicEmail}</span>. The link
                returns you here and finishes the join automatically.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                required
                placeholder="you@yourdealership.com"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5EA] text-sm focus:outline-none focus:border-[#7F77DD] focus:ring-2 focus:ring-[#7F77DD]/20 transition-all"
                autoComplete="email"
                autoFocus
              />
              <button
                type="submit"
                disabled={magicSending || !magicEmail.trim()}
                className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-[#7F77DD] text-white hover:bg-[#534AB7] disabled:opacity-50 transition-colors"
              >
                {magicSending ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}

          {joinError && (
            <p className="text-xs text-[#FF3B30]">{joinError}</p>
          )}

          <p className="text-[11px] text-[#AEAEB2] pt-3 border-t border-[#EFEFF4]">
            Already signed in elsewhere? <Link to="/dashboard" className="text-[#7F77DD] hover:underline">Go to dashboard</Link>.
          </p>
        </div>
      </div>
    )
  }

  // Authenticated — joining (or error)
  return (
    <div className="min-h-screen bg-[#F7F7F9] p-6 flex items-start justify-center">
      <div className="max-w-lg w-full card mt-16 space-y-4">
        <div>
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">
            {joinError ? 'Join issue' : 'Finishing up'}
          </p>
          <p className="text-xl font-semibold text-[#1C1C1E]">
            {dealer.dealership_name}
          </p>
          <p className="text-xs text-[#636366] mt-1">
            Signed in as {session.user.email}
          </p>
        </div>

        {joining && (
          <p className="text-sm text-[#636366]">Linking your profile to {dealer.dealership_name}…</p>
        )}

        {joinError && (
          <div className="space-y-3">
            <div className="rounded-xl bg-[#FFF5F5] border border-[#FFE5E5] p-4">
              <p className="text-sm text-[#FF3B30]">{joinError}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  navigate(`/join/${dealershipId}`)
                }}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-[#E5E5EA] text-[#1C1C1E] hover:bg-[#F7F7F9] transition-colors"
              >
                Sign out and try a different email
              </button>
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-[#E5E5EA] text-[#7F77DD] hover:bg-[#F7F7F9] transition-colors"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        )}

        {!joining && !joinError && (
          <p className="text-sm text-[#34C759] font-medium">
            ✓ You're in. Redirecting to your dashboard…
          </p>
        )}
      </div>
    </div>
  )
}
