import type { GenerationEvent } from '../../hooks/useEvents'
import { formatCurrency } from '../../lib/utils'

interface MonthlyPaceProps {
  monthEvents: GenerationEvent[]
}

export default function MonthlyPace({ monthEvents }: MonthlyPaceProps) {
  const estimate = monthEvents.length * 3600 * 0.02
  const goal = 35000
  const pct = Math.min((estimate / goal) * 100, 100)

  return (
    <div className="card">
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-2">
        Monthly Pace
      </p>
      <p className="text-[22px] font-bold tracking-tight text-[#1C1C1E] mb-3">
        {formatCurrency(estimate)}
      </p>
      <div className="h-2 rounded-full bg-[#F2F2F7] overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-[#7F77DD] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-[#AEAEB2]">{formatCurrency(goal)} monthly goal</p>
    </div>
  )
}
