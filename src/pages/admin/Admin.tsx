import { useState } from 'react'
import { useEvents } from '../../hooks/useEvents'
import { Link } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import ClientsSection from './ClientsSection'
import UsageSection from './UsageSection'
import DealershipsSection from './DealershipsSection'

type Section = 'dashboard' | 'dealerships' | 'clients' | 'usage'

const NAV_ITEMS: { key: Section; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'dealerships', label: 'Dealerships' },
  { key: 'clients', label: 'Tokens (Legacy)' },
  { key: 'usage', label: 'Usage' },
]

export default function Admin() {
  const [active, setActive] = useState<Section>('dealerships')
  const { allEvents, todayEvents, weekEvents, monthEvents, loading } = useEvents()

  // Check for impersonation
  const impersonating = sessionStorage.getItem('impersonate_dealership_name')

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex">
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-[#FF9500] text-white text-center py-1.5 text-sm font-semibold">
          Impersonating: {impersonating}
          <button
            onClick={() => {
              sessionStorage.removeItem('impersonate_dealership_id')
              sessionStorage.removeItem('impersonate_dealership_name')
              window.location.href = '/admin'
            }}
            className="ml-4 underline cursor-pointer"
          >
            Exit
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`w-[240px] bg-white border-r border-black/8 p-4 shrink-0 sticky top-0 h-screen ${impersonating ? 'pt-12' : ''}`}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
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
                  ? 'bg-[#0D6E6E]/10 text-[#0D6E6E]'
                  : 'text-[#636366] hover:bg-[#F2F2F7] hover:text-[#1C1C1E]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 space-y-1">
          <Link to="/founder" className="block px-3 py-2 text-sm text-[#636366] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-lg">
            Founder View
          </Link>
          <Link to="/internal/errors" className="block px-3 py-2 text-sm text-[#636366] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-lg">
            Errors
          </Link>
          <Link to="/internal/metrics" className="block px-3 py-2 text-sm text-[#636366] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-lg">
            Metrics
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className={`flex-1 p-8 max-w-[1200px] ${impersonating ? 'pt-14' : ''}`}>
        {active === 'dashboard' && (
          <AdminDashboard
            allEvents={allEvents}
            todayEvents={todayEvents}
            loading={loading}
          />
        )}
        {active === 'dealerships' && <DealershipsSection />}
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
