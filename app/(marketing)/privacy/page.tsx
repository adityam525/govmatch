export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-neutral-900">Privacy Policy</h1>
      <p className="text-sm text-neutral-400 mt-1">Last updated: July 2026</p>

      <div className="mt-8 space-y-6 text-sm text-neutral-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">1. Information We Collect</h2>
          <p>When you create an account, we collect your name, email, and the education/eligibility details you choose to provide (date of birth, category, qualification, degree). This data powers your personalized job matches.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">2. How We Use Your Information</h2>
          <p>Your profile data is used solely to compute job match scores and personalize your experience on GovMatch. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">3. Data Storage</h2>
          <p>Your data is stored securely using industry-standard encryption practices, including hashed passwords and encrypted database connections.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">4. Third-Party Sign-In</h2>
          <p>If you sign in with Google, we receive your name and email from Google as part of the authentication process, in accordance with Google's own privacy policy.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">5. Your Rights</h2>
          <p>You can update or delete your profile information at any time from your account settings. Contact us if you'd like your account fully deleted.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-2">6. Cookies</h2>
          <p>We use cookies to maintain your login session. We do not use third-party tracking or advertising cookies.</p>
        </section>
      </div>
    </div>
  );
}
