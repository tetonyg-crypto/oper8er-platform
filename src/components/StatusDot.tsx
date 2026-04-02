import { dotColor, colorHex } from '../lib/utils'

interface StatusDotProps {
  timestamp: string
  pulse?: boolean
}

export default function StatusDot({ timestamp, pulse }: StatusDotProps) {
  const color = dotColor(timestamp)
  const hex = colorHex(color)

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${
        pulse && color === 'red' ? 'dot-pulse' : ''
      }`}
      style={{ backgroundColor: hex }}
    />
  )
}
