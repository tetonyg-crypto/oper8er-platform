import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'

const PROXY_URL = 'https://web-production-af474.up.railway.app'

interface Dealership {
  id: string
  name: string
  tier: string
  subscription_status: string
  license_key: string | null
  created_at: string
  revoked: boolean
  events_30d: number
  reps: { active: number; total: number }
  owners: { email: string; role: string }[]
}

export default function DealershipsSection() {
  const { session } = useAuth()
  const [dealerships, setDealerships] = useState<Dealership[]>([])
  const [loading, setLoading] = useState(true)
  const [messageModal, setMessageModal] = useState<{ to: string; name: string } | null>(null)
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchDealerships = useCallback(async () => {
    if (!session?.access_token) return
    try {
      const resp = await fetch(`${PROXY_URL}/api/admin/dealerships`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (resp.ok) setDealerships(await resp.json())
    } catch (e) {
      console.error('Failed to fetch dealerships:', e)
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => { fetchDealerships() }, [fetchDealerships])

  const handleSuspend = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'suspend' : 'activate'
    const msg = action === 'suspend'
      ? 'Suspend this dealership? Their extension will stop working immediately.'
      : 'Reactivate this dealership?'
    if (!confirm(msg)) return

    await fetch(`${PROXY_URL}/api/admin/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ dealership_id: id, action }),
    })
    fetchDealerships()
  }

  const handleImpersonate = (id: string, name: string) => {
    sessionStorage.setItem('impersonate_dealership_id', id)
    sessionStorage.setItem('impersonate_dealership_name', name)
    window.location.href = '/owner'
  }

  const handleSendMessage = async () => {
    if (!messageModal || !msgSubject || !msgBody) return
    setMsgSending(true)
    await fetch(`${PROXY_URL}/api/admin/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
      body: JSON.stringify({ to: messageModal.to, subject: msgSubject, body: msgBody }),
    })
    setMsgSending(false)
    setMsgSent(true)
    setTimeout(() => {
      setMessageModal(null)
      setMsgSent(false)
      setMsgSubject('')
      setMsgBody('')
    }, 1500)
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-[#34C759]/15 text-[#34C759]',
      suspended: 'bg-[#FF9500]/15 text-[#FF9500]',
      churned: 'bg-[#FF3B30]/15 text-[#FF3B30]',
      past_due: 'bg-[#FF9500]/15 text-[#FF9500]',
    }
    return (
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Dealerships</h1>
        <span className="text-sm text-[#636366]">{dealerships.length} total</span>
      </div>

      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="w-full h-10 rounded bg-[#F2F2F7] animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-black/8">
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Name</th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Tier</th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Status</th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Events (30d)</th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Reps</th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Created</th>
                <th className="text-left text-[11px] uppercase font-semibold tracking-wide text-[#636366] px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dealerships.map(d => (
                <>
                  <tr key={d.id} className="border-b border-black/5 last:border-0 hover:bg-[#F2F2F7]/50">
                    <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E]">{d.name}</td>
                    <td className="px-4 py-3 text-sm text-[#636366]">{d.tier || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(d.subscription_status)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E]">{d.events_30d}</td>
                    <td className="px-4 py-3 text-sm text-[#636366]">{d.reps.active}/{d.reps.total}</td>
                    <td className="px-4 py-3 text-sm text-[#AEAEB2]">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                        className="text-xs font-semibold text-[#7F77DD] hover:underline cursor-pointer"
                      >
                        {expandedId === d.id ? 'Hide' : 'View'}
                      </button>
                      <button
                        onClick={() => handleSuspend(d.id, d.subscription_status)}
                        className={`text-xs font-semibold hover:underline cursor-pointer ${
                          d.subscription_status === 'active' ? 'text-[#FF9500]' : 'text-[#34C759]'
                        }`}
                      >
                        {d.subscription_status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleImpersonate(d.id, d.name)}
                        className="text-xs font-semibold text-[#0D6E6E] hover:underline cursor-pointer"
                      >
                        Impersonate
                      </button>
                      {d.owners.length > 0 && (
                        <button
                          onClick={() => setMessageModal({ to: d.owners[0].email, name: d.name })}
                          className="text-xs font-semibold text-[#636366] hover:underline cursor-pointer"
                        >
                          Message
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === d.id && (
                    <tr key={`${d.id}-details`} className="bg-[#F9F9FB]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[11px] uppercase font-semibold text-[#636366] mb-1">License Key</p>
                            <p className="font-mono text-[#1C1C1E]">{d.license_key || 'None'}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase font-semibold text-[#636366] mb-1">Owners/Managers</p>
                            {d.owners.length > 0 ? d.owners.map((o, i) => (
                              <p key={i} className="text-[#1C1C1E]">{o.email} <span className="text-[#AEAEB2]">({o.role})</span></p>
                            )) : <p className="text-[#AEAEB2]">No linked users</p>}
                          </div>
                          <div>
                            <p className="text-[11px] uppercase font-semibold text-[#636366] mb-1">Revoked</p>
                            <p className={d.revoked ? 'text-[#FF3B30]' : 'text-[#34C759]'}>{d.revoked ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      {/* Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="card w-[500px]">
            {msgSent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[#34C759] text-xl">&#10003;</span>
                </div>
                <p className="text-sm font-semibold text-[#1C1C1E]">Message sent to {messageModal.to}</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-[#1C1C1E] mb-1">Message {messageModal.name}</h2>
                <p className="text-sm text-[#636366] mb-4">Sending to {messageModal.to}</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={msgSubject}
                    onChange={e => setMsgSubject(e.target.value)}
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30"
                  />
                  <textarea
                    placeholder="Message body..."
                    value={msgBody}
                    onChange={e => setMsgBody(e.target.value)}
                    rows={5}
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7F77DD]/30 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => { setMessageModal(null); setMsgSubject(''); setMsgBody('') }}
                    className="px-4 py-2 text-sm font-semibold text-[#636366] hover:bg-[#F2F2F7] rounded-lg cursor-pointer">Cancel</button>
                  <button onClick={handleSendMessage} disabled={msgSending || !msgSubject || !msgBody}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#7F77DD] hover:bg-[#534AB7] rounded-lg cursor-pointer disabled:opacity-50">
                    {msgSending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
