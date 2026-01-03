import { z } from "zod";

import { logger } from "../../../../lib/logger";
import { fetchNearbyStoresFromOverpass } from "../../../../lib/stores/overpass";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

function jsonError(status: number, message: string) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lng: url.searchParams.get("lng"),
  });

  if (!parsed.success) {
    return jsonError(400, parsed.error.issues.map((i) => i.message).join("; "));
  }

  const requestId =
    request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id");

  logger.info({ requestId, ...parsed.data }, "nearby stores request");

  const stores = await fetchNearbyStoresFromOverpass({
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });

  return Response.json({ ok: true, stores });
}
