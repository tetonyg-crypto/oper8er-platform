import { useState } from 'react'
import type { GenerationEvent } from '../../hooks/useEvents'
import { timeAgo } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

interface GhostQueueProps {
  allEvents: GenerationEvent[]
  showReassign?: boolean
}

export default function GhostQueue({ allEvents, showReassign }: GhostQueueProps) {
  const [reassigned, setReassigned] = useState<Set<string>>(new Set())
  const [reassigning, setReassigning] = useState<string | null>(null)

  const now = Date.now()

  // Group by customer, find most recent
  const byCustomer = new Map<string, GenerationEvent>()
  allEvents.forEach((e) => {
    if (!e.customer_name) return
    const existing = byCustomer.get(e.customer_name)
    if (!existing || new Date(e.created_at) > new Date(existing.created_at)) {
      byCustomer.set(e.customer_name, e)
    }
  })

  // Filter 48h-30d old, sort by recency
  const ghosts = Array.from(byCustomer.values())
    .filter((e) => {
      const ageHours = (now - new Date(e.created_at).getTime()) / 3600000
      return ageHours >= 48 && ageHours <= 720
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Get unique rep names for reassignment dropdown
  const repNames = Array.from(new Set(allEvents.filter((e) => e.rep_name).map((e) => e.rep_name)))

  const handleReassign = async (ghost: GenerationEvent, toRep: string) => {
    if (!toRep || toRep === ghost.rep_name) return
    setReassigning(ghost.customer_name)
    try {
      await supabase.from('ghost_lead_reassignments').insert({
        dealership: ghost.dealership,
        customer_name: ghost.customer_name,
        from_rep: ghost.rep_name,
        to_rep: toRep,
      })
      setReassigned((prev) => new Set(prev).add(ghost.customer_name))
    } catch (err) {
      console.error('Reassignment failed:', err)
      alert('Reassignment failed. Please try again.')
    } finally {
      setReassigning(null)
    }
  }

  if (ghosts.length === 0) {
    return (
      <div className="card bg-[#34C759]/10 border-[#34C759]/20">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#34C759] mb-1">
          Ghost Queue
        </p>
        <p className="text-sm text-[#1C1C1E] font-medium">
          No ghost leads. Floor is clean.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366]">
          Ghost Queue
        </p>
        <span className="text-xs font-semibold text-[#FF3B30]">{ghosts.length} leads</span>
      </div>
      <div className="space-y-0">
        {ghosts.slice(0, 20).map((ghost) => {
          const isReassigned = reassigned.has(ghost.customer_name)
          const isLoading = reassigning === ghost.customer_name
          return (
            <div
              key={ghost.customer_name}
              className="flex items-center gap-3 py-2.5 border-b border-black/5 last:border-0"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#FF3B30] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                  {ghost.customer_name}
                </p>
                <p className="text-xs text-[#AEAEB2] truncate">
                  {ghost.rep_name || 'Unassigned'} · {ghost.platform || 'VinSolutions'}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#FF3B30] whitespace-nowrap">
                {timeAgo(ghost.created_at)}
              </span>

              {showReassign ? (
                <div className="flex items-center gap-2">
                  {isReassigned ? (
                    <span className="text-xs font-semibold text-[#34C759]">Reassigned</span>
                  ) : (
                    <>
                      <select
                        className="text-xs border border-black/10 rounded-lg px-2 py-1 bg-white text-[#1C1C1E] cursor-pointer"
                        defaultValue=""
                        disabled={isLoading}
                        onChange={(e) => handleReassign(ghost, e.target.value)}
                      >
                        <option value="" disabled>
                          Reassign...
                        </option>
                        {repNames
                          .filter((r) => r !== ghost.rep_name)
                          .map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                      </select>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
