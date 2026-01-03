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
