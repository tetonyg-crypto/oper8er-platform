import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/AuthProvider'
import MetricCard from '../components/MetricCard'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import RepLeaderboard from '../components/dashboard/RepLeaderboard'
import GhostQueue from '../components/dashboard/GhostQueue'
import InviteRepModal from '../components/InviteRepModal'
import OnboardingView from '../components/OnboardingView'
import type { GenerationEvent } from '../hooks/useEvents'

const PROXY_URL = 'https://oper8er-proxy-production.up.railway.app'

interface OwnerData {
  dealership: {
    name: string
    tier: string
    license_key: string
    stripe_customer_id: string | null
  }
  reps: { id: string; name: string; status: string }[]
  events: GenerationEvent[]
  invites: { id: string; email: string; status: string; created_at: string }[]
  stats: {
    total: number
    today: number
    thisWeek: number
    activeReps: number
  }
}

export default function Owner() {
  const { session, profile, logout } = useAuth()
  const [data, setData] = useState<OwnerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [onboardingState, setOnboardingState] = useState<any>(null)

  const fetchDashboard = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const resp = await fetch(`${PROXY_URL}/api/owner/dashboard`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (resp.ok) {
        const d = await resp.json()
        setData(d)
        // Check onboarding state — show guided view for new dealerships
        const showOnboarding = d.stats?.total < 5 || !d.reps?.length
        if (showOnboarding) {
          setOnboardingState({
            rep_added_at: d.reps?.length > 0 ? new Date().toISOString() : null,
            extension_installed_at: d.stats?.total > 0 ? new Date().toISOString() : null,
            first_generation_at: d.stats?.total > 0 ? new Date().toISOString() : null,
            first_week_complete_at: d.stats?.total >= 5 ? new Date().toISOString() : null,
          })
        } else {
          setOnboardingState(null)
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const handleBilling = async () => {
    if (!session?.access_token) return
    try {
      const resp = await fetch(`${PROXY_URL}/api/billing-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      const d = await resp.json()
      if (d.url) window.location.href = d.url
      else alert(d.error || 'Unable to open billing portal')
    } catch {
      alert('Unable to open billing portal. Email founder@brevmont.com.')
    }
  }

  const copyKey = () => {
    if (data?.dealership?.license_key) {
      navigator.clipboard.writeText(data.dealership.license_key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const todayEvents = data?.events?.filter(e => {
    const today = new Date()
    const eventDate = new Date(e.created_at)
    return eventDate.toDateString() === today.toDateString()
  }) || []

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black/8 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E] text-lg">Brevmont</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[#636366]">{profile?.email}</span>
          <button
            onClick={handleBilling}
            className="text-sm font-medium text-[#7F77DD] hover:underline cursor-pointer"
          >
            Billing
          </button>
          <button
            onClick={logout}
            className="text-sm font-medium text-[#AEAEB2] hover:text-[#636366] cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-6">
        {/* Onboarding view for new dealerships */}
        {!loading && onboardingState && (
          <div className="mb-6">
            <OnboardingView state={onboardingState} dealershipName={data?.dealership?.name || 'Your Dealership'} />
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card h-20 animate-pulse bg-[#F2F2F7]" />
              ))}
            </div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1C1C1E]">{data.dealership.name}</h1>
                <span className="text-xs font-semibold text-[#7F77DD] bg-[#F0EFFF] px-2 py-0.5 rounded-full uppercase">
                  {data.dealership.tier}
                </span>
              </div>
              <button
                onClick={() => setShowInvite(true)}
                className="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Invite Rep
              </button>
            </div>

            {/* License Key */}
            <div className="card flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">License Key</p>
                <code className="text-lg font-bold text-[#7F77DD] font-mono tracking-wider">
                  {data.dealership.license_key}
                </code>
              </div>
              <button
                onClick={copyKey}
                className="text-sm font-semibold text-[#7F77DD] hover:underline cursor-pointer"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Generations" value={data.stats.total} loading={false} />
              <MetricCard label="Today" value={data.stats.today} loading={false} />
              <MetricCard label="This Week" value={data.stats.thisWeek} loading={false} />
              <MetricCard label="Active Reps" value={data.reps.filter(r => r.status === 'active' && r.name !== 'House').length} loading={false} />
            </div>

            {/* Main content */}
            <div className="grid grid-cols-2 gap-4">
              <ActivityFeed events={data.events} />
              <RepLeaderboard todayEvents={todayEvents} allEvents={data.events} />
            </div>

            {/* Rep Management */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366]">
                  Your Team
                </p>
                <span className="text-xs text-[#AEAEB2]">
                  {data.reps.filter(r => r.name !== 'House').length} reps
                </span>
              </div>
              <div className="space-y-0">
                {data.reps.filter(r => r.name !== 'House').map(rep => (
                  <div key={rep.id} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F0EFFF] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#7F77DD]">
                          {rep.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-[#1C1C1E]">{rep.name}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      rep.status === 'active'
                        ? 'bg-[#34C759]/15 text-[#34C759]'
                        : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                    }`}>
                      {rep.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
                {data.invites.filter(i => i.status === 'pending').length > 0 && (
                  <>
                    <p className="text-[11px] uppercase font-semibold tracking-wide text-[#AEAEB2] pt-3 pb-1">
                      Pending Invites
                    </p>
                    {data.invites.filter(i => i.status === 'pending').map(inv => (
                      <div key={inv.id} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                        <span className="text-sm text-[#636366]">{inv.email}</span>
                        <span className="text-[10px] font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Ghost Queue */}
            <GhostQueue allEvents={data.events} />
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#636366]">Unable to load dashboard. Try refreshing.</p>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      <InviteRepModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        accessToken={session?.access_token || ''}
        onSuccess={fetchDashboard}
      />
    </div>
  )
}
