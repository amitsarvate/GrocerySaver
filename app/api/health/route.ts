import { env } from "../../../lib/env";
import { logger } from "../../../lib/logger";

export function GET() {
  logger.info({ route: "/api/health" }, "health check");
  return Response.json({ ok: true, env: env.NODE_ENV ?? "development" });
}
