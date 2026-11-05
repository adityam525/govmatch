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

- Exam calendar (all exams / my exams, .ics) on homepage and /calendar.
- Eligibility: minimum marks with per-category cut-offs, typing speed (English or Hindi), women-only filter, perfect-match hero count.
- Next: compare jobs, photo and signature resizer, document checklist, syllabus per job, dynamic question bank.

- Question bank step 1 done: safe formula engine (lib/qb), seeded generation, options and explanations, 200-draw validation report, taxonomy draft (prisma/data/qb-taxonomy.ts). Next: database models, admin template editor, serving questions, custom test builder.
- Held: Engineering plus Qualification filter fix (user will confirm). Admin dropdown conversion pending (awaiting markup).

- Question bank step 2: models for subjects, chapters, topics, exams (IBPS PO/Clerk, SSC CGL/CHSL drafts) and exam-topic mapping. Mapping is a draft to verify against official notices.
- Admin dropdowns converted to the site style (users plan menu and NotificationSelect still native).

- Question bank step 3: QbTemplate model, template input checks, admin API (list, create, edit, publish, preview, delete; publishing blocked by the 200-draw report), 30 starter Quant templates with independent answer checks (prisma/check-qb-starters.ts). Next: admin editor screens, bulk import, serving questions, custom test builder.

## Decisions

- Imported papers are private to the user and Premium-gated until limits are set.
- Section times are all-or-nothing; total is their sum.
- Demo data: npx tsx prisma/demo/seed.ts, remove with --clean.

You convert ONE official government job notification (a web link or a PDF) into ONE JSON object for the GovMatch importer.

SOURCES

- Use only the notification I give you. Do not use other websites, memory or guesses.
- Official advertisements are authoritative. If the page and PDF disagree, use the PDF and list the conflict.

RULES THAT MATTER MOST

1. Never invent a value. If the notice does not state something, OMIT that field. Never write placeholders such as "N/A", "TBD" or 0.
2. Copy numbers exactly: vacancies, ages, dates, fees. Do not round or combine.
3. Dates are YYYY-MM-DD. If the notice gives a time (for example "5 PM"), do not put it in the date; list it under REVIEW NOTES.
4. Keep post-wise detail. If different posts have different qualifications, ages, pay or vacancies, make one entry per post.
5. Age: minAge and maxAge are the figures for GENERAL category as stated. Put category relaxation under REVIEW NOTES (do not add it to maxAge).
6. Use the exact names below for organizations, qualifications and branches. If the notice's name does not match any, write the closest and list it under REVIEW NOTES. Never create a new name silently.

OUTPUT FORMAT
Return exactly two parts, in this order:

PART 1: one JSON code block, in this shape:
{
"jobs": [
{
"title": "Full recruitment title as in the notice, with the year",
"organization": "<short name from the organization list>",
"officialLink": "<URL of the official notification page or PDF>",
"advertisementNo": "<as printed, if any>",
"applicationMode": "ONLINE | OFFLINE | BOTH",
"status": "LIVE | UPCOMING",
"state": "<state name, only if the job is for one state>",
"notificationDate": "YYYY-MM-DD",
"applicationStartDate": "YYYY-MM-DD",
"applicationEndDate": "YYYY-MM-DD",
"examDate": "YYYY-MM-DD",
"howToApply": "Short plain-English steps taken from the notice",
"selectionProcess": ["Written Exam", "Skill Test", "Physical Test", "Document Verification", "Medical Examination", "Interview"],
"fees": [{ "category": "General/OBC/EWS", "amount": "Rs 100" }],
"links": [{ "label": "Apply Online", "url": "https://...", "type": "<type from the importer's list>" }],
"faqs": [{ "question": "...", "answer": "..." }],
"posts": [
{
"title": "Post name as in the notice",
"vacancies": 0,
"minAge": 18,
"maxAge": 27,
"payScale": "As stated, for example Level 2 (Rs 19,900 - 63,200)",
"employmentType": "PERMANENT | CONTRACT | APPRENTICE | INTERNSHIP | TEMPORARY | DEPUTATION",
"qualifications": [
{ "name": "<qualification name from the list>", "branches": ["<branch from the list>"] }
],
"role": "<role name from the list, if one clearly fits>"
}
]
}
]
}

- "selectionProcess" may use ONLY those six words, in the notice's order.
- In "qualifications", leave out "branches" when any branch of that qualification is accepted.
- If a post accepts several alternative qualifications (for example "Diploma in Civil OR B.Tech in Mechanical"), list each as its own object with its own branches.
- For "Any Graduate", use the qualification named exactly that, with no branches.

PART 2: "REVIEW NOTES" as a plain bullet list, outside the JSON:

- Every value you were unsure of, with the notice's exact words and page number.
- Age relaxation by category, disability and ex-serviceman rules.
- Gender restrictions, domicile rules, height/chest, experience, certificates, typing speed, minimum marks and category cut-offs.
- Exact application closing TIME and any exam time.
- Names that did not match the lists.
- Anything the importer cannot hold.

REFERENCE LISTS (paste the current ones here before you send this prompt):

- Organizations (short names): ...
- Qualifications: ...
- Branches by qualification: ...
- Roles: ...
- Link types: ...

You write ONE helpful, accurate blog article about a government job, using ONLY the official notification I give you.

STRICT RULES

1. Every fact (dates, vacancies, age limits, fees, qualifications, selection steps) must come from the notification. If it is not there, do not mention it. Do not add typical or "usually" details from memory.
2. Write original text in your own words. Do not copy sentences from the notification or from other websites.
3. No promises about selection, salary growth or "guaranteed" outcomes. No invented tips presented as official.
4. Plain English a first-time applicant can follow. Short paragraphs.
5. End the article with: "Always confirm every detail on the official notification before applying."

CHOOSE ONE ANGLE per article (I will tell you which):

- "Eligibility explained": who can apply, age, qualification, post by post.
- "How to apply, step by step".
- "Selection process and exam stages".
- "Important dates and what to do before each".
- "Documents to keep ready" (only those the notice names).

OUTPUT: one JSON code block, nothing else:
{
"title": "Clear title, up to 160 characters, with the exam name and year",
"slug": "lowercase-words-with-hyphens",
"excerpt": "1 to 2 sentences, up to 300 characters",
"metaTitle": "Up to 70 characters, includes the exam name",
"metaDescription": "Up to 170 characters, says what the reader will learn",
"tags": ["Organization name", "Exam name", "Topic angle"],
"authorName": "GovMatch Team",
"coverImageAlt": "Describe a suitable image in one sentence",
"content": "<h2>...</h2><p>...</p><ul><li>...</li></ul>"
}

CONTENT FORMAT

- Use ONLY these HTML tags: h2, h3, p, ul, ol, li, strong, em, a, blockquote, br.
- Start with a short <p> introduction (no heading before it), then <h2> sections.
- Use up to 8 tags. Use <h2> for each question a reader would search for.
- Link to the job page with <a href="/jobs/JOB-SLUG">...</a> once, near the top. Only use absolute https links for the official notification.
- 600 to 1000 words. Put dates and numbers in lists or a short table-like list, not long paragraphs.

At the end, outside the JSON, list "FACTS USED" as bullets with the page of the notification each came from, so I can verify them.
