import { useState } from 'react'
import { useEvents } from '../../hooks/useEvents'
import AdminDashboard from './AdminDashboard'
import ClientsSection from './ClientsSection'
import UsageSection from './UsageSection'

type Section = 'dashboard' | 'clients' | 'usage'

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'clients', label: 'Clients' },
  { key: 'usage', label: 'Usage' },
]

export default function Admin() {
  const [active, setActive] = useState<Section>('dashboard')
  const { allEvents, todayEvents, weekEvents, monthEvents, loading } = useEvents()

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex">
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-black/8 p-4 shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E]">Brevmont Admin</span>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active === item.key
                  ? 'bg-[#F0EFFF] text-[#7F77DD]'
                  : 'text-[#636366] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 max-w-[1200px]">
        {active === 'dashboard' && (
          <AdminDashboard
            allEvents={allEvents}
            todayEvents={todayEvents}
            loading={loading}
          />
        )}
        {active === 'clients' && <ClientsSection />}
        {active === 'usage' && (
          <UsageSection
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
