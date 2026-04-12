import type { GenerationEvent } from '../../hooks/useEvents'

interface ObjectionTrackerProps {
  events: GenerationEvent[]
  title?: string
}

const LABEL_MAP: Record<string, string> = {
  RATE_SHOCK: 'Rate Shock',
  PRICE_TOO_HIGH: 'Price Too High',
  TRADE_VALUE: 'Trade Value',
  PAYMENT_TOO_HIGH: 'Payment Too High',
  CREDIT_CONCERN: 'Credit Concern',
  COMPETITOR_OFFER: 'Competitor Offer',
  TIMING: 'Timing / Not Ready',
  SPOUSE_APPROVAL: 'Spouse Approval',
  SPOUSE_OBJECTION: 'Spouse Approval',
  RESEARCH_PHASE: 'Research Phase',
  GHOST_NO_RESPONSE: 'Ghost — No Response',
  DE_ESCALATION: 'De-escalation',
  PRICING: 'Pricing Inquiry',
  SCHEDULING: 'Scheduling',
  QUALIFICATION: 'Qualification',
}

const COLOR_MAP: Record<string, string> = {
  RATE_SHOCK: '#FF9500',
  PRICE_TOO_HIGH: '#FF3B30',
}

export default function ObjectionTracker({ events, title }: ObjectionTrackerProps) {
  const counts = new Map<string, number>()
  events.forEach((e) => {
    if (!e.objection_type || e.objection_type === 'NO_OBJECTION') return
    counts.set(e.objection_type, (counts.get(e.objection_type) || 0) + 1)
  })

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  const max = sorted.length > 0 ? sorted[0][1] : 1

  return (
    <div className="card">
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
        {title || 'Objection Tracker'}
      </p>
      {sorted.length === 0 ? (
        <p className="text-sm text-[#AEAEB2] py-4">No objections detected yet.</p>
      ) : (
        <div className="space-y-2.5">
          {sorted.map(([key, count], i) => {
            const color = COLOR_MAP[key] || (i === 0 ? '#7F77DD' : '#7F77DD')
            const pct = (count / max) * 100
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#1C1C1E]">
                    {LABEL_MAP[key] || key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-semibold text-[#636366]">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F2F2F7] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
