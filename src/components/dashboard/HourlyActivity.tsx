import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import type { HourlyBucket } from '../../hooks/useRepHistory'

interface HourlyActivityProps {
  hours: HourlyBucket[]
  windowDays: number
}

function formatHour(h: number): string {
  if (h === 0) return '12a'
  if (h === 12) return '12p'
  if (h < 12) return `${h}a`
  return `${h - 12}p`
}

export default function HourlyActivity({ hours, windowDays }: HourlyActivityProps) {
  const total = hours.reduce((a, b) => a + b.count, 0)
  const busiest = hours.reduce((acc, h) => (h.count > acc.count ? h : acc), hours[0] || { hour: 0, count: 0 })
  const activeHours = hours.filter((h) => h.count > 0).length

  if (total === 0) {
    return (
      <div className="card">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-3">
          When Does This Rep Work?
        </p>
        <p className="text-sm text-[#AEAEB2] py-4">No activity in the last {windowDays} days.</p>
      </div>
    )
  }

  const data = hours.map((h) => ({
    hour: h.hour,
    label: formatHour(h.hour),
    count: h.count,
  }))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366]">
          When Does This Rep Work?
        </p>
        <div className="flex items-center gap-4 text-[11px] text-[#636366]">
          <span>
            Peak <span className="font-semibold text-[#1C1C1E]">{formatHour(busiest.hour)}</span>{' '}
            ({busiest.count})
          </span>
          <span>
            Active <span className="font-semibold text-[#1C1C1E]">{activeHours}/24</span> hours
          </span>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EFFF" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#636366' }}
              interval={2}
              tickLine={false}
              axisLine={{ stroke: '#E5E5EA' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#636366' }}
              allowDecimals={false}
              width={24}
              tickLine={false}
              axisLine={{ stroke: '#E5E5EA' }}
            />
            <Tooltip
              contentStyle={{ background: 'white', border: '1px solid #E5E5EA', borderRadius: 12, fontSize: 12, padding: 8 }}
              formatter={(v) => {
                const n = typeof v === 'number' ? v : 0
                return [`${n} generation${n === 1 ? '' : 's'}`, 'Count']
              }}
              labelFormatter={(l) => (typeof l === 'string' ? l : '')}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.hour}
                  fill={d.hour === busiest.hour && d.count > 0 ? '#7F77DD' : '#CFCBF3'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-[#AEAEB2] mt-2">
        Clock hours local to viewer. Bars stack all {windowDays} days so a 10 a.m. bar = every 10 a.m.
        generation in the window.
      </p>
    </div>
  )
}
