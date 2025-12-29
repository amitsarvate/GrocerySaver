# AGENTS Guide — GrocerySaver

## Mission
Build a grocery savings web app that recommends the most cost- and distance-efficient set of nearby grocery stores for a user’s weekly list. Frontend + backend live in one Next.js repo. Maintain continuous preview deployments for rapid feedback.

## Always Check
- Read `plan.md` and `ISSUES.md` before work; confirm the current milestone and issue.
- Keep changes minimal and scoped to the active issue; avoid drive-by refactors unless essential.
- Respect scraping ToS/robots; throttle and identify clearly (configurable user agent).
- Default to TypeScript, App Router, route handlers; avoid adding new stacks unless justified.
- Run lint/tests relevant to your change; add small fixtures for scraper/matcher logic.

## Coding Standards
- TypeScript strict; prefer async/await; avoid `any`.
- Validation: Zod on inputs/params; return typed results.
- Logging: pino-style structured logs; include trace/context.
- UI: Tailwind; mobile-first; accessible labels, focus states, and sensible defaults.
- Maps: Mapbox/Leaflet; keep provider keys in env only.
- Data: Prisma with Postgres/PostGIS; Redis for caches; avoid schema drift—use migrations.

## Dev Workflow
- Create small, reviewable PR-sized changes per issue.
- Keep env keys in `.env.local`; update `.env.example` when adding new vars.
- Prefer server-side fetching/Server Actions for data where possible; use React Query when client state needed.
- Tests: unit (Vitest) for utilities/engines; integration/e2e (Playwright/Cypress) for flows; include fixtures for deterministic outputs.
- Observability: instrument error boundaries and API error logs early; surface user-friendly errors on the UI.

## Deployment & Ops
- Maintain preview/staging deploys (e.g., Vercel) on main and PRs.
- Add rate limiting and input validation to public APIs.
- Scrapers: schedule via cron/worker; backoff/retries; capture source URLs; provide mock mode for offline dev.

## When Unsure
- Ask clarifying questions briefly; propose a default if waiting blocks progress.
- If blocked by missing access (e.g., API keys), stub with mock data and document the gap.
