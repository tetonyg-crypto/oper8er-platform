import { useState } from 'react'
import type { GenerationEvent } from '../../hooks/useEvents'
import FilterChips from '../FilterChips'

interface PlatformChartProps {
  todayEvents: GenerationEvent[]
  weekEvents: GenerationEvent[]
  monthEvents: GenerationEvent[]
}

const PERIODS = ['Today', 'This Week', 'This Month']

function isVinSolutions(platform: string | null | undefined): boolean {
  const p = (platform || '').toLowerCase()
  return !p || p === 'vinsolutions' || p === 'chrome_extension'
}

export default function PlatformChart({ todayEvents, weekEvents, monthEvents }: PlatformChartProps) {
  const [period, setPeriod] = useState('Today')

  const events =
    period === 'Today' ? todayEvents : period === 'This Week' ? weekEvents : monthEvents

  const vinCount = events.filter((e) => isVinSolutions(e.platform)).length
  const otherCount = events.length - vinCount
  const total = events.length || 1
  const vinPct = (vinCount / total) * 100
  const otherPct = (otherCount / total) * 100

  const outsidePct = total > 0 ? Math.round((otherCount / total) * 100) : 0

  return (
    <div className="card">
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
        Platform Breakdown
      </p>
      <div className="mb-3">
        <FilterChips options={PERIODS} active={period} onChange={setPeriod} />
      </div>

      {/* Stacked horizontal bar */}
      <div className="h-6 rounded-full overflow-hidden flex bg-[#F2F2F7] mb-3">
        {vinCount > 0 && (
          <div
            className="h-full bg-[#7F77DD] transition-all duration-500"
            style={{ width: `${vinPct}%` }}
          />
        )}
        {otherCount > 0 && (
          <div
            className="h-full bg-[#B4B2A9] transition-all duration-500"
            style={{ width: `${otherPct}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7F77DD]" />
          <span className="text-xs text-[#636366]">VinSolutions ({vinCount})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B4B2A9]" />
          <span className="text-xs text-[#636366]">Other ({otherCount})</span>
        </div>
      </div>

      {/* Upsell */}
      {outsidePct > 0 && (
        <p className="text-xs text-[#636366] leading-relaxed">
          {outsidePct}% of your team's activity happens outside VinSolutions — Oper8er
          captures it all in one place.
        </p>
      )}
    </div>
  )
}
