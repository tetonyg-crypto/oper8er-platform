import type { GenerationEvent } from '../../hooks/useEvents'
import { timeAgo, dotColor, colorHex } from '../../lib/utils'
import StatusDot from '../StatusDot'

interface NextActionCardProps {
  events: GenerationEvent[]
}

export default function NextActionCard({ events }: NextActionCardProps) {
  // Group by customer, find most recent per customer
  const byCustomer = new Map<string, GenerationEvent>()
  events.forEach((e) => {
    if (!e.customer_name) return
    const existing = byCustomer.get(e.customer_name)
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      byCustomer.set(e.customer_name, e)
    }
  })

  // Sort ascending (oldest first — longest waiting)
  const sorted = Array.from(byCustomer.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="card bg-[#34C759]/10 border-[#34C759]/20">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#34C759] mb-2">
          All Clear
        </p>
        <p className="text-sm text-[#1C1C1E] font-medium">
          No leads waiting. You're caught up.
        </p>
      </div>
    )
  }

  const top = sorted[0]
  const next = sorted.slice(1, 3)
  const topColor = dotColor(top.created_at)

  return (
    <div className="card border-t-3 border-t-[#FF3B30]" style={{ borderTopWidth: '3px', borderTopColor: '#FF3B30' }}>
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#FF3B30] mb-3">
        Action Needed Now
      </p>

      {/* Top lead */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <StatusDot timestamp={top.created_at} pulse />
          <span className="text-lg font-bold text-[#1C1C1E]">{top.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-[#636366]">{top.platform || 'VinSolutions'}</span>
          <span className="text-xs font-semibold" style={{ color: colorHex(topColor) }}>
            {timeAgo(top.created_at)}
          </span>
        </div>
        {top.input && (
          <p className="text-sm text-[#636366] italic line-clamp-2 mt-1">
            "{top.input.slice(0, 120)}{top.input.length > 120 ? '...' : ''}"
          </p>
        )}
        <button className="mt-3 w-full bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold py-2 rounded-lg transition-colors cursor-pointer">
          Open Oper8er
        </button>
      </div>

      {/* Next waiting */}
      {next.length > 0 && (
        <div className="border-t border-black/8 pt-3 space-y-2">
          <p className="text-[11px] uppercase font-semibold tracking-wide text-[#AEAEB2] mb-1">
            Next Up
          </p>
          {next.map((e) => (
            <div key={e.customer_name} className="flex items-center gap-2 py-1">
              <StatusDot timestamp={e.created_at} />
              <span className="text-sm font-medium text-[#1C1C1E] flex-1 truncate">
                {e.customer_name}
              </span>
              <span className="text-xs text-[#AEAEB2]">{timeAgo(e.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
