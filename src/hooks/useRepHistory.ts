import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Phase 1 — per-rep daily time-series hook.
 *
 * Scopes by generation_events.rep_id (trusted since migration 047 backfill
 * on 2026-04-19). Dashboard reads Supabase directly via RLS, same pattern
 * as useEvents. Proxy endpoint GET /v1/rep/:id/history exists as a
 * parallel path for non-dashboard consumers.
 *
 * Channel split uses the existing has_text / has_email / has_crm boolean
 * columns populated by the proxy's logGenerationEvent. Numbers reconcile
 * with /v1/rep/stats and the Floor view counts.
 *
 * Bucketing uses the user's local time for day boundaries. If the dealer
 * operates across timezones we'd want to normalize server-side, but a
 * single-location MVP doesn't need that today.
 */

export interface RepDayBucket {
  date: string // YYYY-MM-DD, local time
  total: number
  texts: number
  emails: number
  crm_notes: number
  unique_customers: number
}

export interface RepHistoryTotals {
  total: number
  texts: number
  emails: number
  crm_notes: number
  unique_customers: number
  estimated_time_saved_minutes: number
}

export interface RepInfo {
  id: string
  name: string
  email: string | null
  dealership_id: string | null
  status: string | null
}

interface RepEventRow {
  created_at: string
  has_text: boolean | null
  has_email: boolean | null
  has_crm: boolean | null
  customer_name: string | null
  platform: string | null
}

export interface UseRepHistoryReturn {
  rep: RepInfo | null
  days: RepDayBucket[]
  totals: RepHistoryTotals
  platforms: Record<string, number>
  loading: boolean
  error: string | null
  notFound: boolean
}

function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useRepHistory(repId: string | undefined, windowDays: number): UseRepHistoryReturn {
  const [rep, setRep] = useState<RepInfo | null>(null)
  const [events, setEvents] = useState<RepEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!repId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      // 1. Load rep metadata
      const { data: repRows, error: repErr } = await supabase
        .from('reps')
        .select('id, name, email, dealership_id, status')
        .eq('id', repId)
        .limit(1)

      if (repErr) {
        setError(repErr.message)
        return
      }
      if (!repRows || repRows.length === 0) {
        setNotFound(true)
        return
      }
      const r = repRows[0] as RepInfo
      setRep(r)

      // 2. Load events in window
      const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString()
      const { data, error: evErr } = await supabase
        .from('generation_events')
        .select('created_at, has_text, has_email, has_crm, customer_name, platform')
        .eq('rep_id', repId)
        .gte('created_at', since)
        .order('created_at', { ascending: true })
        .limit(10000)

      if (evErr) {
        setError(evErr.message)
        return
      }
      setEvents((data as RepEventRow[]) || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [repId, windowDays])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Bucket in local time
  const bucketMap = new Map<string, { total: number; texts: number; emails: number; crm_notes: number; customers: Set<string> }>()
  const customersWindow = new Set<string>()
  const platforms: Record<string, number> = {}

  events.forEach((e) => {
    const key = localDayKey(new Date(e.created_at))
    let b = bucketMap.get(key)
    if (!b) {
      b = { total: 0, texts: 0, emails: 0, crm_notes: 0, customers: new Set() }
      bucketMap.set(key, b)
    }
    b.total += 1
    if (e.has_text) b.texts += 1
    if (e.has_email) b.emails += 1
    if (e.has_crm) b.crm_notes += 1
    if (e.customer_name) {
      b.customers.add(e.customer_name)
      customersWindow.add(e.customer_name)
    }
    const p = e.platform || 'unknown'
    platforms[p] = (platforms[p] || 0) + 1
  })

  const days: RepDayBucket[] = []
  for (let i = 0; i < windowDays; i++) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (windowDays - 1 - i))
    const key = localDayKey(d)
    const b = bucketMap.get(key)
    days.push({
      date: key,
      total: b ? b.total : 0,
      texts: b ? b.texts : 0,
      emails: b ? b.emails : 0,
      crm_notes: b ? b.crm_notes : 0,
      unique_customers: b ? b.customers.size : 0,
    })
  }

  const totals: RepHistoryTotals = {
    total: events.length,
    texts: events.filter((e) => e.has_text).length,
    emails: events.filter((e) => e.has_email).length,
    crm_notes: events.filter((e) => e.has_crm).length,
    unique_customers: customersWindow.size,
    estimated_time_saved_minutes: Math.round(events.length * 1.5),
  }

  return { rep, days, totals, platforms, loading, error, notFound }
}
