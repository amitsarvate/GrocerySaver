import { env } from "../env";
import { logger } from "../logger";
import { haversineDistanceMeters } from "../geo/distance";
import type { NearbyStore } from "./types";

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string | undefined>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

let lastOverpassRequestAtMs = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleOverpass(): Promise<void> {
  const throttleMs = env.OVERPASS_THROTTLE_MS;
  const now = Date.now();
  const waitMs = Math.max(0, lastOverpassRequestAtMs + throttleMs - now);
  if (waitMs > 0) await sleep(waitMs);
  lastOverpassRequestAtMs = Date.now();
}

function formatOsmAddress(
  tags: Record<string, string | undefined> | undefined,
) {
  if (!tags) return undefined;

  const houseNumber = tags["addr:housenumber"];
  const road = tags["addr:street"];
  const city = tags["addr:city"];
  const state = tags["addr:state"];
  const postcode = tags["addr:postcode"];

  const line1 = [houseNumber, road].filter(Boolean).join(" ").trim();
  const line2 = [city, state, postcode].filter(Boolean).join(", ").trim();
  const full = [line1, line2].filter(Boolean).join(", ").trim();

  return full.length > 0 ? full : undefined;
}

export function normalizeOverpassElementsToStores(
  origin: { lat: number; lng: number },
  elements: OverpassElement[],
): NearbyStore[] {
  const stores: NearbyStore[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (typeof lat !== "number" || typeof lng !== "number") continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

    const address = formatOsmAddress(tags);
    const distanceMeters = haversineDistanceMeters(origin, { lat, lng });

    stores.push({
      id: `osm:${el.type}:${el.id}`,
      name,
      address,
      lat,
      lng,
      source: "overpass",
      distanceMeters,
    });
  }

  stores.sort((a, b) => {
    if (a.distanceMeters !== b.distanceMeters)
      return a.distanceMeters - b.distanceMeters;
    const nameCmp = a.name.localeCompare(b.name);
    if (nameCmp !== 0) return nameCmp;
    return a.id.localeCompare(b.id);
  });

  return stores;
}

export async function fetchNearbyStoresFromOverpass(params: {
  lat: number;
  lng: number;
  radiusMeters?: number;
  limit?: number;
}): Promise<NearbyStore[]> {
  const radiusMeters = params.radiusMeters ?? 2500;
  const limit = params.limit ?? 5;

  const query = `
[out:json][timeout:25];
(
  node["shop"="supermarket"](around:${radiusMeters},${params.lat},${params.lng});
  node["shop"="convenience"](around:${radiusMeters},${params.lat},${params.lng});
  node["shop"="greengrocer"](around:${radiusMeters},${params.lat},${params.lng});
  node["amenity"="marketplace"](around:${radiusMeters},${params.lat},${params.lng});
);
out body;
`;

  await throttleOverpass();

  const response = await fetch(env.OVERPASS_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
      "User-Agent": env.GEOCODER_USER_AGENT,
    },
    body: new URLSearchParams({ data: query }).toString(),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    logger.warn(
      { status: response.status, body: body.slice(0, 300) },
      "overpass upstream error",
    );
    return [];
  }

  const json = (await response.json()) as OverpassResponse;
  const elements = Array.isArray(json?.elements) ? json.elements : [];
  const stores = normalizeOverpassElementsToStores(
    { lat: params.lat, lng: params.lng },
    elements,
  );

  return stores.slice(0, limit);
}
