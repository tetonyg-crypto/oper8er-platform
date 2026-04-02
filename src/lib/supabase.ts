import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || 'https://mqnmemnogbotgmsmqfie.supabase.co'
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-sD_RSqo9SNizbhQ0kqWSA_tJbsWD_m'

export const supabase = createClient(url, key)
