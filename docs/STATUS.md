# GovMatch status

Updated: 3 Nov 2026. Branch: new-flow-phase-1.

## Built
- Jobs: published/draft, schedule with times and postponements, eligibility matching (qualification levels and branches per qualification, age with cut-off date and relaxations, gender, state, experience, certificates, height/chest), preferred recruiters boost.
- Users: profile with education list, special categories, preferences, Premium plans set by admin, dashboard, schedule-change notices.
- Admin: jobs, lookups (organizations, states, categories, qualifications and branches), blog with rich text and SEO, mock tests, exam patterns, users, messages.
- Blog: public list and articles, sitemap, robots.
- Mock tests: official tests (admin builder, JSON import, patterns, section timers, link to job, difficulty), catalogue with filters and search, exam window (palette, timers, autosave, results), user history and progress, user paper import (docx and text PDF) with review.
- PWA manifest and icons.

## Tests (run with npx tsx prisma/<name>.ts)
check-fit, check-age, check-requirements, check-schedule, check-cutoff, check-qualrules, check-ladder, check-preferences, check-mocktest, check-mockjson, check-mocksections, check-attempt, check-mockanalytics, check-parser, check-paperreader, demo/assert (after demo/seed).

## Open
- Reference data: more organizations (about 160 listed), qualification taxonomy rework (merge B.Sc Nursing/Agriculture into B.Sc, Diploma variants into Diploma, add missing degrees and all branches).
- Bulk import: allow several qualifications per post.
- Supabase storage bucket and keys (logo and image uploads).
- Google sign-in credentials, email provider, payments, admin accounts instead of one shared password, Redis rate limiting.
- Mobile app direction (PWA is in place; native would need token login).
- Scanned paper import (needs OCR, decided against AI for now).
- Verify every seeded job against its official notice before launch.

- Paper import: parser needs training on more real paper layouts (user will supply examples); filtering is basic for now.

- Taxonomy: seed-taxonomy.ts and merge-qualifications.ts written (preview first). Undecided levels: Vocational, Postgraduate Diploma, CA/CMA/CS, PGDM.
- Demo data must be cleaned from production (seed.ts --clean) before launch.

- Taxonomy seed previewed (30 qualifications, 288 branches, 5th Pass dropped). Apply order: seed-taxonomy, merge-qualifications, audit, check-ladder. Level decisions pending: Vocational, PG Diploma/PGDM, CA/CMA/CS.
- Bulk import: already takes several qualifications; per-qualification branches still to add.

- Taxonomy applied: 64 qualifications, 515 branches; B.Sc/M.Sc/Diploma merged (Diploma now one qualification). Open: Vocational, PG Diploma/PGDM and CA/CMA/CS need ladder rule changes before adding.
- Organizations: seed-orgs.ts part 1 previewed; part 2 and sector lists pending; websites left blank on purpose.

- Organizations: part 1 applied (67 added); part 2 and local-body lists pending; websites blank on purpose.
- Bulk import: each qualification can carry its own branches ({name, branches}); plain names still work.

- Levels decided: Vocational follows its base level (no new qualification); PG Diploma and PGDM at level 7; CA/CMA/CS at level 6. Vocational rule limited to levels 5 and below.
- Organizations part 2 drafted (PSUs, defence, education, research, healthcare, departments, union territories). Next: High Courts, state departments, local bodies.
- Excel export of reference data: npx tsx prisma/export-reference.ts (writes exports/).

- Organizations part 2 applied (about 107 added). Still to add: High Courts and judiciary, state departments, local bodies.
- Excel export now includes disability groups, special statuses, rule lists, certificates, gender options.

- Pre-testing cleanup: all sample jobs deleted (jobs to be added one by one), unused files removed, /admission removed.
- Held until final deployment: email, payments, Google sign-in, Supabase uploads, password reset, mobile app, scanned papers, legal review.
- Next: Study Zone content audit, Premium tools (calendar, photo resizer, compare jobs), then the dynamic question bank.

## Decisions
- Imported papers are private to the user and Premium-gated until limits are set.
- Section times are all-or-nothing; total is their sum.
- Demo data: npx tsx prisma/demo/seed.ts, remove with --clean.
