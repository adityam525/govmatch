export default function PrivacyPage() {
  const sections: [string, string][] = [
    ['1. Information we collect', 'When you create an account we collect your name and email. In your profile you may add your date of birth, category, education, gender, mobile number, home state, work experience, certificates, height and chest measurements, and, if you choose, disability details and special status (for example ex-serviceman, widow or divorced woman). Giving the sensitive details is optional.'],
    ['2. How we use it', 'This information is used to work out which jobs you are eligible for and to personalise what you see, for example age relaxation, gender and home-state rules. We do not sell your personal data and we do not use it for advertising.'],
    ['3. Question papers you upload', 'A paper you import becomes a private mock test that only you can open. We read the file to extract questions and keep the resulting test, not other staff-facing copies. You are responsible for having the right to use what you upload.'],
    ['4. Mock test results', 'Your answers, scores and time taken are stored so you can review them and see your progress. Only you can see them.'],
    ['5. Storage and security', 'Passwords are stored hashed, and database connections are encrypted. No system is perfectly secure, so use a strong, unique password.'],
    ['6. Third-party sign-in', 'If sign-in with Google is offered and you use it, we receive your name and email from Google, under Google\u2019s own privacy policy.'],
    ['7. Your choices', 'You can change or remove profile details at any time from your profile page. To have your account and its data deleted, contact us through the contact page and we will do it.'],
    ['8. Cookies', 'We use cookies to keep you signed in. We do not use third-party tracking or advertising cookies.'],
    ['9. Who processes your data', 'We use hosting, database and email providers to run the service. They process data only on our behalf. Your data is not sold or used for advertising.'],
    ['10. How long we keep it', 'We keep your account data while your account exists. When you delete your account from your profile page, your profile, saved jobs, applications and test history are deleted.'],
    ['11. Age', 'GovMatch is meant for people aged 18 and over. If you are under 18, please do not create an account.'],
    ['12. Contact and complaints', 'For questions, corrections or complaints about your data, write to us from the contact page. If you think your data has been exposed, tell us at once.'],
    ['13. Changes', 'We may update this policy. The date below shows the latest version.'],
  ];
  return (
    <div className="page-x mx-auto w-full max-w-3xl py-12">
      <h1 className="page-title text-neutral-900">Privacy Policy</h1>
      <p className="text-sm text-neutral-400 mt-1">Last updated: November 2026</p>
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
