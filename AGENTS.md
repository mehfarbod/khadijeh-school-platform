# AGENTS.md

## Project
This repository is the main production-oriented Next.js platform for the girls' high school "شاهد حضرت خدیجه (ص)".

- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, Prisma, PostgreSQL, pnpm.
- UI language: Persian.
- Layout direction: RTL.
- Current source of truth: the current working branch/version selected by the user. Do not assume an old `main` snapshot is authoritative when the user explicitly says otherwise.
- Work incrementally. Prefer small, reviewable changes over broad rewrites.

## How Codex should work

Codex is a team member, not only an advisor.

### Routine work
For clear, low-risk, scoped tasks:
1. Inspect the existing implementation and conventions.
2. Make the change end-to-end.
3. Run the most relevant checks/tests/build.
4. Handle Git/GitHub work when requested or clearly part of the task.
5. Report exactly what changed, what was tested, and anything remaining.

Do not stop for approval for ordinary implementation details or small, non-fundamental improvements that clearly improve the requested flow.

### High-impact changes
Before making a change that materially alters architecture, data ownership, authentication/session design, deployment architecture, or another fundamental project decision:
1. Explain the proposed approach.
2. Explain the important trade-offs/risk.
3. Wait for user approval.

Do not expand the scope just because another improvement is noticed.

### Blocking vs unrelated issues
- If a small, safe, directly related issue blocks the requested task, fix it as part of the task and report it.
- If an unrelated issue does not block the task, do not silently fix it; report it separately.
- Do not introduce architectural refactors merely to make code look cleaner.

## Engineering principles

### Next.js / React
- Follow the existing App Router structure.
- Keep Server Components server-side unless interactivity/browser APIs require a Client Component.
- Use Client Components only where needed.
- Prefer existing project utilities and components before creating duplicates.
- Preserve existing loading/error/empty states.
- Avoid unnecessary client-side fetching and hydration.
- Keep navigation consistent with the existing application.

### TypeScript
- Keep types explicit and meaningful.
- Do not use `any` as a shortcut.
- Reuse existing domain types and validation schemas.
- Fix type errors rather than suppressing them.

### RTL / Persian UI
- All user-facing Persian pages must remain RTL.
- Use the project's Persian typography and visual language.
- Do not introduce English labels when a Persian UI label is expected.
- Avoid browser-default validation messages where the project already has custom validation.
- Preserve responsive behavior on mobile, tablet, and desktop.

### UI / Design
The visual direction is minimal, academic, clean, modern, and appropriate for a girls' high school.

Prefer:
- clear hierarchy
- restrained colors
- good whitespace
- readable Persian typography
- consistent cards, buttons, forms, tables, and navigation
- accessible interaction states

Do not redesign unrelated areas while implementing a functional task.

## Admin architecture
Admin pages should use the established admin layout/sidebar patterns.

- Avoid duplicate sidebars or duplicate `AdminLayout` wrappers.
- Keep "بازگشت به مدیریت" / back-to-management navigation consistent where applicable.
- Reuse shared admin components.
- Keep admin-only data and actions protected server-side; hiding UI controls is not authorization.

## Authentication and authorization
Authentication and authorization are security-sensitive.

- Authentication answers who the user is.
- Authorization answers what the user may do.
- Never rely only on client-side checks for protected operations.
- Validate permissions on the server/API.
- Do not expose secrets, password hashes, OTP hashes, tokens, or other sensitive values to the client.
- Preserve existing security controls such as rate limiting unless the task explicitly requires changing them.
- Do not weaken session validation to make a feature easier.
- Do not log credentials, OTPs, passwords, or sensitive personal data in production paths.
- When changing authentication, inspect existing sessions, rate limits, password/OTP handling, migrations, and legacy data before changing behavior.

### Student authentication
The student portal has its own authentication flow and should remain separate from admin authentication unless an explicitly approved architecture change says otherwise.

Current intended direction:
- First login: national ID as username and initial password.
- Initial password must be hashed; plaintext must never be stored.
- First successful login must force password change.
- Normal login afterward uses national ID + new password.
- OTP is for forgot-password recovery, not normal login.
- Forgot-password flow: national ID → registered phone → OTP → new password.
- Preserve the existing student session mechanism unless a change is necessary and approved.
- Existing student OTP data/migrations must not be casually deleted or reset.
- Legacy student accounts must be considered when changing the authentication schema.

## Database / Prisma
- PostgreSQL is the project database.
- Prisma is the ORM.
- Treat migrations as permanent project history.
- Never delete, reset, squash, or rewrite migrations casually.
- Before creating a migration, inspect the current schema and existing migrations.
- Keep schema changes backward-aware when existing records may exist.
- Never assume development data is disposable unless the user explicitly says so.
- Prefer safe backfills/nullable transitional fields when required by existing production-like data.
- After schema changes, run the appropriate Prisma validation/generation/migration checks.

## Academic years and school data
Academic-year-aware data must not accidentally mix records across years.

When touching students, courses, registrations, grades, assessments, schedules, events, or similar school records:
- inspect the existing academic-year relation/logic;
- preserve the current year's semantics;
- do not duplicate or hard-code school data that belongs in the database.

## Public site
Public pages include areas such as:
- home
- about
- announcements/news
- courses
- educational programs
- educational videos
- gallery
- school information and contact sections

Public content should come from the existing data/settings architecture when that architecture already exists. Avoid introducing hard-coded content where admins are expected to manage it.

## Forms and validation
- Use the project's existing validation approach (including Zod where appropriate).
- Validate on the server for security-sensitive operations.
- Give users clear Persian validation/error messages.
- Avoid default browser messages such as "This field is required" when custom project validation is available.
- Preserve useful submitted values after validation errors where appropriate.

## API / data fetching
- Follow existing Route Handler/API conventions.
- Validate request input before database operations.
- Return appropriate HTTP status codes and safe error messages.
- Do not leak internal exception details to end users.
- Avoid N+1 database queries where practical.
- Reuse existing service/lib functions instead of duplicating business logic in route handlers.

## Performance
For performance-related tasks:
- measure before making broad changes where practical;
- avoid unnecessary client components and JavaScript;
- optimize database queries and selected fields;
- avoid unnecessary re-renders and repeated requests;
- preserve UX while improving performance;
- do not trade away security or correctness for small performance gains.

## Testing and verification
For every substantive change:
- run the narrowest useful checks first;
- run TypeScript/lint/tests relevant to the changed area;
- run `pnpm build` when the task affects application behavior, routing, schema, authentication, or build-time code;
- report failures honestly;
- never claim a test/build passed unless it was actually run.

For authentication/security changes, test:
- successful flow;
- invalid credentials;
- expired/invalid OTP where applicable;
- rate limiting/security controls;
- forced password change;
- session creation/validation/logout;
- inactive users;
- authorization boundaries;
- relevant migration behavior.

## Git / GitHub
Codex may handle Git/GitHub as part of the task.

Preferred workflow:
1. Inspect status and current branch.
2. Make the smallest coherent change.
3. Verify it.
4. Commit with a clear conventional-style message.
5. Push/create/update GitHub artifacts only when appropriate to the task.

Do not force-push, rewrite history, delete branches, reset databases, or perform destructive Git operations unless explicitly requested or clearly authorized by the user.

Do not create a pull request merely for the sake of creating one. If a PR is part of the requested workflow, prepare it with a clear description and verification report.

## Existing project priorities
Known areas that may still evolve include:
- admin UX consistency and sidebar/layout cleanup
- messages with visible message bodies
- gallery and gallery permissions
- about/settings page and its API
- educational programs and weekly timetable/custom sections
- educational videos
- course-card navigation and Persian status labels
- grade labels and grade-based visual rules
- top-student/birthday/absence management
- performance improvements
- deployment/self-hosting preparation

These are context, not permission to expand the scope of a task.

## Reuse and maintainability
The long-term goal is to make the finished platform reusable as a school-platform foundation for future schools.

Do not perform the eventual extraction/template refactor now unless explicitly requested. While working, however:
- avoid unnecessary Khadijeh-specific coupling in new reusable utilities/components;
- keep domain logic clear;
- avoid premature abstractions;
- prefer simple, understandable structures.

## Communication and reporting
At the end of a task, report:
1. What was changed.
2. Files changed/created.
3. Database/schema/migration changes.
4. Tests/checks/build results.
5. Git commit/branch information when applicable.
6. Any known limitations, follow-up items, or decisions that need user approval.

If something could not be verified, say so explicitly.

## Golden rule
**Make the smallest safe change that fully solves the requested problem, verify it, preserve existing behavior outside the scope, and report the result completely.**
