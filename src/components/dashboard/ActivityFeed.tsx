import { useState } from 'react'
import type { GenerationEvent } from '../../hooks/useEvents'
import { timeAgo } from '../../lib/utils'
import StatusDot from '../StatusDot'
import FilterChips from '../FilterChips'

interface ActivityFeedProps {
  events: GenerationEvent[]
}

const FILTERS = ['All', 'VinSolutions', 'Facebook', 'Gmail', 'LinkedIn', 'Other']

function matchesPlatform(platform: string | null | undefined, filter: string): boolean {
  const p = (platform || '').toLowerCase()
  switch (filter) {
    case 'All':
      return true
    case 'VinSolutions':
      return !p || p === 'vinsolutions' || p === 'chrome_extension'
    case 'Facebook':
      return p === 'facebook'
    case 'Gmail':
      return p === 'gmail'
    case 'LinkedIn':
      return p === 'linkedin'
    case 'Other': {
      const named = ['vinsolutions', 'chrome_extension', 'facebook', 'gmail', 'linkedin', '']
      return !named.includes(p)
    }
    default:
      return true
  }
}

function getTypes(e: GenerationEvent): string[] {
  const types: string[] = []
  if (e.has_text) types.push('Text')
  if (e.has_email) types.push('Email')
  if (e.has_crm) types.push('CRM')
  if (types.length === 0 && e.workflow_type) types.push(e.workflow_type)
  return types
}

function getBadge(e: GenerationEvent): { label: string; color: string; bg: string } {
  if (e.has_crm) return { label: 'Logged', color: '#34C759', bg: '#34C759' + '18' }
  return { label: 'Sent', color: '#7F77DD', bg: '#F0EFFF' }
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  const [filter, setFilter] = useState('All')

  const filtered = events.filter((e) => matchesPlatform(e.platform, filter))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366]">
          Activity Feed
        </p>
      </div>
      <div className="mb-3">
        <FilterChips options={FILTERS} active={filter} onChange={setFilter} />
      </div>
      <div className="max-h-[520px] overflow-y-auto space-y-0 -mx-4 px-4">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#AEAEB2]">No events match this filter.</div>
        ) : (
          filtered.slice(0, 100).map((e) => {
            const badge = getBadge(e)
            const types = getTypes(e)
            return (
              <div
                key={e.id}
                className="flex items-center gap-3 py-2.5 border-b border-black/5 last:border-0"
              >
                <StatusDot timestamp={e.created_at} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                    {e.customer_name || 'Unknown Customer'}
                  </p>
                  <p className="text-xs text-[#AEAEB2] truncate">
                    {e.platform || 'VinSolutions'}
                    {types.length > 0 && ` · ${types.join(', ')}`}
                  </p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ color: badge.color, backgroundColor: badge.bg }}
                >
                  {badge.label}
                </span>
                <span className="text-xs text-[#AEAEB2] whitespace-nowrap ml-1">
                  {timeAgo(e.created_at)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
