import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/AuthProvider'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface DealOutcome {
  customer_name: string
  vehicle: string
  deal_amount: number
  gross_profit: number
  closed_at: string
}

interface ROIData {
  attributed_gross: number
  roi_ratio: number
  deals_closed: number
  subscription_cost: number
  deal_outcomes: DealOutcome[]
}

export default function OwnerROI() {
  const { session, profile, logout } = useAuth()
  const [data, setData] = useState<ROIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchROI = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const resp = await fetch(`${PROXY_URL}/api/owner/roi`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (resp.status === 403) {
        setError('Owner access required.')
        setLoading(false)
        return
      }
      if (!resp.ok) throw new Error(`${resp.status}`)
      setData(await resp.json())
      setError('')
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    fetchROI()
    const interval = setInterval(fetchROI, 60000)
    return () => clearInterval(interval)
  }, [fetchROI])

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-black/8 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E] text-lg">Brevmont</span>
          <span className="text-xs font-semibold text-[#0D6E6E] bg-[#0D6E6E]/10 px-2 py-0.5 rounded-full uppercase">ROI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#636366]">{profile?.email}</span>
          <button onClick={logout} className="text-sm font-medium text-[#AEAEB2] hover:text-[#636366] cursor-pointer">
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#1C1C1E]">Return on Investment</h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Attributed Gross</p>
                <p className="text-[22px] font-bold tracking-tight text-[#0D6E6E]">{fmt(data.attributed_gross)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">ROI Ratio</p>
                <p className="text-[22px] font-bold tracking-tight text-[#0D6E6E]">{data.roi_ratio.toFixed(1)}x</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Deals Closed</p>
                <p className="text-[22px] font-bold tracking-tight text-[#1C1C1E]">{data.deals_closed}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Subscription Cost</p>
                <p className="text-[22px] font-bold tracking-tight text-[#636366]">{fmt(data.subscription_cost)}/mo</p>
              </div>
            </div>

            {/* Deal Outcomes Table */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-black/5">
                <h2 className="text-sm font-bold text-[#0D6E6E]">Recent Deal Outcomes</h2>
              </div>
              {data.deal_outcomes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/5 bg-[#F9F9FB]">
                        <th className="px-5 py-2.5 text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Customer</th>
                        <th className="px-5 py-2.5 text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Vehicle</th>
                        <th className="px-5 py-2.5 text-right text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Deal Amount</th>
                        <th className="px-5 py-2.5 text-right text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Gross Profit</th>
                        <th className="px-5 py-2.5 text-right text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.deal_outcomes.map((deal, i) => (
                        <tr key={i} className="border-b border-black/5 last:border-0 hover:bg-[#F9F9FB] transition-colors">
                          <td className="px-5 py-3 text-[#1C1C1E] font-medium">{deal.customer_name}</td>
                          <td className="px-5 py-3 text-[#636366]">{deal.vehicle}</td>
                          <td className="px-5 py-3 text-right text-[#1C1C1E] font-semibold">{fmt(deal.deal_amount)}</td>
                          <td className="px-5 py-3 text-right text-[#0D6E6E] font-bold">{fmt(deal.gross_profit)}</td>
                          <td className="px-5 py-3 text-right text-[#AEAEB2]">
                            {new Date(deal.closed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-5 py-8 text-sm text-[#636366] text-center">No deal outcomes recorded yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
