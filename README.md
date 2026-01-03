# GrocerySaver

## Local development

### Run everything in Docker (app + Postgres + Redis)

1. `docker compose up --build`
2. Open `http://localhost:3000`
3. Health check: `http://localhost:3000/api/health`

### Run only DB/Redis in Docker (app on host)

1. `docker compose up -d`
2. `cp .env.example .env.local`
3. `npm install`
4. `npm run dev`

### Tidewave

- Web endpoint (dev only): `http://localhost:3000/tidewave`
- STDIO MCP server: `npm run tidewave:mcp`

## Preview deploys (Vercel)

1. Create a new Vercel project from this GitHub repo and enable Git integration.
2. Set required env vars for Preview + Production (even if you’re not using them yet):
   - `DATABASE_URL`
   - `REDIS_URL`
   - `LOG_LEVEL` (suggested: `info` or `silent`)
3. Confirm:
   - every PR gets a Preview URL
   - `main` deploys automatically
