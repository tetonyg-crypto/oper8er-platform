import type { GenerationEvent } from '../../hooks/useEvents'
import { initials } from '../../lib/utils'

interface RepLeaderboardProps {
  todayEvents: GenerationEvent[]
  allEvents: GenerationEvent[]
}

export default function RepLeaderboard({ todayEvents }: RepLeaderboardProps) {
  const repCounts = new Map<string, number>()
  todayEvents.forEach((e) => {
    if (!e.rep_name || e.rep_name === 'Unassigned') return
    repCounts.set(e.rep_name, (repCounts.get(e.rep_name) || 0) + 1)
  })

  const sorted = Array.from(repCounts.entries())
    .sort((a, b) => b[1] - a[1])

  if (sorted.length === 0) {
    return (
      <div className="card">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
          Rep Leaderboard
        </p>
        <p className="text-sm text-[#AEAEB2] py-4">No activity today yet.</p>
      </div>
    )
  }

  const topCount = sorted[0][1]

  return (
    <div className="card">
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
        Rep Leaderboard
      </p>
      <div className="space-y-2">
        {sorted.map(([name, count], i) => {
          const rank = i + 1
          const delta = rank > 1 ? topCount - count : 0
          return (
            <div
              key={name}
              className={`flex items-center gap-3 py-2 px-3 rounded-xl ${
                rank === 1 ? 'bg-[#F0EFFF]' : ''
              }`}
            >
              <span
                className={`text-sm font-bold w-6 text-center ${
                  rank === 1 ? 'text-[#7F77DD]' : 'text-[#AEAEB2]'
                }`}
              >
                {rank}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#F0EFFF] flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-[#7F77DD]">{initials(name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1C1E] truncate">{name}</p>
                {rank > 1 && rank <= 5 && (
                  <p className="text-[10px] text-[#AEAEB2]">
                    {delta} behind #{rank - 1 > 1 ? rank - 1 : 1}
                  </p>
                )}
              </div>
              <span className="text-lg font-bold text-[#7F77DD]">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
