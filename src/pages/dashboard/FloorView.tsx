import type { GenerationEvent } from '../../hooks/useEvents'
import MetricCard from '../../components/MetricCard'
import RepLeaderboard from '../../components/dashboard/RepLeaderboard'
import PlatformChart from '../../components/dashboard/PlatformChart'
import ObjectionTracker from '../../components/dashboard/ObjectionTracker'
import GhostQueue from '../../components/dashboard/GhostQueue'

interface FloorViewProps {
  allEvents: GenerationEvent[]
  todayEvents: GenerationEvent[]
  weekEvents: GenerationEvent[]
  monthEvents: GenerationEvent[]
  loading: boolean
}

export default function FloorView({
  allEvents,
  todayEvents,
  weekEvents,
  monthEvents,
  loading,
}: FloorViewProps) {
  const allReps = new Set(allEvents.filter((e) => e.rep_name).map((e) => e.rep_name))
  const activeReps = new Set(todayEvents.filter((e) => e.rep_name).map((e) => e.rep_name))

  // Ghost leads: customers with last activity 48h-30d ago
  const now = Date.now()
  const byCustomer = new Map<string, GenerationEvent>()
  allEvents.forEach((e) => {
    if (!e.customer_name) return
    const existing = byCustomer.get(e.customer_name)
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      byCustomer.set(e.customer_name, e)
    }
  })
  const ghostCount = Array.from(byCustomer.values()).filter((e) => {
    const age = now - new Date(e.created_at).getTime()
    const hours = age / 3600000
    return hours >= 48 && hours <= 720
  }).length

  // Top rep today
  const repCounts = new Map<string, number>()
  todayEvents.forEach((e) => {
    if (!e.rep_name) return
    repCounts.set(e.rep_name, (repCounts.get(e.rep_name) || 0) + 1)
  })
  let topRep = '--'
  let topCount = 0
  repCounts.forEach((count, name) => {
    if (count > topCount) {
      topCount = count
      topRep = name
    }
  })

  return (
    <div className="space-y-6">
      {/* ROW 1: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Floor Active"
          value={`${activeReps.size}/${allReps.size}`}
          loading={loading}
        />
        <MetricCard label="Assists Today" value={todayEvents.length} loading={loading} />
        <MetricCard label="Ghost Leads" value={ghostCount} color="#FF3B30" loading={loading} />
        <MetricCard
          label="Top Rep Today"
          value={topRep}
          color="#7F77DD"
          loading={loading}
        />
      </div>

      {/* ROW 2: Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        <RepLeaderboard todayEvents={todayEvents} allEvents={allEvents} />
        <div className="space-y-4">
          <PlatformChart
            todayEvents={todayEvents}
            weekEvents={weekEvents}
            monthEvents={monthEvents}
          />
          <ObjectionTracker events={monthEvents} title="Team Objections" />
        </div>
      </div>

      {/* ROW 3: Ghost Queue with reassign */}
      <GhostQueue allEvents={allEvents} showReassign />
    </div>
  )
}
