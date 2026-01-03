import { z } from "zod";

import { env } from "../../../lib/env";
import { logger } from "../../../lib/logger";
import { geocodeAddressWithNominatim } from "../../../lib/geocoding/nominatim";
import { GeocodingError } from "../../../lib/geocoding/types";

const querySchema = z.object({
  q: z.string().min(3, "q must be at least 3 characters").max(200),
});

function jsonError(status: number, message: string) {
  return Response.json({ ok: false, error: message }, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ q: url.searchParams.get("q") ?? "" });
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues.map((i) => i.message).join("; "));
  }

  const requestId =
    request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id");

  logger.info(
    { requestId, provider: env.GEOCODER_PROVIDER, q: parsed.data.q },
    "geocode request",
  );

  try {
    if (env.GEOCODER_PROVIDER !== "nominatim") {
      return jsonError(
        500,
        `Unsupported geocoder provider: ${env.GEOCODER_PROVIDER}`,
      );
    }

    const result = await geocodeAddressWithNominatim(parsed.data.q);
    return Response.json({ ok: true, result });
  } catch (error) {
    if (error instanceof GeocodingError && error.code === "NO_RESULTS") {
      return Response.json({ ok: true, result: null });
    }

    logger.error({ err: error, requestId }, "geocode failed");
    return jsonError(502, "Geocoding failed");
  }
}
