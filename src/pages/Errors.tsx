import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface ErrorEntry {
  id: string
  dealership_id: string | null
  rep_name: string
  error_type: string
  error_message: string
  extension_version: string
  platform: string
  created_at: string
}

interface ErrorStats {
  total: number
  since: string
  by_type: Record<string, number>
  by_dealer: Record<string, number>
  recent: ErrorEntry[]
  spike_active: number
}

const TYPE_COLORS: Record<string, string> = {
  API_ERROR: '#EF4444',
  NETWORK_ERROR: '#F59E0B',
  AUTH_ERROR: '#8B5CF6',
  DOM_ERROR: '#3B82F6',
  STORAGE_ERROR: '#06B6D4',
  VOICE_ERROR: '#EC4899',
  UNKNOWN: '#6B7280',
}

export default function Errors() {
  const [data, setData] = useState<ErrorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchErrors()
    const interval = setInterval(fetchErrors, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchErrors() {
    try {
      const resp = await fetch(`${PROXY_URL}/v1/telemetry/errors`)
      if (!resp.ok) throw new Error(`${resp.status}`)
      const json = await resp.json()
      setData(json)
      setError('')
    } catch (e: any) {
      setError(e.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <p className="text-[#636366]">Loading errors...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Header */}
      <nav className="bg-white border-b border-black/5 px-6 py-3 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-sm text-[#636366] hover:text-[#1C1C1E]">&larr; Admin</Link>
            <div className="w-8 h-8 rounded-lg bg-[#EF4444] flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <span className="font-bold text-[#1C1C1E] text-lg">Extension Errors</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#AEAEB2]">Auto-refresh 30s</span>
            <button
              onClick={fetchErrors}
              className="text-sm font-semibold text-[#7F77DD] hover:underline cursor-pointer"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            Failed to load: {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Last 24h</p>
                <p className="text-3xl font-bold text-[#1C1C1E]">{data.total}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Error Types</p>
                <p className="text-3xl font-bold text-[#1C1C1E]">{Object.keys(data.by_type).length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Dealers Affected</p>
                <p className="text-3xl font-bold text-[#1C1C1E]">{Object.keys(data.by_dealer).length}</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-black/5">
                <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">Active Spike Tracker</p>
                <p className="text-3xl font-bold text-[#1C1C1E]">{data.spike_active}</p>
              </div>
            </div>

            {/* Error Type Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-black/5 mb-8">
              <h2 className="text-sm font-bold text-[#1C1C1E] mb-4">By Error Type</h2>
              <div className="flex gap-3 flex-wrap">
                {Object.entries(data.by_type)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: `${TYPE_COLORS[type] || '#6B7280'}15` }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: TYPE_COLORS[type] || '#6B7280' }}
                      />
                      <span className="text-xs font-semibold" style={{ color: TYPE_COLORS[type] || '#6B7280' }}>
                        {type}
                      </span>
                      <span className="text-xs font-bold text-[#1C1C1E]">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent Errors Table */}
            <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5">
                <h2 className="text-sm font-bold text-[#1C1C1E]">Recent Errors (last 50)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F2F2F7]">
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Time</th>
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Type</th>
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Rep</th>
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Platform</th>
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Version</th>
                      <th className="text-left px-4 py-2 font-semibold text-[#636366] text-xs">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((err) => (
                      <tr key={err.id} className="border-b border-black/5 hover:bg-[#F8F8FA]">
                        <td className="px-4 py-2.5 text-xs text-[#AEAEB2] whitespace-nowrap">
                          {new Date(err.created_at).toLocaleString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{
                              background: `${TYPE_COLORS[err.error_type] || '#6B7280'}15`,
                              color: TYPE_COLORS[err.error_type] || '#6B7280'
                            }}
                          >
                            {err.error_type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-[#1C1C1E]">{err.rep_name}</td>
                        <td className="px-4 py-2.5 text-xs text-[#636366]">{err.platform}</td>
                        <td className="px-4 py-2.5 text-xs text-[#AEAEB2]">{err.extension_version}</td>
                        <td className="px-4 py-2.5 text-xs text-[#1C1C1E] max-w-[400px] truncate" title={err.error_message}>
                          {err.error_message}
                        </td>
                      </tr>
                    ))}
                    {data.recent.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#AEAEB2] text-sm">
                          No errors in the last 24 hours. All clear.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
