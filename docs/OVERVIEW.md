# GovMatch: product overview

GovMatch helps Indian government job seekers find jobs they are actually eligible for, track deadlines, and prepare for exams.

## Core features

1. **Eligibility-based job matching.** A candidate enters qualification, date of birth, category, and optional details (disability, typing speed, experience). Every job post shows whether they qualify, and why or why not, using the rules in each notice.
2. **Job listings per post.** One notice with several posts appears as separate entries, each with its own vacancies, pay and eligibility, all linking to one notice page.
3. **Dates in one place.** Each job has a dated schedule (apply, admit card, exam, result), with postponements flagged. A calendar shows all exams or only the user's, and exports to Google or Apple Calendar.
4. **Compare jobs.** Up to three posts side by side, with the user's eligibility shown for each.
5. **Preparation.** Mock tests with an exam-style screen and analysis. Practice by topic from a question bank where every question gets new numbers and a worked explanation. Users can import their own papers privately.
6. **Tools.** Photo and signature resizer for application forms, GATE score estimator.
7. **Account.** Sign up, log in, password reset, saved jobs, application tracker, profile completeness.

## How content gets in (admin)

1. Admin adds a job by form or JSON import (an AI agent can turn a notification link or PDF into the JSON; a person checks the review notes).
2. The dry run validates it. Fix errors, then import as a draft.
3. Check the draft against the official notice, then publish.
4. Question templates are written in admin and checked automatically (200 trial questions) before they can be published.

## Quality and safety

- 26 automated rule checks plus a build run before every release; CI runs the offline ones on each pull request.
- Security: forms protected against cross-site requests, private pages and admin separated and hidden from search, security headers, rate-limited logins, hashed passwords.
- Search and accessibility: Lighthouse 100 for accessibility, best practices and SEO.
- Job information comes from official notices and the site tells users to confirm there.

## Release process

`feature branch` -> `dev` (integration) -> `main` (release, tagged). Every pull request runs the checks.

## Before public launch (owner actions)

Production environment variables and a separate test database, database row-level security, email provider for password reset, verification of every published job, legal review of privacy and terms, and a regional database move for speed.

## Planned next

Stronger admin security (per-person accounts, two-factor), disability-specific vacancies, document checklist, previous-year papers, typing test, payments (after launch).
