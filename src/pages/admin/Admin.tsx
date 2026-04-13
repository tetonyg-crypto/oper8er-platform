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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { allEvents, todayEvents, weekEvents, monthEvents, loading } = useEvents()

  // Check for impersonation
  const impersonating = sessionStorage.getItem('impersonate_dealership_name')

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col md:flex-row">
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

      {/* Mobile header with hamburger */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-black/8 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E]">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-[#F2F2F7] cursor-pointer"
        >
          <svg className="w-5 h-5 text-[#636366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen z-50 md:z-auto
        w-[240px] bg-white border-r border-black/8 p-4 shrink-0
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        ${impersonating ? 'pt-12' : ''}
      `}>
        <div className="hidden md:flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E]">Brevmont Admin</span>
        </div>
        <nav className="space-y-1 mt-4 md:mt-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActive(item.key); setSidebarOpen(false) }}
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
      <main className={`flex-1 p-4 md:p-8 max-w-[1200px] ${impersonating ? 'pt-14' : ''}`}>
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
