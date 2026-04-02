import type { GenerationEvent } from '../../hooks/useEvents'
import MetricCard from '../../components/MetricCard'

interface UsageSectionProps {
  allEvents: GenerationEvent[]
  todayEvents: GenerationEvent[]
  weekEvents: GenerationEvent[]
  monthEvents: GenerationEvent[]
  loading: boolean
}

function getLast14Days(events: GenerationEvent[]): { label: string; count: number }[] {
  const days: { label: string; count: number }[] = []
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const count = events.filter((e) => {
      const t = new Date(e.created_at).getTime()
      return t >= dayStart.getTime() && t < dayEnd.getTime()
    }).length
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count,
    })
  }
  return days
}

export default function UsageSection({
  allEvents,
  todayEvents,
  weekEvents,
  monthEvents,
  loading,
}: UsageSectionProps) {
  // Dealership breakdown
  const dealerCounts = new Map<string, number>()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  allEvents
    .filter((e) => new Date(e.created_at) >= thirtyDaysAgo)
    .forEach((e) => {
      const d = e.dealership || 'Unknown'
      dealerCounts.set(d, (dealerCounts.get(d) || 0) + 1)
    })
  const dealerSorted = Array.from(dealerCounts.entries()).sort((a, b) => b[1] - a[1])
  const dealerMax = dealerSorted.length > 0 ? dealerSorted[0][1] : 1

  // Platform breakdown
  const platformCounts = new Map<string, number>()
  monthEvents.forEach((e) => {
    const p = e.platform || 'VinSolutions'
    platformCounts.set(p, (platformCounts.get(p) || 0) + 1)
  })
  const platformSorted = Array.from(platformCounts.entries()).sort((a, b) => b[1] - a[1])
  const platformMax = platformSorted.length > 0 ? platformSorted[0][1] : 1

  // Daily volume
  const daily = getLast14Days(allEvents)
  const dailyMax = Math.max(...daily.map((d) => d.count), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1C1C1E]">Usage</h1>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Today" value={todayEvents.length} loading={loading} />
        <MetricCard label="This Week" value={weekEvents.length} loading={loading} />
        <MetricCard label="This Month" value={monthEvents.length} loading={loading} />
      </div>

      {/* Dealership Breakdown */}
      <div className="card">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
          By Dealership (Last 30 Days)
        </p>
        {dealerSorted.length === 0 ? (
          <p className="text-sm text-[#AEAEB2] py-4">No data yet.</p>
        ) : (
          <div className="space-y-2.5">
            {dealerSorted.map(([name, count]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#1C1C1E] truncate">{name}</span>
                  <span className="text-xs font-semibold text-[#636366]">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F2F2F7] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7F77DD] transition-all duration-500"
                    style={{ width: `${(count / dealerMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="card">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
          By Platform (This Month)
        </p>
        {platformSorted.length === 0 ? (
          <p className="text-sm text-[#AEAEB2] py-4">No data yet.</p>
        ) : (
          <div className="space-y-2.5">
            {platformSorted.map(([name, count]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#1C1C1E]">{name}</span>
                  <span className="text-xs font-semibold text-[#636366]">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F2F2F7] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7F77DD] transition-all duration-500"
                    style={{ width: `${(count / platformMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Volume */}
      <div className="card">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
          Daily Volume (Last 14 Days)
        </p>
        <div className="flex items-end gap-1.5 h-[120px]">
          {daily.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full rounded-t bg-[#7F77DD] transition-all duration-500 min-h-[2px]"
                style={{ height: `${(d.count / dailyMax) * 100}%` }}
              />
              <span className="text-[9px] text-[#AEAEB2] mt-1 whitespace-nowrap">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
