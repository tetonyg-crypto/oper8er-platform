import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface GenerationEvent {
  id: string
  session_id: string
  rep_name: string
  dealership: string
  input: string
  output: string
  has_text: boolean
  has_email: boolean
  has_crm: boolean
  workflow_type: string
  customer_name: string
  vehicle: string
  created_at: string
  platform: string
  objection_type: string | null
  objection_confidence: number | null
  rep_id: string
}

interface UseEventsReturn {
  allEvents: GenerationEvent[]
  todayEvents: GenerationEvent[]
  weekEvents: GenerationEvent[]
  monthEvents: GenerationEvent[]
  loading: boolean
  error: string | null
  lastRefresh: Date
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.getFullYear(), d.getMonth(), diff)
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function useEvents(dealership?: string): UseEventsReturn {
  const [allEvents, setAllEvents] = useState<GenerationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchEvents = useCallback(async () => {
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      let query = supabase
        .from('generation_events')
        .select('*')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5000)

      if (dealership) {
        query = query.eq('dealership', dealership)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      setAllEvents((data as GenerationEvent[]) || [])
      setError(null)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [dealership])

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 60000)
    return () => clearInterval(interval)
  }, [fetchEvents])

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const todayEvents = allEvents.filter(
    (e) => new Date(e.created_at) >= todayStart
  )
  const weekEvents = allEvents.filter(
    (e) => new Date(e.created_at) >= weekStart
  )
  const monthEvents = allEvents.filter(
    (e) => new Date(e.created_at) >= monthStart
  )

  return { allEvents, todayEvents, weekEvents, monthEvents, loading, error, lastRefresh }
}
