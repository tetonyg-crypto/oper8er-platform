import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface MetricsSummary {
  total: number
  errors: number
  error_rate: number
  latency: { p50: number; p95: number; p99: number; sample_size: number }
  requestVolume: { _time: string; count: number }[]
  topPaths: { path: string; count: number }[]
  window_hours: number
}

export default function Metrics() {
  const [data, setData] = useState<MetricsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // refresh every 60s
    return () => clearInterval(interval)
  }, [])

  async function fetchMetrics() {
    try {
      const resp = await fetch(`${PROXY_URL}/internal/metrics/health`)
      if (!resp.ok) throw new Error(`${resp.status}`)
      // Health endpoint is unauthenticated — use it for the basic view
      const health = await resp.json()

      // For the full summary, try with admin secret from localStorage
      const adminSecret = localStorage.getItem('brevmont_admin_secret')
      if (adminSecret) {
        const fullResp = await fetch(`${PROXY_URL}/internal/metrics/summary`, {
          headers: { 'X-Admin-Secret': adminSecret }
        })
        if (fullResp.ok) {
          setData(await fullResp.json())
          setError('')
          setLoading(false)
          return
        }
      }

      // Fallback to health-only data
      setData({
        total: health.total_requests_24h || 0,
        errors: 0,
        error_rate: health.error_rate || 0,
        latency: { p50: 0, p95: health.p95_ms || 0, p99: 0, sample_size: 0 },
        requestVolume: [],
        topPaths: [],
        window_hours: 24,
      })
      setError(adminSecret ? '' : 'Set admin secret in console: localStorage.setItem("brevmont_admin_secret", "YOUR_SECRET") for full metrics')
    } catch (e: any) {
      setError(e.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1419] flex items-center justify-center">
        <p className="text-[#636366]">Loading metrics...</p>
      </div>
    )
  }

  const latencyColor = (data?.latency.p95 || 0) > 15000 ? '#EF4444' : (data?.latency.p95 || 0) > 5000 ? '#F59E0B' : '#10B981'
  const errorColor = (data?.error_rate || 0) > 0.02 ? '#EF4444' : (data?.error_rate || 0) > 0.01 ? '#F59E0B' : '#10B981'

  return (
    <div className="min-h-screen bg-[#0F1419]">
      {/* Header */}
      <nav className="bg-[#1A2028] border-b border-white/5 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-sm text-[#636366] hover:text-[#F8F6F1]">&larr; Admin</Link>
            <div className="w-8 h-8 rounded-lg bg-[#0D6E6E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold text-[#F8F6F1] text-lg">Proxy Metrics</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#636366]">Auto-refresh 60s</span>
            <button
              onClick={fetchMetrics}
              className="text-sm font-semibold text-[#0D6E6E] hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {error && (
          <div className="bg-[#1A2028] border border-[#0D6E6E]/30 rounded-xl p-4 mb-6 text-sm text-[#F8F6F1]/70">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Requests (24h)</p>
                <p className="text-3xl font-bold text-[#F8F6F1]">{data.total.toLocaleString()}</p>
              </div>
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">P50 Latency</p>
                <p className="text-3xl font-bold text-[#F8F6F1]">{data.latency.p50.toLocaleString()}ms</p>
              </div>
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">P95 Latency</p>
                <p className="text-3xl font-bold" style={{ color: latencyColor }}>{data.latency.p95.toLocaleString()}ms</p>
              </div>
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">P99 Latency</p>
                <p className="text-3xl font-bold text-[#F8F6F1]">{data.latency.p99.toLocaleString()}ms</p>
              </div>
              <div className="bg-[#1A2028] rounded-xl p-5 border border-white/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Error Rate</p>
                <p className="text-3xl font-bold" style={{ color: errorColor }}>{(data.error_rate * 100).toFixed(2)}%</p>
                <p className="text-xs text-[#636366] mt-1">{data.errors} / {data.total}</p>
              </div>
            </div>

            {/* Request Volume Chart */}
            {data.requestVolume.length > 0 && (
              <div className="bg-[#1A2028] rounded-xl p-6 border border-white/5 mb-8">
                <h2 className="text-sm font-bold text-[#F8F6F1] mb-4">Request Volume (hourly)</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.requestVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis
                      dataKey="_time"
                      stroke="#636366"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis stroke="#636366" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1A2028', border: '1px solid #ffffff10', borderRadius: 8 }}
                      labelFormatter={(v) => new Date(v).toLocaleString()}
                    />
                    <Line type="monotone" dataKey="count" stroke="#0D6E6E" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Paths */}
            {data.topPaths.length > 0 && (
              <div className="bg-[#1A2028] rounded-xl border border-white/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <h2 className="text-sm font-bold text-[#F8F6F1]">Top Paths</h2>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0F1419]">
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Path</th>
                      <th className="text-right px-4 py-2 font-semibold text-[#636366] text-xs">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPaths.map((p) => (
                      <tr key={p.path} className="border-b border-white/5">
                        <td className="px-4 py-2.5 text-[#F8F6F1] font-mono text-xs">{p.path}</td>
                        <td className="px-4 py-2.5 text-right text-[#F8F6F1]">{p.count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
