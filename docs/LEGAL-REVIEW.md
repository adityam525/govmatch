# Brief for legal review (GovMatch)

## What the service does
Matches Indian government job notices to a user's profile and offers mock tests.

## Personal data collected
- Account: name, email, password (hashed), optional Google sign-in.
- Profile: date of birth, gender, category (and OBC layer), home state, mobile number, education, experience, certificates, typing and shorthand speeds, driving experience, height and chest.
- Sensitive and optional: disability types and percentage, special statuses (ex-serviceman, widow, divorced woman).
- Activity: saved jobs, applications tracked, mock test answers, scores and timings, uploaded question papers (private).

## Processors and storage
Vercel (hosting), Supabase (database, India or Singapore region to be confirmed), an email provider (to be chosen), Google (sign-in).

## Questions for counsel
1. Consent wording and where to capture it (signup, sensitive fields). DPDP Act compliance.
2. Under-18 users: block, or require parental consent?
3. Retention and deletion periods (deletion is self-service in the profile).
4. Breach notification process and a named grievance officer.
5. Terms: user-uploaded question papers and copyright; disclaimer on job information accuracy; limits of liability.
6. Premium terms and refunds, once payments exist.
7. Cross-border transfer disclosure.
