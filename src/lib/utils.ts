export function timeAgo(ts: string): string {
  const now = Date.now()
  const then = new Date(ts).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) {
    const remainMin = diffMin % 60
    return remainMin > 0 ? `${diffHr}h ${remainMin}m ago` : `${diffHr}h ago`
  }
  return `${diffDay}d ago`
}

export function dotColor(ts: string): 'green' | 'amber' | 'red' {
  const diffMin = (Date.now() - new Date(ts).getTime()) / 60000
  if (diffMin <= 30) return 'green'
  if (diffMin <= 120) return 'amber'
  return 'red'
}

export function colorHex(color: 'green' | 'amber' | 'red'): string {
  const map: Record<string, string> = {
    green: '#34C759',
    amber: '#FF9500',
    red: '#FF3B30',
  }
  return map[color]
}

export function initials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

export function getStreak(events: { created_at: string }[]): number {
  if (!events.length) return 0

  const daySet = new Set<string>()
  events.forEach((e) => {
    const d = new Date(e.created_at)
    daySet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
  })

  let streak = 0
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const check = new Date(now)
    check.setDate(check.getDate() - i)
    const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`
    if (daySet.has(key)) {
      streak++
    } else {
      if (i === 0) continue // today might not have events yet
      break
    }
  }
  return streak
}
