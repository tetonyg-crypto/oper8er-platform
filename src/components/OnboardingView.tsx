interface OnboardingState {
  rep_added_at: string | null
  extension_installed_at: string | null
  first_generation_at: string | null
  first_week_complete_at: string | null
}

interface OnboardingViewProps {
  state: OnboardingState
  dealershipName: string
}

const steps = [
  {
    key: 'rep_added_at' as const,
    number: 1,
    title: 'Add your first rep',
    description: 'Invite a sales rep to start using Brevmont on your team.',
    actionLabel: 'Invite Rep',
    actionHref: 'javascript:void(0)',
  },
  {
    key: 'extension_installed_at' as const,
    number: 2,
    title: 'Install the Brevmont extension',
    description: 'Your reps need the Chrome extension to generate messages inside VinSolutions.',
    actionLabel: 'Install Extension',
    actionHref: 'https://chromewebstore.google.com/detail/brevmont-ai-sales-assistant/odianhkmfpbcnggigamhjbpkkcbkcckh',
  },
  {
    key: 'first_generation_at' as const,
    number: 3,
    title: 'Generate your first message',
    description: 'Open a customer record in VinSolutions and click the Brevmont icon to generate a personalized message.',
    actionLabel: null,
    actionHref: null,
  },
  {
    key: 'first_week_complete_at' as const,
    number: 4,
    title: 'Complete your first week',
    description: 'Use Brevmont for 7 days to unlock your full dashboard and ROI tracking.',
    actionLabel: null,
    actionHref: null,
  },
]

export default function OnboardingView({ state, dealershipName }: OnboardingViewProps) {
  const completedCount = steps.filter(s => state[s.key]).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Welcome to Brevmont</h1>
        <p className="text-sm text-[#636366] mt-1">Your dashboard fills in as you complete each step.</p>
        <p className="text-xs text-[#AEAEB2] mt-2">
          {dealershipName} &mdash; {completedCount} of {steps.length} complete
        </p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => {
          const done = !!state[step.key]
          return (
            <div
              key={step.key}
              className={`bg-white rounded-xl p-5 border ${done ? 'border-[#0D6E6E]/20' : 'border-black/5'} flex gap-4`}
            >
              {/* Number Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-[#0D6E6E]' : 'bg-[#E5E7EB]'
                }`}
              >
                {done ? (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold text-[#636366]">{step.number}</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${done ? 'text-[#0D6E6E]' : 'text-[#1C1C1E]'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-[#636366] mt-1 leading-relaxed">{step.description}</p>

                {!done && step.actionLabel && step.actionHref && (
                  <a
                    href={step.actionHref}
                    target={step.actionHref.startsWith('http') ? '_blank' : undefined}
                    rel={step.actionHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-block mt-3 text-xs font-semibold text-white bg-[#0D6E6E] hover:bg-[#0A5A5A] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {step.actionLabel}
                  </a>
                )}

                {done && state[step.key] && (
                  <p className="text-[10px] text-[#AEAEB2] mt-2">
                    Completed {new Date(state[step.key]!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
