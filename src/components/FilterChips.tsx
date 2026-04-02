interface FilterChipsProps {
  options: string[]
  active: string
  onChange: (val: string) => void
}

export default function FilterChips({ options, active, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
            active === opt
              ? 'bg-[#7F77DD] text-white'
              : 'bg-white border border-black/8 text-[#636366] hover:bg-[#F2F2F7]'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
