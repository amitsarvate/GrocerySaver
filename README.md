# GrocerySaver

## Local development

### Run everything in Docker (app + Postgres + Redis)
1. `docker compose up --build`
2. Open `http://localhost:3000`
3. Health check: `http://localhost:3000/api/health`

### Run only DB/Redis in Docker (app on host)
1. `docker compose up -d db redis`
2. `npm install`
3. `npm run dev`

