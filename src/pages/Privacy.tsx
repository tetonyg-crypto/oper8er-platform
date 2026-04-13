export default function Privacy() {
  return (
    <div className="bg-[#F2F2F7] min-h-screen" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" }}>
      <div className="max-w-[720px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="bg-white rounded-2xl border border-black/8 px-4 py-8 md:p-12 shadow-sm">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' as const, color: '#7F77DD', marginBottom: 8 }}>LEGAL</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px', marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: '#636366', marginBottom: 32 }}>Effective April 2, 2026 &middot; Last updated April 2, 2026</p>

          <Section title="What Brevmont Does">
            Brevmont is a Chrome extension that helps automotive sales representatives generate professional text messages, emails, and CRM notes using AI. It operates inside CRM platforms (such as VinSolutions), email clients, and social media to assist reps with customer communications.
          </Section>

          <Section title="What Data We Collect">
            <p>Brevmont collects the following data to provide its core functionality:</p>
            <ul>
              <li><strong>Rep profile information:</strong> First name, last name, job title, dealership name, city, state, communication preferences, and selling style. This information is provided voluntarily during onboarding and stored locally in the browser via Chrome storage.</li>
              <li><strong>Customer context from CRM pages:</strong> When a rep opens Brevmont on a CRM page, the extension reads visible customer information (name, phone, email, vehicle of interest, status) from the current webpage. This data is used solely to generate a relevant AI response and is not stored permanently on our servers.</li>
              <li><strong>Generation events:</strong> When a rep generates a text, email, or CRM note, we log the following to our database: rep name, dealership name, customer name, vehicle, platform used (e.g., VinSolutions, Gmail), the type of output generated, and a timestamp. We do not store the full content of generated outputs on our servers.</li>
              <li><strong>License key:</strong> A dealership-issued license key is stored locally to validate access.</li>
            </ul>
          </Section>

          <Section title="How Data Is Stored">
            <ul>
              <li><strong>Local storage:</strong> Rep profile data and preferences are stored in Chrome's built-in sync storage, which syncs across the rep's Chrome profile.</li>
              <li><strong>Cloud database:</strong> Generation event metadata is stored in a Supabase-hosted PostgreSQL database located in AWS US-West-2 (Oregon). This data is used for analytics dashboards that show dealership managers rep activity, objection tracking, and performance metrics.</li>
              <li><strong>AI processing:</strong> Customer context and rep input are sent to Anthropic's Claude API for generation. This data is transmitted securely over HTTPS and is not retained by Anthropic after processing, per their API data usage policy.</li>
            </ul>
          </Section>

          <Section title="How Data Is Used">
            <ul>
              <li>To generate AI-powered text messages, emails, and CRM notes for the rep</li>
              <li>To provide dealership managers with activity dashboards and performance analytics</li>
              <li>To classify customer objections for coaching and training purposes</li>
              <li>To validate license keys and enforce subscription access</li>
            </ul>
          </Section>

          <Section title="What We Do NOT Do">
            <ul>
              <li>We do not sell any user data to third parties</li>
              <li>We do not use data for advertising</li>
              <li>We do not track browsing history outside of supported CRM and communication platforms</li>
              <li>We do not store passwords, credit card numbers, or financial information</li>
              <li>We do not access data from pages where Brevmont is not actively being used by the rep</li>
            </ul>
          </Section>

          <Section title="Data Retention">
            Generation event metadata is retained for the duration of the dealership's active subscription. Upon cancellation, data may be retained for up to 90 days before deletion.
          </Section>

          <Section title="Data Security">
            All data transmission between the extension, our proxy server, and our database uses HTTPS encryption. Database access is controlled via row-level security policies.
          </Section>

          <Section title="Your Rights">
            You may request deletion of your data at any time by contacting privacy@brevmont.com. Dealership administrators may request deletion of all data associated with their dealership.
          </Section>

          <Section title="Changes to This Policy">
            We may update this privacy policy from time to time. Changes will be posted at brevmont.com/privacy with an updated effective date.
          </Section>

          <Section title="Contact">
            <p>For questions about this privacy policy or your data:</p>
            <p style={{ marginTop: 8 }}>
              <strong>Email:</strong> privacy@brevmont.com<br />
              <strong>Company:</strong> Brevmont Labs LLC<br />
              <strong>Website:</strong> brevmont.com
            </p>
          </Section>
        </div>

        <div className="text-center py-6 text-xs text-[#AEAEB2]">
          &copy; 2026 Brevmont Labs LLC. All rights reserved.
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1C1C1E', marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 14, color: '#636366', lineHeight: 1.7 }}>{children}</div>
      <style>{`
        ul { padding-left: 20px; margin-top: 8px; }
        li { margin-bottom: 8px; }
      `}</style>
    </div>
  )
}
