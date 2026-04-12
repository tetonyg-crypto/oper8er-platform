import { useState, useEffect } from 'react'
import type { GenerationEvent } from '../../hooks/useEvents'
import { supabase } from '../../lib/supabase'
import { timeAgo } from '../../lib/utils'
import MetricCard from '../../components/MetricCard'
import StatusDot from '../../components/StatusDot'

interface AdminDashboardProps {
  allEvents: GenerationEvent[]
  todayEvents: GenerationEvent[]
  loading: boolean
}

export default function AdminDashboard({ allEvents, todayEvents, loading }: AdminDashboardProps) {
  const [dealerCount, setDealerCount] = useState(0)

  useEffect(() => {
    async function fetchDealers() {
      const { data } = await supabase.from('dealer_tokens').select('dealership')
      if (data) {
        const unique = new Set(data.map((d: { dealership: string }) => d.dealership))
        setDealerCount(unique.size)
      }
    }
    fetchDealers()
  }, [])

  const activeReps = new Set(todayEvents.filter((e) => e.rep_name).map((e) => e.rep_name)).size
  const recent = allEvents.slice(0, 10)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1C1C1E]">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard label="Total Dealers" value={dealerCount} loading={loading} />
        <MetricCard label="Generations Today" value={todayEvents.length} loading={loading} />
        <MetricCard label="Active Reps Today" value={activeReps} loading={loading} />
      </div>

      <div className="card">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
          Recent Activity (All Dealerships)
        </p>
        {recent.length === 0 ? (
          <p className="text-sm text-[#AEAEB2] py-4">No recent activity.</p>
        ) : (
          <div className="space-y-0">
            {recent.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 py-2.5 border-b border-black/5 last:border-0"
              >
                <StatusDot timestamp={e.created_at} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                    {e.customer_name || 'Unknown'}{' '}
                    <span className="font-normal text-[#AEAEB2]">via {e.rep_name || 'Unknown'}</span>
                  </p>
                  <p className="text-xs text-[#AEAEB2] truncate">
                    {e.dealership} · {e.platform || 'VinSolutions'}
                  </p>
                </div>
                <span className="text-xs text-[#AEAEB2] whitespace-nowrap">
                  {timeAgo(e.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
