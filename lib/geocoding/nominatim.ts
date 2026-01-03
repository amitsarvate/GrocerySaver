import { env } from "../env";
import { logger } from "../logger";
import { GeocodingError, type GeocodeResult } from "./types";

type NominatimSearchItem = {
  lat: string;
  lon: string;
  display_name?: string;
};

let lastNominatimRequestAtMs = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleNominatim(): Promise<void> {
  const throttleMs = env.GEOCODER_THROTTLE_MS;
  const now = Date.now();
  const waitMs = Math.max(0, lastNominatimRequestAtMs + throttleMs - now);
  if (waitMs > 0) await sleep(waitMs);
  lastNominatimRequestAtMs = Date.now();
}

export async function geocodeAddressWithNominatim(
  query: string,
): Promise<GeocodeResult> {
  await throttleNominatim();

  const url = new URL("/search", env.NOMINATIM_BASE_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  const response = await fetch(url, {
    headers: {
      "User-Agent": env.GEOCODER_USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.warn(
      { status: response.status, body: body.slice(0, 300) },
      "nominatim upstream error",
    );
    throw new GeocodingError(
      `Nominatim request failed with status ${response.status}`,
      "UPSTREAM_ERROR",
    );
  }

  const json = (await response.json()) as unknown;
  if (!Array.isArray(json)) {
    throw new GeocodingError(
      "Unexpected Nominatim response shape",
      "INVALID_RESPONSE",
    );
  }

  const first = json[0] as NominatimSearchItem | undefined;
  if (!first) throw new GeocodingError("No results", "NO_RESULTS");

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new GeocodingError(
      "Invalid coordinates in Nominatim response",
      "INVALID_RESPONSE",
    );
  }

  return {
    lat,
    lng,
    displayName: first.display_name,
  };
}
