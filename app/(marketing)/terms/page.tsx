export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-neutral-900">Terms & Conditions</h1>
      <p className="text-sm text-neutral-400 mt-1">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using GovMatch, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">2. Nature of the Service</h2>
          <p>GovMatch aggregates and organizes publicly available government job notifications from official sources. We do not conduct recruitment, and we are not affiliated with any government body, PSU, or recruiting organization listed on the platform.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">3. No Guarantee of Accuracy</h2>
          <p>While we make every effort to verify listings against official sources, notification details (dates, vacancies, eligibility) can change without notice. Always confirm details on the official website before applying.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">4. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">5. Limitation of Liability</h2>
          <p>GovMatch is not liable for any loss or damage arising from reliance on information provided through the platform, including missed deadlines or application errors.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">6. Changes to These Terms</h2>
          <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
        </section>
      </div>
    </div>
  );
}
