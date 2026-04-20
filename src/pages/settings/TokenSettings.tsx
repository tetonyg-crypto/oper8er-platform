import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/AuthProvider'

const PROXY_URL = 'https://oper8er-proxy-production.up.railway.app'

/**
 * Per-rep extension token management.
 *
 * Each rep has a unique opaque token (BRVMT-REP-*) they paste into the
 * Brevmont Chrome extension during onboarding. The token ties every
 * generation back to their rep_id (not a rep_name string). Session-authed
 * users can see their own token here; no cross-rep access.
 *
 * Endpoints used:
 *   POST /api/rep/install-token — creates-or-fetches (idempotent)
 *   POST /api/rep/revoke-token  — revokes active token; next install mints fresh
 */
export default function TokenSettings() {
  const { session, profile, loading: authLoading } = useAuth()
  const accessToken = session?.access_token

  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)

  async function fetchToken() {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(`${PROXY_URL}/api/rep/install-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.message || data.error || `Failed (HTTP ${resp.status})`)
        return
      }
      setToken(data.token || null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (accessToken && !authLoading) fetchToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, authLoading])

  async function handleCopy() {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy — select the token and copy manually.')
    }
  }

  async function handleRegenerate() {
    if (!accessToken || !token) return
    if (!confirm('Regenerate your token? The current one will stop working in the extension. You will need to paste the new one during onboarding.')) {
      return
    }
    setRegenerating(true)
    setError(null)
    try {
      // Revoke the current one, then call install-token to mint fresh.
      const revokeResp = await fetch(`${PROXY_URL}/api/rep/revoke-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason: 'dashboard_regenerate' }),
      })
      if (!revokeResp.ok) {
        const d = await revokeResp.json().catch(() => ({}))
        setError(d.message || d.error || `Revoke failed (HTTP ${revokeResp.status})`)
        return
      }
      await fetchToken()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Regenerate failed')
    } finally {
      setRegenerating(false)
    }
  }

  async function handleRevoke() {
    if (!accessToken || !token) return
    if (!confirm('Revoke your token? Your extension will stop generating until you reinstall a new token.')) {
      return
    }
    setRevoking(true)
    setError(null)
    try {
      const resp = await fetch(`${PROXY_URL}/api/rep/revoke-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ reason: 'dashboard_revoke' }),
      })
      if (!resp.ok) {
        const d = await resp.json().catch(() => ({}))
        setError(d.message || d.error || `Revoke failed (HTTP ${resp.status})`)
        return
      }
      setToken(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Revoke failed')
    } finally {
      setRevoking(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6">
        <p className="text-sm text-[#AEAEB2]">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6">
        <div className="max-w-2xl mx-auto card">
          <p className="text-base font-semibold mb-2">Sign in required</p>
          <p className="text-sm text-[#636366] mb-4">
            You need to be signed in to view your extension token.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-medium text-[#7F77DD] hover:underline"
          >
            Go to login →
          </Link>
        </div>
      </div>
    )
  }

  const masked = token
    ? token.slice(0, 10) + '…' + token.slice(-4)
    : null

  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm text-[#636366] hover:text-[#1C1C1E] transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-xl font-semibold text-[#1C1C1E]">Extension Token</h1>
        </div>

        {/* Profile info */}
        <div className="card">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-2">
            Signed in as
          </p>
          <p className="text-sm text-[#1C1C1E] font-medium">
            {profile?.email || session.user?.email || 'Unknown'}
          </p>
          {profile?.role && (
            <p className="text-xs text-[#636366] mt-1">
              Role: <span className="font-medium">{profile.role}</span>
              {profile.dealership_id && (
                <span className="text-[#AEAEB2]"> · dealership linked</span>
              )}
              {!profile.dealership_id && (
                <span className="text-[#FF9500]">
                  {' '}· no dealership — token can't be issued until your profile is linked
                </span>
              )}
            </p>
          )}
        </div>

        {error && (
          <div className="card border border-[#FFE5E5] bg-[#FFF5F5]">
            <p className="text-sm text-[#FF3B30]">{error}</p>
          </div>
        )}

        {/* Token */}
        <div className="card">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
            Your Token
          </p>

          {loading && (
            <p className="text-sm text-[#AEAEB2] py-4">Loading token…</p>
          )}

          {!loading && !token && (
            <div className="space-y-3">
              <p className="text-sm text-[#636366]">
                No token yet. Click below to generate one.
              </p>
              <button
                onClick={fetchToken}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-[#7F77DD] text-white hover:bg-[#534AB7] transition-colors"
              >
                Generate Token
              </button>
            </div>
          )}

          {!loading && token && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wide text-[#AEAEB2] block mb-1">
                  Token (full)
                </label>
                <div className="flex items-stretch gap-2">
                  <code className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#F7F7F9] border border-[#E5E5EA] text-xs text-[#1C1C1E] font-mono select-all break-all">
                    {token}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                      copied
                        ? 'bg-[#34C759] text-white'
                        : 'bg-[#7F77DD] text-white hover:bg-[#534AB7]'
                    }`}
                  >
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-[#AEAEB2] mt-1 font-mono">
                  Preview: {masked}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFEFF4]">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-2">
                  How to use
                </p>
                <ol className="text-sm text-[#1C1C1E] space-y-1 list-decimal pl-5">
                  <li>Open the Brevmont Chrome extension</li>
                  <li>
                    Go to Settings → Extension Token (or re-run onboarding if the token
                    field isn't visible)
                  </li>
                  <li>Paste the token above and save</li>
                  <li>Reload VinSolutions — all new generations attribute to you</li>
                </ol>
              </div>

              <div className="pt-3 border-t border-[#EFEFF4] flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || revoking}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-[#E5E5EA] text-[#1C1C1E] hover:bg-[#F7F7F9] disabled:opacity-50 transition-colors"
                >
                  {regenerating ? 'Regenerating…' : 'Regenerate'}
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={regenerating || revoking}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-[#FFE5E5] text-[#FF3B30] hover:bg-[#FFF5F5] disabled:opacity-50 transition-colors"
                >
                  {revoking ? 'Revoking…' : 'Revoke'}
                </button>
                <p className="text-[10px] text-[#AEAEB2] ml-auto">
                  Regenerate if your token leaked. Revoke if you've uninstalled the
                  extension for good.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#AEAEB2] text-center">
          Tokens are per-rep. Each rep manages their own from this page. If you're a
          GM or owner, ask each rep to sign into the dashboard and visit{' '}
          <code>/settings/token</code>.
        </p>
      </div>
    </div>
  )
}
