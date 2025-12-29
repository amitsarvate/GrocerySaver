# GrocerySaver Project Plan

## Vision
- Help shoppers save money and time by recommending the most cost-efficient set of nearby grocery stores for their weekly list.
- Balance cost vs. trip count/distance; give clear, actionable store-by-store breakdowns.

## Tech Stack (proposed)
- Frontend: Next.js (App Router), TypeScript, React, TailwindCSS, React Query/Server Actions for data fetching, Map component via Mapbox GL JS or Leaflet.
- Backend: Next.js route handlers (Node.js), TypeScript, Prisma ORM.
- Data: PostgreSQL (+ PostGIS for geospatial); Redis for caching recent queries and store lookups.
- Scraping/ingestion: Playwright (headless), Cheerio for lightweight HTML parsing; cron via hosted scheduler (e.g., Vercel cron) or a worker.
- Deployment: Continuous preview/staging URLs on every main branch and PR (e.g., Vercel) so progress is visible live during development.
- Local hosting: Docker + Docker Compose to run app + DB (Postgres/PostGIS) + Redis locally with a single command.
- Geodata: OpenStreetMap/Nominatim or Places API for geocoding + Overpass API for grocery store discovery (top 5 closest); simple haversine distance with optional OSRM/Mapbox Matrix if needed.
- Auth/identity (later): NextAuth/Auth.js or Clerk if accounts are needed.
- Observability: pino/logger, Logflare/Axiom/Sentry for errors.

## Phased Delivery

### Phase 0 — Foundations
- Init monorepo-like Next.js app with shared `tsconfig`, lint/format, testing (Vitest/Playwright component or Cypress E2E).
- Configure env management, secrets, and CI lint/test.

### Phase 1 — Location & Store Discovery
- UX: Prompt for location (typed address + “use browser location”).
- Backend: Geocode address → lat/lng; query Overpass/Places to fetch nearest grocery stores; cap to 5 and store in DB/cache.
- Data model: `Store(id, name, address, lat, lng, source, last_seen_at)`.
- Output: API/route returning normalized stores with distance.

### Phase 2 — Price/Deals Ingestion
- Identify target stores (initial 5–8 chains); map their public weekly ads/HTML structures.
- Build connectors/scrapers per store (Playwright for dynamic pages; Cheerio for static).
- Normalize to `Product(id, name, brand, category, size, unit)` and `PriceEntry(store_id, product_id, price, unit_price, currency, captured_at, source_url)`.
- Schedule refresh (e.g., nightly) with retries/backoff; cache results; respect robots/ToS.
- Add manual/test fixtures to run without live scraping.

### Phase 3 — Matching & Normalization
- Implement text + unit normalization (e.g., “2lb chicken breast” → base units).
- Fuzzy match user-input items to catalog (token sort similarity + brand/category hints).
- Add confidence scoring and “did you mean” UX.

### Phase 4 — Optimization Engine
- Input: user location, selected stores (top 5), grocery list items.
- Compute best basket:
  - v1: pick single store with lowest total cost.
  - v2: allow 2–3 stores; minimize cost with distance penalty (haversine) and trip count.
- Output: per-store item assignments, totals, savings vs. alternative, route order hint.

### Phase 5 — Frontend Experience
- Flows: onboarding (location), store list, grocery list entry (chips/suggestions), results view (store breakdown, total, savings), map with store pins.
- Add “lock store” or “exclude store” toggles; show confidence per item.
- Polished visuals and mobile-first layout; basic accessibility checks.

### Phase 6 — Persistence & Infra Hardening
- Migrate DB schema (Prisma + Postgres/PostGIS).
- Add Redis for hot caches (recent store queries, recent baskets).
- Rate limiting for APIs; input validation with Zod; logging/metrics; error reporting.

### Phase 7 — Beta Readiness
- Seed data for a few regions; fallback mock data when scrapers fail.
- Add opt-in accounts to save frequent lists/locations.
- Observability dashboards; uptime alerts; documentation for scraping connectors.

## Deliverables by Phase
- Phase 0: Repo scaffold, CI, env template.
- Phase 1: Location input + API returning 5 nearest stores; UI list/map.
- Phase 2: Scraper connectors + stored price entries; nightly refresh job.
- Phase 3: Matching service with confidence scores; UX for resolving low-confidence items.
- Phase 4: Optimization API + UX showing per-store plan and totals.
- Phase 5: Polished UI with map, toggles, and summary; mobile ready.
- Phase 6: DB/Redis in place, rate limits, validation, logging.
- Phase 7: Seeded regions, optional auth, dashboards, docs.

## Actionable Breakdown

- Phase 0 (Foundations)
  - Setup: create Next.js app (App Router, TS), add Tailwind, Prettier/ESLint, Vitest config; set up CI (lint/test), env sample (.env.example), pino logger.
  - Code: shared `tsconfig`, base layout + healthcheck route; basic API typing helpers; npm scripts (lint, test, dev, e2e).
  - Deploy: connect repo to Vercel (or similar) for preview/staging on PRs.

- Phase 1 (Location & Store Discovery)
  - Setup: choose geocoder/provider; add client SDK or REST wrapper; add Zod for validation.
  - Code: location form with browser geolocation + manual address; route handler to geocode → lat/lng; Overpass/Places query for nearby grocery stores; persist/store cache; return normalized list (id, name, lat/lng, distance).
  - UI: display top 5 stores list + map pins; loading/error states.

- Phase 2 (Price/Deals Ingestion)
  - Setup: pick first 5–8 store targets; define scrape configs per store (selectors/endpoints); add Playwright and Cheerio.
  - Code: scraper per store with normalization; shared product schema; persist `Product` + `PriceEntry`; retries/backoff; fixtures for offline dev; cron/queue entrypoint for scheduled runs.
  - Ops: respect robots/ToS, user-agent, rate limits; log successes/failures.

- Phase 3 (Matching & Normalization)
  - Setup: choose text-similarity lib (e.g., Fuse.js/token-based), unit conversion helper.
  - Code: normalize item text (units, quantities); fuzzy match to catalog; confidence scoring; “did you mean” suggestions; API that returns matches and scores.
  - UI: inline suggestions for low confidence; allow user to pick alternatives.

- Phase 4 (Optimization Engine)
  - Setup: define cost model (price + distance penalty), max store count.
  - Code: v1 single-store cheapest total; v2 multi-store (2–3) with distance/trip penalty; return per-store item assignments and totals; simple route order hint (distance sort).
  - Tests: fixture-based baskets to verify outputs and regression tests.

- Phase 5 (Frontend Experience)
  - Setup: design tokens (colors, spacing, typography), Tailwind config; map component wiring.
  - Code: flows—location onboarding, grocery list input (chips, typeahead), results view (store breakdown, totals, savings); toggles to lock/exclude stores; confidence badges; mobile-first layout.
  - Polish: accessibility pass (labels, focus, contrast); loading/skeleton states.

- Phase 6 (Persistence & Infra Hardening)
  - Setup: Postgres/PostGIS + Prisma schema migrations; Redis client; rate limiting middleware.
  - Code: cache recent store queries/baskets; input validation on APIs; structured logging, error boundaries.
  - Security: secrets management, minimal scopes, basic rate limits.

- Phase 7 (Beta Readiness)
  - Setup: seed data for chosen regions; mock/fallback mode when scrapers fail.
  - Code: optional auth to save lists/locations; usage metrics; dashboards/alerts.
  - Docs: playbook for scraper connectors, runbooks for incidents.

## Open Questions / Decisions
- Which geocoding/places provider to start with (OpenStreetMap vs. Google vs. Mapbox)?
- Which initial region(s) to target for scraper connectors?
- Do we need user accounts in v1 or keep it session-only?
- Acceptable scrape cadence and ToS considerations per store?
