import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts'
import { useRepHistory, type RepDayBucket } from '../../hooks/useRepHistory'
import MetricCard from '../../components/MetricCard'
import HourlyActivity from '../../components/dashboard/HourlyActivity'
import { initials } from '../../lib/utils'

type WindowDays = 7 | 30 | 60 | 90

const WINDOWS: { label: string; value: WindowDays }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '60d', value: 60 },
  { label: '90d', value: 90 },
]

function formatTick(dateIso: string): string {
  const [_, m, d] = dateIso.split('-')
  const monthIdx = parseInt(m, 10) - 1
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[monthIdx]} ${parseInt(d, 10)}`
}

function everyNth<T>(arr: T[], n: number): T[] {
  if (n <= 1) return arr
  const out: T[] = []
  for (let i = 0; i < arr.length; i++) if (i % n === 0) out.push(arr[i])
  if (out[out.length - 1] !== arr[arr.length - 1]) out.push(arr[arr.length - 1])
  return out
}

export default function RepDetail() {
  const { id } = useParams<{ id: string }>()
  const [windowDays, setWindowDays] = useState<WindowDays>(30)
  const [showFloorAvg, setShowFloorAvg] = useState(true)
  const [showTopPerformer, setShowTopPerformer] = useState(false)
  const {
    rep,
    days,
    totals,
    platforms,
    hours,
    comparison,
    floor_avg_daily,
    top_performer_daily,
    loading,
    error,
    notFound,
  } = useRepHistory(id, windowDays)

  // Merge daily + comparison for the chart
  const chartData = useMemo(() => {
    return days.map((d, i) => {
      const cmp = comparison[i]
      return {
        date: d.date,
        total: d.total,
        texts: d.texts,
        emails: d.emails,
        crm_notes: d.crm_notes,
        floor_avg: cmp ? cmp.floor_avg : 0,
        top_performer: cmp ? cmp.top_performer : 0,
      }
    })
  }, [days, comparison])

  const tickDates = useMemo(() => {
    const step = windowDays <= 7 ? 1 : windowDays <= 30 ? 4 : windowDays <= 60 ? 7 : 10
    return new Set(everyNth(chartData.map((d) => d.date), step))
  }, [chartData, windowDays])

  const repDailyAvg = useMemo(() => {
    if (days.length === 0) return 0
    return Math.round((days.reduce((a, b) => a + b.total, 0) / days.length) * 10) / 10
  }, [days])

  if (!id) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6">
        <p className="text-sm text-[#FF3B30]">Missing rep id in URL.</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] p-6">
        <div className="max-w-3xl mx-auto card">
          <p className="text-base font-semibold mb-1">Rep not found</p>
          <p className="text-sm text-[#636366] mb-4">
            We couldn't find a rep with id <code className="text-xs">{id}</code>. They may have been
            deactivated or the link is stale.
          </p>
          <Link
            to="/dashboard"
            className="inline-block text-sm font-medium text-[#7F77DD] hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const hasActivity = totals.total > 0
  const busiestDay = days.reduce((acc, d) => (d.total > acc.total ? d : acc), days[0] || {
    date: '',
    total: 0,
    texts: 0,
    emails: 0,
    crm_notes: 0,
    unique_customers: 0,
  } as RepDayBucket)

  const vsFloorPct = floor_avg_daily > 0
    ? Math.round(((repDailyAvg - floor_avg_daily) / floor_avg_daily) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#F7F7F9] rep-detail-page">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap no-print-inline">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/dashboard"
              className="text-sm text-[#636366] hover:text-[#1C1C1E] transition-colors no-print"
              aria-label="Back to dashboard"
            >
              ← Dashboard
            </Link>
            <div className="w-12 h-12 rounded-full bg-[#F0EFFF] flex items-center justify-center shrink-0">
              <span className="text-base font-bold text-[#7F77DD]">
                {rep ? initials(rep.name) : '—'}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#1C1C1E] truncate">
                {rep?.name || (loading ? 'Loading…' : 'Unknown rep')}
              </h1>
              <p className="text-xs text-[#636366] truncate">
                {rep?.email || (rep?.status ? `Status: ${rep.status}` : '—')}
                {rep && (
                  <span className="ml-2 text-[#AEAEB2]">
                    · {windowDays}-day report · {new Date().toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 no-print">
            <div className="inline-flex rounded-xl bg-white p-1 border border-[#E5E5EA]">
              {WINDOWS.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setWindowDays(w.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    windowDays === w.value
                      ? 'bg-[#7F77DD] text-white'
                      : 'text-[#636366] hover:text-[#1C1C1E]'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-[#E5E5EA] text-[#636366] hover:text-[#1C1C1E] hover:bg-[#F7F7F9] transition-colors"
              aria-label="Print this report"
              title="Print / Save as PDF"
            >
              Print
            </button>
          </div>
        </div>

        {error && (
          <div className="card border border-[#FFE5E5] bg-[#FFF5F5]">
            <p className="text-sm text-[#FF3B30]">Couldn't load history: {error}</p>
          </div>
        )}

        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard label={`Total (${windowDays}d)`} value={totals.total} loading={loading} />
          <MetricCard label="Texts" value={totals.texts} loading={loading} />
          <MetricCard label="Emails" value={totals.emails} loading={loading} />
          <MetricCard label="CRM Notes" value={totals.crm_notes} loading={loading} />
          <MetricCard
            label="Unique Customers"
            value={totals.unique_customers}
            loading={loading}
          />
          <MetricCard
            label="Time Saved"
            value={`${Math.round(totals.estimated_time_saved_minutes / 60)} hr`}
            loading={loading}
          />
        </div>

        {/* Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366]">
              Daily Activity
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              {hasActivity && floor_avg_daily > 0 && (
                <p className="text-[11px] text-[#636366]">
                  Rep daily avg{' '}
                  <span className="font-semibold text-[#1C1C1E]">{repDailyAvg}</span>{' '}
                  <span
                    className={vsFloorPct >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}
                  >
                    ({vsFloorPct >= 0 ? '+' : ''}
                    {vsFloorPct}%)
                  </span>{' '}
                  vs floor {floor_avg_daily}
                </p>
              )}
              <div className="flex items-center gap-2 no-print">
                <label className="inline-flex items-center gap-1 text-[11px] text-[#636366] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFloorAvg}
                    onChange={(e) => setShowFloorAvg(e.target.checked)}
                    className="accent-[#7F77DD]"
                  />
                  Floor avg
                </label>
                <label className="inline-flex items-center gap-1 text-[11px] text-[#636366] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showTopPerformer}
                    onChange={(e) => setShowTopPerformer(e.target.checked)}
                    className="accent-[#7F77DD]"
                  />
                  Top performer
                </label>
              </div>
            </div>
          </div>
          <div className="h-64 chart-print-h">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#AEAEB2]">Loading chart…</p>
              </div>
            ) : !hasActivity ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-[#AEAEB2]">No activity in the last {windowDays} days.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFF" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => (tickDates.has(v) ? formatTick(v) : '')}
                    tick={{ fontSize: 11, fill: '#636366' }}
                    interval={0}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E5EA' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#636366' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E5EA' }}
                    allowDecimals={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E5EA',
                      borderRadius: 12,
                      fontSize: 12,
                      padding: 8,
                    }}
                    labelFormatter={(v) => (typeof v === 'string' ? formatTick(v) : '')}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
                  {showFloorAvg && floor_avg_daily > 0 && (
                    <ReferenceLine
                      y={floor_avg_daily}
                      stroke="#AEAEB2"
                      strokeDasharray="4 4"
                      label={{
                        value: `Floor avg ${floor_avg_daily}/day`,
                        position: 'insideTopLeft',
                        fontSize: 10,
                        fill: '#636366',
                      }}
                    />
                  )}
                  {showTopPerformer && top_performer_daily > 0 && (
                    <ReferenceLine
                      y={top_performer_daily}
                      stroke="#FF9500"
                      strokeDasharray="4 4"
                      label={{
                        value: `Top performer ${top_performer_daily}/day`,
                        position: 'insideTopLeft',
                        fontSize: 10,
                        fill: '#FF9500',
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#7F77DD"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="texts"
                    name="Texts"
                    stroke="#34C759"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="emails"
                    name="Emails"
                    stroke="#FF9500"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="crm_notes"
                    name="CRM Notes"
                    stroke="#007AFF"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          {hasActivity && busiestDay?.date && (
            <p className="text-[10px] text-[#AEAEB2] mt-2">
              Busiest day: {formatTick(busiestDay.date)} ({busiestDay.total})
            </p>
          )}
        </div>

        {/* Hourly activity (Feature 4) */}
        <HourlyActivity hours={hours} windowDays={windowDays} />

        {/* Platform breakdown */}
        {hasActivity && Object.keys(platforms).length > 0 && (
          <div className="card">
            <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
              Platform Breakdown ({windowDays}d)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(platforms)
                .sort((a, b) => b[1] - a[1])
                .map(([p, count]) => {
                  const pct = totals.total ? Math.round((count / totals.total) * 100) : 0
                  return (
                    <div
                      key={p}
                      className="px-3 py-2 rounded-xl bg-[#F7F7F9] border border-[#EFEFF4]"
                    >
                      <p className="text-[10px] uppercase text-[#AEAEB2] font-medium truncate">
                        {p}
                      </p>
                      <p className="text-base font-semibold text-[#1C1C1E]">
                        {count}
                        <span className="text-xs font-normal text-[#636366] ml-1">({pct}%)</span>
                      </p>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Print-only footer */}
        <p className="hidden print-only text-[10px] text-[#636366] pt-4 border-t border-[#E5E5EA] mt-4">
          Generated by Brevmont · {rep?.name || 'Rep'} · {windowDays}-day report ·{' '}
          {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}
