interface MetricCardProps {
  label: string
  value: string | number
  color?: string
  loading?: boolean
}

export default function MetricCard({ label, value, color, loading }: MetricCardProps) {
  return (
    <div className="card">
      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] mb-1">
        {label}
      </p>
      {loading ? (
        <div className="w-[60px] h-[28px] rounded bg-[#F2F2F7] animate-pulse" />
      ) : (
        <p
          className="text-[22px] font-bold tracking-tight"
          style={{ color: color || '#1C1C1E' }}
        >
          {value}
        </p>
      )}
    </div>
  )
}
