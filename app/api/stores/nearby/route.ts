import { z } from "zod";

import { logger } from "../../../../lib/logger";
import { prisma } from "../../../../lib/prisma";
import { fetchNearbyStoresFromOverpass } from "../../../../lib/stores/overpass";
import {
  buildNearbyStoresCacheKey,
  getCachedNearbyStores,
  setCachedNearbyStores,
} from "../../../../lib/cache/nearbyStoresCache";

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

  const cacheKey = buildNearbyStoresCacheKey(parsed.data.lat, parsed.data.lng);
  const cached = await getCachedNearbyStores(cacheKey);
  if (cached) {
    return Response.json({ ok: true, stores: cached });
  }

  const stores = await fetchNearbyStoresFromOverpass({
    lat: parsed.data.lat,
    lng: parsed.data.lng,
  });

  await setCachedNearbyStores(cacheKey, stores);

  try {
    const lastSeenAt = new Date();
    await Promise.all(
      stores.map((store) =>
        prisma.store.upsert({
          where: { id: store.id },
          update: {
            name: store.name,
            address: store.address ?? null,
            lat: store.lat,
            lng: store.lng,
            source: store.source,
            lastSeenAt,
          },
          create: {
            id: store.id,
            name: store.name,
            address: store.address ?? null,
            lat: store.lat,
            lng: store.lng,
            source: store.source,
            lastSeenAt,
          },
        }),
      ),
    );
  } catch (error) {
    logger.warn({ err: error, requestId }, "store upsert failed");
  }

  return Response.json({ ok: true, stores });
}
