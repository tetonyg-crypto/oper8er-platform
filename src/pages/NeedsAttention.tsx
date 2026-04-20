import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface EventRow {
  id: string
  customer_name: string | null
  rep_name: string | null
  rep_id: string | null
  vehicle: string | null
  platform: string | null
  created_at: string
  dealership: string | null
  dealership_id: string | null
}

interface DealRow {
  customer_name: string | null
  closed_at: string
}

interface AlertRow {
  customer_name: string | null
  alerted_at: string
  followed_up: boolean | null
}

interface StaleCustomer {
  customer_name: string
  rep_name: string | null
  rep_id: string | null
  vehicle: string | null
  platform: string | null
  last_activity: string
  hours_idle: number
}

type SortKey = 'age' | 'rep'

const THIRTY_DAYS_MS = 30 * 24 * 3600 * 1000
const FORTY_EIGHT_H_MS = 48 * 3600 * 1000

function formatAge(hoursIdle: number): string {
  if (hoursIdle < 48) return `${hoursIdle}h ago`
  return `${Math.round(hoursIdle / 24)}d ago`
}

function formatAbs(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function NeedsAttention() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [deals, setDeals] = useState<DealRow[]>([])
  const [alerts, setAlerts] = useState<AlertRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('age')

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      setLoading(true)
      try {
        const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString()
        const [evRes, dealRes, alertRes] = await Promise.all([
          supabase
            .from('generation_events')
            .select(
              'id, customer_name, rep_name, rep_id, vehicle, platform, created_at, dealership, dealership_id'
            )
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(5000),
          supabase
            .from('deal_outcomes')
            .select('customer_name, closed_at')
            .gte('closed_at', since)
            .limit(1000),
          supabase
            .from('ghost_alerts')
            .select('customer_name, alerted_at, followed_up')
            .gte('alerted_at', since)
            .order('alerted_at', { ascending: false })
            .limit(200),
        ])

        if (cancelled) return

        if (evRes.error) setError(evRes.error.message)
        setEvents((evRes.data as EventRow[]) || [])
        setDeals((dealRes.data as DealRow[]) || [])
        setAlerts((alertRes.data as AlertRow[]) || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    const interval = setInterval(fetchAll, 60_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Derive stale customers (last activity 48h–30d ago)
  const now = Date.now()
  const { staleCustomers, atRiskDeals, closedSet } = useMemo(() => {
    const lastByCustomer = new Map<string, EventRow>()
    for (const e of events) {
      const k = (e.customer_name || '').trim()
      if (!k) continue
      if (!lastByCustomer.has(k)) lastByCustomer.set(k, e)
    }
    const closed = new Set(
      deals.map((d) => (d.customer_name || '').trim().toLowerCase()).filter(Boolean)
    )
    const stale: StaleCustomer[] = []
    const atRisk: StaleCustomer[] = []
    for (const [customer, e] of lastByCustomer.entries()) {
      const age = now - new Date(e.created_at).getTime()
      const hours = Math.round(age / 3_600_000)
      const row: StaleCustomer = {
        customer_name: customer,
        rep_name: e.rep_name,
        rep_id: e.rep_id,
        vehicle: e.vehicle,
        platform: e.platform,
        last_activity: e.created_at,
        hours_idle: hours,
      }
      const isClosed = closed.has(customer.trim().toLowerCase())
      if (age >= FORTY_EIGHT_H_MS && age <= THIRTY_DAYS_MS) {
        stale.push(row)
      }
      if (!isClosed && age <= THIRTY_DAYS_MS) {
        atRisk.push(row)
      }
    }
    return { staleCustomers: stale, atRiskDeals: atRisk, closedSet: closed }
  }, [events, deals, now])

  // Keep closedSet reference so linters don't prune atRiskDeals comp
  void closedSet

  const sortFn = useMemo(() => {
    if (sort === 'rep')
      return (a: StaleCustomer, b: StaleCustomer) =>
        (a.rep_name || 'zzz').localeCompare(b.rep_name || 'zzz')
    return (a: StaleCustomer, b: StaleCustomer) => b.hours_idle - a.hours_idle
  }, [sort])

  const sortedStale = useMemo(() => [...staleCustomers].sort(sortFn), [staleCustomers, sortFn])
  const sortedAtRisk = useMemo(() => [...atRiskDeals].sort(sortFn), [atRiskDeals, sortFn])

  const row = (r: StaleCustomer, key: string) => (
    <div
      key={key}
      className="grid grid-cols-12 gap-3 items-center py-2 px-3 hover:bg-[#F7F7F9] transition-colors border-b border-[#EFEFF4] last:border-b-0"
    >
      <div className="col-span-4 min-w-0">
        <p className="text-sm font-medium text-[#1C1C1E] truncate">{r.customer_name}</p>
        {r.vehicle && (
          <p className="text-[11px] text-[#AEAEB2] truncate">{r.vehicle}</p>
        )}
      </div>
      <div className="col-span-3 min-w-0">
        {r.rep_id ? (
          <Link
            to={`/rep/${r.rep_id}`}
            className="text-xs text-[#7F77DD] hover:underline truncate block"
          >
            {r.rep_name || 'Unknown'}
          </Link>
        ) : (
          <span className="text-xs text-[#636366] truncate block">{r.rep_name || '—'}</span>
        )}
      </div>
      <div className="col-span-2 text-xs text-[#636366] truncate">
        {r.platform || '—'}
      </div>
      <div className="col-span-3 text-right">
        <span
          className={`text-xs font-medium ${
            r.hours_idle >= 7 * 24 ? 'text-[#FF3B30]' : r.hours_idle >= 48 ? 'text-[#FF9500]' : 'text-[#636366]'
          }`}
        >
          {formatAge(r.hours_idle)}
        </span>
        <p className="text-[10px] text-[#AEAEB2]">{formatAbs(r.last_activity)}</p>
      </div>
    </div>
  )

  const sectionHeader = (title: string, count: number, note?: string) => (
    <div className="flex items-baseline justify-between mb-3 flex-wrap gap-1">
      <div>
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366]">
          {title}
        </p>
        {note && <p className="text-[10px] text-[#AEAEB2]">{note}</p>}
      </div>
      <span
        className={`text-sm font-bold ${
          count === 0 ? 'text-[#AEAEB2]' : 'text-[#FF3B30]'
        }`}
      >
        {count}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm text-[#636366] hover:text-[#1C1C1E] transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-[#1C1C1E]">What's Missing</h1>
          </div>
          <div className="inline-flex rounded-xl bg-white p-1 border border-[#E5E5EA]">
            {(
              [
                { label: 'Sort: Age', value: 'age' },
                { label: 'Sort: Rep', value: 'rep' },
              ] as { label: string; value: SortKey }[]
            ).map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  sort === s.value
                    ? 'bg-[#7F77DD] text-white'
                    : 'text-[#636366] hover:text-[#1C1C1E]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="card border border-[#FFE5E5] bg-[#FFF5F5]">
            <p className="text-sm text-[#FF3B30]">Couldn't load: {error}</p>
          </div>
        )}

        {/* Stale customers */}
        <div className="card">
          {sectionHeader(
            'Stale Customers',
            sortedStale.length,
            'Last touch 48h–30d ago. The queue of leads cooling off.'
          )}
          {loading ? (
            <p className="text-sm text-[#AEAEB2] py-8 text-center">Loading…</p>
          ) : sortedStale.length === 0 ? (
            <p className="text-sm text-[#AEAEB2] py-8 text-center">
              Nothing in the stale window. Keep it tight.
            </p>
          ) : (
            <div className="divide-y divide-[#EFEFF4]">
              <div className="grid grid-cols-12 gap-3 pb-2 text-[10px] uppercase font-semibold text-[#AEAEB2]">
                <div className="col-span-4">Customer</div>
                <div className="col-span-3">Rep</div>
                <div className="col-span-2">Platform</div>
                <div className="col-span-3 text-right">Last Activity</div>
              </div>
              {sortedStale.slice(0, 100).map((r, i) => row(r, `stale-${r.customer_name}-${i}`))}
              {sortedStale.length > 100 && (
                <p className="pt-3 text-[11px] text-[#AEAEB2] text-center">
                  + {sortedStale.length - 100} more not shown
                </p>
              )}
            </div>
          )}
        </div>

        {/* At-Risk Deals */}
        <div className="card">
          {sectionHeader(
            'At-Risk Deals',
            sortedAtRisk.length,
            'Customers touched in last 30d with no close logged. These are the deals still in play.'
          )}
          {loading ? (
            <p className="text-sm text-[#AEAEB2] py-8 text-center">Loading…</p>
          ) : sortedAtRisk.length === 0 ? (
            <p className="text-sm text-[#AEAEB2] py-8 text-center">
              Every active customer has a close logged.
            </p>
          ) : (
            <div className="divide-y divide-[#EFEFF4]">
              <div className="grid grid-cols-12 gap-3 pb-2 text-[10px] uppercase font-semibold text-[#AEAEB2]">
                <div className="col-span-4">Customer</div>
                <div className="col-span-3">Rep</div>
                <div className="col-span-2">Platform</div>
                <div className="col-span-3 text-right">Last Activity</div>
              </div>
              {sortedAtRisk.slice(0, 100).map((r, i) => row(r, `risk-${r.customer_name}-${i}`))}
              {sortedAtRisk.length > 100 && (
                <p className="pt-3 text-[11px] text-[#AEAEB2] text-center">
                  + {sortedAtRisk.length - 100} more not shown
                </p>
              )}
            </div>
          )}
        </div>

        {/* Ghost alert history */}
        <div className="card">
          {sectionHeader(
            'Ghost Alerts Sent (30d)',
            alerts.length,
            'Every email the system already fired. Use it to gauge noise or to audit follow-through.'
          )}
          {loading ? (
            <p className="text-sm text-[#AEAEB2] py-8 text-center">Loading…</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-[#AEAEB2] py-8 text-center">
              No ghost-lead alerts sent in the last 30 days.
            </p>
          ) : (
            <div className="divide-y divide-[#EFEFF4] max-h-80 overflow-y-auto">
              {alerts.slice(0, 50).map((a, i) => (
                <div
                  key={`alert-${a.customer_name}-${i}`}
                  className="grid grid-cols-12 gap-3 items-center py-2 px-3 text-xs"
                >
                  <div className="col-span-6 truncate text-[#1C1C1E]">
                    {a.customer_name || '—'}
                  </div>
                  <div className="col-span-3 text-[#636366]">
                    {formatAbs(a.alerted_at)}
                  </div>
                  <div className="col-span-3 text-right">
                    <span
                      className={`text-[10px] uppercase font-semibold ${
                        a.followed_up ? 'text-[#34C759]' : 'text-[#AEAEB2]'
                      }`}
                    >
                      {a.followed_up ? 'Followed up' : 'Awaiting'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
