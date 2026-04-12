import { useState, useEffect } from 'react'
import { useEvents } from '../../hooks/useEvents'
import { timeAgo } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import HunterView from './HunterView'
import FloorView from './FloorView'

export default function Dashboard() {
  const [tab, setTab] = useState<'hunter' | 'floor'>('hunter')
  const { allEvents, todayEvents, weekEvents, monthEvents, loading, lastRefresh } = useEvents()
  const [dealershipName, setDealershipName] = useState('')

  useEffect(() => {
    supabase.from('dealerships').select('name').eq('status', 'active').limit(1).single()
      .then(({ data }) => { if (data?.name) setDealershipName(data.name) })
  }, [])

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black/8 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
            <span className="text-white font-bold text-sm">O8</span>
          </div>
          <span className="font-bold text-[#1C1C1E] text-lg">Oper8er</span>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#F2F2F7] rounded-xl p-1 flex gap-0.5">
          <button
            onClick={() => setTab('hunter')}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              tab === 'hunter'
                ? 'bg-white text-[#7F77DD] shadow-sm'
                : 'text-[#636366] hover:text-[#1C1C1E]'
            }`}
          >
            Hunter
          </button>
          <button
            onClick={() => setTab('floor')}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              tab === 'floor'
                ? 'bg-white text-[#7F77DD] shadow-sm'
                : 'text-[#636366] hover:text-[#1C1C1E]'
            }`}
          >
            Floor
          </button>
        </div>

        {/* Right side */}
        <div className="text-right">
          <p className="text-sm font-semibold text-[#1C1C1E]">{dealershipName || 'Dashboard'}</p>
          <p className="text-xs text-[#AEAEB2]">Updated {timeAgo(lastRefresh.toISOString())}</p>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto p-6">
        {tab === 'hunter' ? (
          <HunterView
            allEvents={allEvents}
            todayEvents={todayEvents}
            weekEvents={weekEvents}
            monthEvents={monthEvents}
            loading={loading}
          />
        ) : (
          <FloorView
            allEvents={allEvents}
            todayEvents={todayEvents}
            weekEvents={weekEvents}
            monthEvents={monthEvents}
            loading={loading}
          />
        )}
      </main>
    </div>
  )
}
