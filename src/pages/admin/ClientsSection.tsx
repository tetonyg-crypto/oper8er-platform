import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

interface DealerToken {
  id: string
  token: string
  dealership: string
  rep_name: string
  vertical_config: string | null
  active: boolean
  created_at: string
}

function generateToken(dealership: string): string {
  const slug = dealership
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)
  const rand = Math.random().toString(36).substring(2, 6)
  return `${slug}-op8-${rand}-live`
}

export default function ClientsSection() {
  const [tokens, setTokens] = useState<DealerToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formDealership, setFormDealership] = useState('')
  const [formVertical, setFormVertical] = useState('auto')
  const [formRep, setFormRep] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchTokens = useCallback(async () => {
    const { data } = await supabase
      .from('dealer_tokens')
      .select('*')
      .order('created_at', { ascending: false })
    setTokens((data as DealerToken[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const handleAdd = async () => {
    if (!formDealership.trim()) return
    setSubmitting(true)
    const token = generateToken(formDealership)
    await supabase.from('dealer_tokens').insert({
      token,
      dealership: formDealership.trim(),
      rep_name: formRep.trim() || null,
      vertical_config: formVertical,
      active: true,
    })
    setFormDealership('')
    setFormRep('')
    setFormVertical('auto')
    setShowModal(false)
    setSubmitting(false)
    fetchTokens()
  }

  const handleRevoke = async (id: string) => {
    await supabase.from('dealer_tokens').update({ active: false }).eq('id', id)
    fetchTokens()
  }

  const maskToken = (t: string) => {
    if (t.length <= 8) return t
    return t.slice(0, 4) + '****' + t.slice(-4)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Clients</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#7F77DD] hover:bg-[#534AB7] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          Add Client
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6">
            <div className="w-full h-8 rounded bg-[#F2F2F7] animate-pulse mb-3" />
            <div className="w-full h-8 rounded bg-[#F2F2F7] animate-pulse mb-3" />
            <div className="w-full h-8 rounded bg-[#F2F2F7] animate-pulse" />
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#AEAEB2]">
            No clients yet. Click "Add Client" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-black/8">
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">
                  Dealership
                </th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">
                  Vertical
                </th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">
                  Status
                </th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">
                  Created
                </th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">
                  Token
                </th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="border-b border-black/5 last:border-0 hover:bg-[#F2F2F7]/50">
                  <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E]">{t.dealership}</td>
                  <td className="px-4 py-3 text-sm text-[#636366]">{t.vertical_config || 'auto'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        t.active
                          ? 'bg-[#34C759]/15 text-[#34C759]'
                          : 'bg-[#FF3B30]/15 text-[#FF3B30]'
                      }`}
                    >
                      {t.active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#AEAEB2]">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-[#AEAEB2]">
                    {maskToken(t.token)}
                  </td>
                  <td className="px-4 py-3">
                    {t.active && (
                      <button
                        onClick={() => handleRevoke(t.id)}
                        className="text-xs font-semibold text-[#FF3B30] hover:underline cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-full max-w-[420px] mx-4">
            <h2 className="text-lg font-bold text-[#1C1C1E] mb-4">Add New Client</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1">
                  Dealership Name
                </label>
                <input
                  type="text"
                  value={formDealership}
                  onChange={(e) => setFormDealership(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD]"
                  placeholder="Dealership Name"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1">
                  Vertical
                </label>
                <select
                  value={formVertical}
                  onChange={(e) => setFormVertical(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1C1C1E] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD]"
                >
                  <option value="auto">Auto Dealership</option>
                  <option value="powersports">Powersports</option>
                  <option value="rv">RV</option>
                  <option value="marine">Marine</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold tracking-wide text-[#636366] block mb-1">
                  Rep Name
                </label>
                <input
                  type="text"
                  value={formRep}
                  onChange={(e) => setFormRep(e.target.value)}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 focus:border-[#7F77DD]"
                  placeholder="John Smith"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-semibold text-[#636366] hover:bg-[#F2F2F7] rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={submitting || !formDealership.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#7F77DD] hover:bg-[#534AB7] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
