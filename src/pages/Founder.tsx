import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../components/AuthProvider'
import { Link } from 'react-router-dom'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface FounderData {
  mrr: number
  active_dealerships: number
  total_dealerships: number
  new_this_month: number
  churn_this_month: number
  spend_mtd: number
  gross_margin: number
  error_rate_24h: number
  errors_24h: number
  gen_24h: number
  total_events: number
  total_reps: number
  active_reps: number
  top_usage: { name: string; events: number }[]
  bottom_usage: { name: string; events: number }[]
}

function Widget({ label, value, suffix = '', color = '#F8F6F1', subtext = '' }: {
  label: string; value: string | number; suffix?: string; color?: string; subtext?: string
}) {
  return (
    <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}{suffix}</p>
      {subtext && <p className="text-xs text-[#636366] mt-1">{subtext}</p>}
    </div>
  )
}

export default function Founder() {
  const { session, profile, logout } = useAuth()
  const [data, setData] = useState<FounderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const resp = await fetch(`${PROXY_URL}/api/founder/dashboard`, {
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
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 60000)
    return () => clearInterval(interval)
  }, [fetchDashboard])

  const marginColor = (data?.gross_margin || 0) > 50 ? '#10B981' : (data?.gross_margin || 0) > 20 ? '#F59E0B' : '#EF4444'
  const errorColor = (data?.error_rate_24h || 0) > 2 ? '#EF4444' : (data?.error_rate_24h || 0) > 1 ? '#F59E0B' : '#10B981'

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1A2028] border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#F8F6F1] text-lg">Brevmont</span>
          <span className="text-xs font-semibold text-[#0D6E6E] bg-[#0D6E6E]/10 px-2 py-0.5 rounded-full uppercase">Founder</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/internal/errors" className="text-sm text-[#636366] hover:text-[#F8F6F1]">Errors</Link>
          <Link to="/internal/metrics" className="text-sm text-[#636366] hover:text-[#F8F6F1]">Metrics</Link>
          <Link to="/dashboard" className="text-sm text-[#636366] hover:text-[#F8F6F1]">GM View</Link>
          <span className="text-sm text-[#636366]">{profile?.email}</span>
          <button onClick={logout} className="text-sm text-[#636366] hover:text-[#F8F6F1] cursor-pointer">Sign out</button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-6">
        {loading ? (
          <div className="text-[#636366] text-center py-20">Loading founder dashboard...</div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">{error}</div>
        ) : data ? (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-[#F8F6F1]">Company Health</h1>

            {/* Row 1: Revenue */}
            <div className="grid grid-cols-4 gap-4">
              <Widget label="MRR" value={`$${data.mrr.toLocaleString()}`} color="#10B981" />
              <Widget label="Active Dealerships" value={data.active_dealerships} subtext={`${data.total_dealerships} total`} />
              <Widget label="New This Month" value={data.new_this_month} color="#0D6E6E" />
              <Widget label="Churn This Month" value={data.churn_this_month} color={data.churn_this_month > 0 ? '#EF4444' : '#10B981'} />
            </div>

            {/* Row 2: Unit Economics */}
            <div className="grid grid-cols-4 gap-4">
              <Widget label="Anthropic Spend (MTD)" value={`$${data.spend_mtd.toFixed(2)}`} color="#F59E0B" />
              <Widget label="Gross Margin" value={data.gross_margin.toFixed(1)} suffix="%" color={marginColor} />
              <Widget label="Error Rate (24h)" value={data.error_rate_24h.toFixed(2)} suffix="%" color={errorColor} subtext={`${data.errors_24h} errors / ${data.gen_24h} gens`} />
              <Widget label="Total Generations" value={data.total_events.toLocaleString()} subtext={`${data.active_reps} active reps`} />
            </div>

            {/* Row 3: Usage tables */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#1A2028] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5">
                  <h2 className="text-sm font-bold text-[#0D6E6E]">Top 5 by Usage (7 days)</h2>
                </div>
                {data.top_usage.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.top_usage.map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="px-5 py-2.5 text-[#F8F6F1]">{row.name}</td>
                          <td className="px-5 py-2.5 text-right font-bold text-[#10B981]">{row.events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-5 py-4 text-sm text-[#636366]">No generation data yet</p>
                )}
              </div>

              <div className="bg-[#1A2028] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5">
                  <h2 className="text-sm font-bold text-[#EF4444]">Bottom 5 by Usage — Churn Risk</h2>
                </div>
                {data.bottom_usage.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.bottom_usage.map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="px-5 py-2.5 text-[#F8F6F1]">{row.name}</td>
                          <td className="px-5 py-2.5 text-right font-bold text-[#EF4444]">{row.events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-5 py-4 text-sm text-[#636366]">No active dealerships</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
