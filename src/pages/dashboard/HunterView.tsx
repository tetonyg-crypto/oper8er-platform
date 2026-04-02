import type { GenerationEvent } from '../../hooks/useEvents'
import { getStreak } from '../../lib/utils'
import MetricCard from '../../components/MetricCard'
import NextActionCard from '../../components/dashboard/NextActionCard'
import ActivityFeed from '../../components/dashboard/ActivityFeed'
import ObjectionTracker from '../../components/dashboard/ObjectionTracker'
import MonthlyPace from '../../components/dashboard/MonthlyPace'
import GhostQueue from '../../components/dashboard/GhostQueue'

interface HunterViewProps {
  allEvents: GenerationEvent[]
  todayEvents: GenerationEvent[]
  weekEvents: GenerationEvent[]
  monthEvents: GenerationEvent[]
  loading: boolean
}

export default function HunterView({
  allEvents,
  todayEvents,
  weekEvents,
  monthEvents,
  loading,
}: HunterViewProps) {
  const activeConversations = new Set(
    todayEvents.filter((e) => e.customer_name).map((e) => e.customer_name)
  ).size

  const platformsActive = new Set(
    todayEvents.filter((e) => e.platform).map((e) => e.platform)
  ).size

  const streak = getStreak(allEvents)

  return (
    <div className="space-y-6">
      {/* ROW 1: Metric Cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard label="Assists Today" value={todayEvents.length} loading={loading} />
        <MetricCard label="Active Conversations" value={activeConversations} loading={loading} />
        <MetricCard label="Unread Replies" value="0" color="#FF3B30" loading={loading} />
        <MetricCard label="Platforms Active" value={platformsActive} loading={loading} />
        <MetricCard
          label="Streak"
          value={`${streak} \u{1F525}`}
          color="#7F77DD"
          loading={loading}
        />
      </div>

      {/* ROW 2: Three Column Layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '280px 1fr 300px' }}>
        <NextActionCard events={todayEvents.length ? todayEvents : allEvents} />
        <ActivityFeed events={allEvents} />
        <div className="space-y-4">
          <ObjectionTracker events={weekEvents} />
          <MonthlyPace monthEvents={monthEvents} />
        </div>
      </div>

      {/* ROW 3: Ghost Queue */}
      <GhostQueue allEvents={allEvents} />
    </div>
  )
}
