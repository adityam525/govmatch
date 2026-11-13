export default function TermsPage() {
  const sections: [string, string][] = [
    ['1. Acceptance of terms', 'By using GovMatch you agree to these terms. If you do not agree, please do not use the platform.'],
    ['2. Nature of the service', 'GovMatch collects and organises government job notifications from official sources. We do not conduct recruitment and are not affiliated with any government body, PSU or recruiting organisation listed here.'],
    ['3. Verify before you apply', 'Dates, vacancies, age limits and eligibility can change or contain errors. Our eligibility result is a guide based on the details you give and the notice as we read it. Always check the official notice and website before you apply. The official notice is final.'],
    ['4. Your account', 'You are responsible for keeping your login details safe and for activity under your account. The details you enter should be accurate.'],
    ['5. Question papers and mock tests', 'You may import only papers you have the right to use. Imported papers stay private to your account. Conversion from a file can contain mistakes, so check the questions and answers before relying on a test. We may remove content that breaks the law or others\u2019 rights.'],
    ['6. Premium', 'Premium features are provided as described on the plans page. Online payment is not yet available. Premium is set up on request, and features may change.'],
    ['7. Limitation of liability', 'GovMatch is not liable for loss arising from reliance on information on the platform, including missed deadlines, rejected applications or wrong eligibility results.'],
    ['8. Changes', 'We may update these terms. Continued use after a change means you accept it.'],
  ];
  return (
    <div className="page-x mx-auto w-full max-w-3xl py-12">
      <h1 className="page-title text-neutral-900">Terms &amp; Conditions</h1>
      <p className="text-sm text-neutral-500 mt-1">Last updated: November 2026</p>
      <div className="mt-8 space-y-6 text-sm text-neutral-600 leading-relaxed">
        {sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="text-base font-semibold text-neutral-900 mb-2">{h}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
