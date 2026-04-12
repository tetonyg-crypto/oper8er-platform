import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/AuthProvider'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface CostRow {
  dealership_name: string
  tier: string
  month: string
  api_calls: number
  total_cost: number
}

interface CostsData {
  total_mtd_spend: number
  avg_cost_per_generation: number
  highest_spender: { name: string; amount: number }
  rows: CostRow[]
}

export default function Costs() {
  const { session, profile, logout } = useAuth()
  const [data, setData] = useState<CostsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCosts = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const resp = await fetch(`${PROXY_URL}/api/founder/costs`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (resp.status === 403) {
        setError('Founder access required. Your profile role must be "founder".')
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
    fetchCosts()
    const interval = setInterval(fetchCosts, 60000)
    return () => clearInterval(interval)
  }, [fetchCosts])

  const fmtUsd = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1A2028] border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#F8F6F1] text-lg">Brevmont</span>
          <span className="text-xs font-semibold text-[#0D6E6E] bg-[#0D6E6E]/10 px-2 py-0.5 rounded-full uppercase">Costs</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#636366]">{profile?.email}</span>
          <button onClick={logout} className="text-sm text-[#636366] hover:text-[#F8F6F1] cursor-pointer">Sign out</button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1A2028] rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#F8F6F1]">Cost Tracking</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Total MTD Spend</p>
                <p className="text-3xl font-bold text-[#F59E0B]">{fmtUsd(data.total_mtd_spend)}</p>
              </div>
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Avg Cost per Generation</p>
                <p className="text-3xl font-bold text-[#F8F6F1]">{fmtUsd(data.avg_cost_per_generation)}</p>
              </div>
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Highest Spender</p>
                <p className="text-3xl font-bold text-[#0D6E6E]">{data.highest_spender.name}</p>
                <p className="text-xs text-[#636366] mt-1">{fmtUsd(data.highest_spender.amount)}</p>
              </div>
            </div>

            {/* Cost Table */}
            <div className="bg-[#1A2028] rounded-xl border border-white/5 overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5">
                <h2 className="text-sm font-bold text-[#0D6E6E]">Cost Breakdown by Dealership</h2>
              </div>
              {data.rows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-5 py-2.5 text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Dealership</th>
                        <th className="px-5 py-2.5 text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Tier</th>
                        <th className="px-5 py-2.5 text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Month</th>
                        <th className="px-5 py-2.5 text-right text-[11px] uppercase font-semibold tracking-wide text-[#636366]">API Calls</th>
                        <th className="px-5 py-2.5 text-right text-[11px] uppercase font-semibold tracking-wide text-[#636366]">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 text-[#F8F6F1] font-medium">{row.dealership_name}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-semibold text-[#0D6E6E] bg-[#0D6E6E]/10 px-2 py-0.5 rounded-full uppercase">
                              {row.tier}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#636366]">{row.month}</td>
                          <td className="px-5 py-3 text-right text-[#F8F6F1]">{row.api_calls.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right text-[#F59E0B] font-bold">{fmtUsd(row.total_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="px-5 py-8 text-sm text-[#636366] text-center">No cost data recorded yet.</p>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
