# Go-live checklist

## Done in code
- [x] Pricing, privacy, terms rewritten to match what exists (lawyer review still needed)
- [x] Demo data removed; placeholder jobs deleted (run delete-placeholders.ts --apply)
- [x] Reference data: states, qualifications, branches, organizations

## You must do
- [ ] Vercel env: NEXT_PUBLIC_SITE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, ADMIN_PASSWORD, DATABASE_URL
- [ ] Check every published job against its official notice (dates, vacancies, age, links)
- [ ] Fill organization websites (about 175 blank)
- [ ] Confirm account deletion on request, or ask for a self-service button
- [ ] Lawyer review of privacy and terms
- [ ] Decide what /admission should be (currently Coming soon)
- [ ] Test signup, login, profile, matching, saved jobs on the deployed site
- [ ] Run npx tsx prisma/audit-launch.ts against production

## Not available yet (pages must not promise them)
Password reset, email alerts, payments, Google sign-in, logo uploads.
