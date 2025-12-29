# GrocerySaver Milestones & Issue Task List

This file is the source of truth for the work backlog. Each top-level checkbox maps to a GitHub Issue. Subtasks are the “doable steps” you can ask me to complete one-by-one.

## Milestone: Phase 0 — Foundations
- [ ] P0-01 Scaffold Next.js app
  - [ ] Initialize Next.js (App Router, TypeScript)
  - [ ] Enable TypeScript strict mode
  - [ ] Add minimal landing page + global layout shell
  - [ ] Add a simple `/api/health` (or route handler) endpoint
  - Acceptance:
    - `npm run dev` starts and renders the landing page
    - Health endpoint returns 200

- [ ] P0-02 Add Tailwind + base UI tokens
  - [ ] Install/configure TailwindCSS
  - [ ] Define basic design tokens (colors, spacing, typography)
  - [ ] Add 1–2 sample components/pages using tokens
  - Acceptance:
    - Tailwind builds with no warnings
    - Tokens visibly apply on the sample page

- [ ] P0-03 Lint/format/testing baseline
  - [ ] Configure ESLint
  - [ ] Configure Prettier
  - [ ] Add Vitest and 1–2 sample tests
  - [ ] Add npm scripts: `lint`, `format`, `test`
  - Acceptance:
    - `npm run lint` passes
    - `npm test` passes

- [ ] P0-04 Env management + logging
  - [ ] Add `.env.example` with required variables (no secrets)
  - [ ] Add env schema validation (e.g., Zod)
  - [ ] Add structured logger utility (pino-style)
  - Acceptance:
    - App fails fast with clear error on missing required env vars
    - Logger used by at least one route handler

- [ ] P0-05 CI workflow
  - [ ] Add GitHub Actions workflow for lint + test
  - [ ] Ensure workflow runs on push + PR
  - Acceptance:
    - CI is green on main for lint + test

- [ ] P0-06 Preview deploy setup (live during development)
  - [ ] Choose platform (Vercel recommended)
  - [ ] Connect GitHub repo to deployment platform
  - [ ] Confirm preview URLs on PRs + staging/prod (as desired)
  - Acceptance:
    - Every PR creates a preview URL
    - Main branch deploys automatically

## Milestone: Phase 1 — Location & Store Discovery
- [ ] P1-01 Geocoding provider integration
  - [ ] Choose provider (Nominatim/Mapbox/Google)
  - [ ] Add server-side geocode wrapper
  - [ ] Add env vars + validation
  - Acceptance:
    - Address → lat/lng route works with validation + good errors

- [ ] P1-02 Location capture UI
  - [ ] Manual address entry form
  - [ ] Browser geolocation (“Use my location”) option
  - [ ] Display user’s resolved lat/lng (debug-friendly)
  - Acceptance:
    - User can submit address OR use geolocation successfully

- [ ] P1-03 Nearby store lookup API (top 5)
  - [ ] Implement Overpass/Places query for grocery stores near lat/lng
  - [ ] Normalize store fields: name/address/lat/lng/source
  - [ ] Compute distance and sort; return closest 5
  - Acceptance:
    - API returns exactly 0–5 stores with distances (deterministic ordering)

- [ ] P1-04 Store list + map view
  - [ ] Render list of closest stores with distance
  - [ ] Map pins for returned stores (Mapbox/Leaflet)
  - [ ] Loading + error states
  - Acceptance:
    - List and map show identical stores and update on new location

- [ ] P1-05 Store persistence + caching
  - [ ] Add `Store` Prisma model + migration
  - [ ] Upsert stores from lookup results
  - [ ] Cache recent store lookups (Redis or in-memory in dev)
  - Acceptance:
    - DB contains stores with lat/lng + last-seen timestamp
    - Repeat lookup returns faster via cache

## Milestone: Phase 2 — Price/Deals Ingestion
- [ ] P2-01 Select target stores + scrape configs
  - [ ] Pick initial 5–8 chains for your region
  - [ ] Record source URLs and basic extraction plan per store
  - [ ] Document ToS/robots constraints per store
  - Acceptance:
    - `docs/sources.md` (or similar) lists store sources + notes

- [ ] P2-02 Scraper framework (Playwright/Cheerio) + throttling
  - [ ] Add Playwright and Cheerio
  - [ ] Shared fetch utilities (timeouts, retries, backoff, user-agent)
  - [ ] Add “fixture/mock mode” to run without live scraping
  - Acceptance:
    - A single command can run scraping in mock mode successfully

- [ ] P2-03 Product + PriceEntry models
  - [ ] Add Prisma models: `Product`, `PriceEntry`
  - [ ] Add migrations + seed scaffolding
  - Acceptance:
    - DB migration applied successfully
    - Seed inserts sample products/prices

- [ ] P2-04 First store scraper (end-to-end)
  - [ ] Implement scraper for 1 store
  - [ ] Normalize into `Product` + `PriceEntry`
  - [ ] Persist to DB with captured source URL + timestamp
  - Acceptance:
    - Running scraper produces rows in `PriceEntry`

- [ ] P2-05 Scheduler/cron entrypoint
  - [ ] Add scheduled job entrypoint to refresh prices
  - [ ] Add retry/backoff and failure logging
  - Acceptance:
    - Scheduled run updates data and logs results

- [ ] P2-06 Offline fixtures for scrapers
  - [ ] Add recorded fixtures (HTML/JSON) for the first scraper
  - [ ] Ensure tests can use fixtures deterministically
  - Acceptance:
    - Scraper can run with `FIXTURE_MODE=1` and produce same output

## Milestone: Phase 3 — Matching & Normalization
- [ ] P3-01 Item text + unit normalization utilities
  - [ ] Normalize casing, punctuation, pluralization
  - [ ] Parse quantity/unit and convert to canonical units
  - [ ] Add unit tests for normalization
  - Acceptance:
    - Unit tests cover common grocery inputs (e.g., “2lb chicken breast”)

- [ ] P3-02 Fuzzy matching service with confidence scores
  - [ ] Choose matching approach (Fuse.js or token similarity)
  - [ ] Match user items to catalog `Product`
  - [ ] Return top N candidates + confidence score
  - Acceptance:
    - API returns deterministic candidates + scores for fixture inputs

- [ ] P3-03 Suggestion UX (“did you mean”)
  - [ ] Show suggestions for low-confidence matches
  - [ ] Allow user to pick a different match
  - Acceptance:
    - User can resolve a low-confidence item and proceed

## Milestone: Phase 4 — Optimization Engine
- [ ] P4-01 Define cost model (configurable)
  - [ ] Define distance penalty and max store count parameters
  - [ ] Document defaults
  - Acceptance:
    - Parameters adjustable via config/env with validation

- [ ] P4-02 Single-store optimizer (v1)
  - [ ] Compute cheapest total for “one store only”
  - [ ] Produce per-item assignment + totals
  - [ ] Add fixture-based tests
  - Acceptance:
    - Tests verify cheapest store is selected for fixture baskets

- [ ] P4-03 Multi-store optimizer (v2)
  - [ ] Allow up to 2–3 stores
  - [ ] Optimize cost with distance + trip penalties
  - [ ] Add fixture-based tests
  - Acceptance:
    - Tests cover cases where multiple stores wins vs. single store

- [ ] P4-04 Route hint
  - [ ] Provide simple store visit ordering
  - [ ] Deterministic output for same coordinates
  - Acceptance:
    - Tests confirm stable route order for fixtures

## Milestone: Phase 5 — Frontend Experience
- [ ] P5-01 App shell + UI polish baseline
  - [ ] Header/nav + responsive layout
  - [ ] Loading/skeleton patterns
  - Acceptance:
    - App feels cohesive and works well on mobile

- [ ] P5-02 Grocery list entry (chips/typeahead)
  - [ ] Add list CRUD (add/edit/remove)
  - [ ] Typeahead suggestions (from catalog)
  - [ ] Validation errors are user-friendly
  - Acceptance:
    - User can build a list quickly with keyboard-first flow

- [ ] P5-03 Results view (plan + savings)
  - [ ] Per-store breakdown (items + subtotal)
  - [ ] Total cost + savings vs alternatives
  - [ ] Map view integration
  - Acceptance:
    - Results match optimizer output and are easy to act on

- [ ] P5-04 Store controls + confidence badges
  - [ ] Exclude/lock a store toggles
  - [ ] Confidence indicators per item
  - Acceptance:
    - Toggling stores re-runs optimization and updates results

- [ ] P5-05 Accessibility pass
  - [ ] Labels/ARIA for inputs
  - [ ] Keyboard navigation
  - [ ] Contrast/focus states
  - Acceptance:
    - Basic a11y audit checks pass

## Milestone: Phase 6 — Persistence & Infra Hardening
- [ ] P6-01 Redis cache integration
  - [ ] Cache store queries
  - [ ] Cache basket optimization results
  - Acceptance:
    - Cache hits are observable in logs/metrics

- [ ] P6-02 Rate limiting + input validation coverage
  - [ ] Add rate limiting on public endpoints
  - [ ] Ensure Zod schemas cover all API inputs
  - Acceptance:
    - Abuse protection present and invalid inputs return clear 4xx

- [ ] P6-03 Observability baseline
  - [ ] Error reporting (Sentry or similar)
  - [ ] Key metrics (scrape success rate, match confidence distribution)
  - Acceptance:
    - Errors and key metrics are visible in a dashboard

## Milestone: Phase 7 — Beta Readiness
- [ ] P7-01 Seed regions + fallback mode
  - [ ] Seed sample stores/products/prices for a chosen region
  - [ ] Fallback to seeded/mock data if scrapers fail
  - Acceptance:
    - App remains usable even when live scraping is unavailable

- [ ] P7-02 Optional auth (save lists/locations)
  - [ ] Add Auth.js/NextAuth or provider
  - [ ] Save user lists/locations
  - Acceptance:
    - Signed-in user can persist and reload lists/locations

- [ ] P7-03 Dashboards + alerts
  - [ ] Uptime/error alerts
  - [ ] Scraper failure alerts
  - Acceptance:
    - Alerts fire on simulated failures

- [ ] P7-04 Scraper connector playbook
  - [ ] Document adding/updating store scrapers
  - [ ] Add incident runbook for scraper breakage
  - Acceptance:
    - A newcomer can add a new store scraper using docs alone

