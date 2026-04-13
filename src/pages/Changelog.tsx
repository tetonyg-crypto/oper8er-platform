import { Link } from 'react-router-dom'

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

const entries: ChangelogEntry[] = [
  {
    version: '1.9.2',
    date: '2026-04-12',
    changes: [
      'Async generation queue (BullMQ + Redis) for faster performance under load',
      'Offline resilience: queued generations replay when connection returns',
      'Structured JSON logging with Axiom cloud transport',
      'Mark as Sold button in extension for deal outcome tracking',
      'Extension popup with settings, queue status, and version info',
      'Console.log cleanup: 98 calls replaced with structured Pino logger',
    ],
  },
  {
    version: '1.9.1',
    date: '2026-04-10',
    changes: [
      'HMAC request signing between extension and proxy (Phase 1)',
      'Owner dashboard with real-time stats, rep management, and billing',
      'Founder dashboard with MRR, costs, and error tracking',
      'Admin panel with dealership suspend, impersonate, and messaging',
      'Customer identity resolution with SHA-256 hashing',
      'Per-dealership API cost tracking',
      'Extension error telemetry and version checking',
    ],
  },
  {
    version: '1.8.0',
    date: '2026-04-06',
    changes: [
      'Row-level security (RLS) on all Supabase tables',
      'Magic link authentication for dealership owners',
      'Stripe checkout integration with billing portal',
      'Deal outcome and ROI attribution tracking',
      'Onboarding progress tracking for new dealerships',
      'Drip email sequence (Day 1, 3, 7) for new signups',
    ],
  },
  {
    version: '1.7.0',
    date: '2026-03-28',
    changes: [
      'Context Reply: screenshot-based AI responses (Command+ tier)',
      'Voice input for hands-free message generation',
      'Objection coaching with real-time classification',
      'Command mode with Alt+K shortcut',
      'Lead capture: scan, voice, and paste modes',
      'Ghost lead detection and reassignment alerts',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-16',
    changes: [
      'Initial launch: AI-powered message generation for auto sales',
      'VinSolutions, Gmail, Facebook, LinkedIn, Instagram support',
      'Tier-based licensing (Floor, Command, Command+, Group)',
      'Real-time activity dashboard for dealership managers',
    ],
  },
]

export default function Changelog() {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <nav className="sticky top-0 z-50 bg-white border-b border-black/8 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/owner" className="text-sm text-[#636366] hover:text-[#1C1C1E]">&larr; Dashboard</Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7F77DD] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#1C1C1E] text-lg">Changelog</span>
        </div>
        <div />
      </nav>

      <main className="max-w-[700px] mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">What's New</h1>
        <p className="text-sm text-[#636366] mb-8">Updates and improvements to Brevmont.</p>

        <div className="space-y-8">
          {entries.map((entry) => (
            <div key={entry.version} className="card">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-white bg-[#7F77DD] px-2.5 py-1 rounded-full">
                  v{entry.version}
                </span>
                <span className="text-xs text-[#AEAEB2]">{entry.date}</span>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1C1C1E]">
                    <span className="text-[#34C759] mt-0.5 flex-shrink-0">+</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
