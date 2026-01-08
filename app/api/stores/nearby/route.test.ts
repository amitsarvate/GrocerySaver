import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/stores/overpass", () => ({
  fetchNearbyStoresFromOverpass: vi.fn(),
}));

vi.mock("../../../../lib/cache/nearbyStoresCache", () => ({
  buildNearbyStoresCacheKey: vi.fn((lat: number, lng: number) => {
    return `nearbyStores:${lat}:${lng}`;
  }),
  getCachedNearbyStores: vi.fn(),
  setCachedNearbyStores: vi.fn(),
}));

vi.mock("../../../../lib/prisma", () => ({
  prisma: {
    store: {
      upsert: vi.fn(),
    },
  },
}));

import { fetchNearbyStoresFromOverpass } from "../../../../lib/stores/overpass";
import {
  getCachedNearbyStores,
  setCachedNearbyStores,
} from "../../../../lib/cache/nearbyStoresCache";
import { prisma } from "../../../../lib/prisma";
import { GET } from "./route";

describe("GET /api/stores/nearby", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates lat/lng params", async () => {
    const request = new Request(
      "http://localhost/api/stores/nearby?lat=999&lng=0",
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns nearby stores on success", async () => {
    vi.mocked(getCachedNearbyStores).mockResolvedValueOnce(null);
    vi.mocked(fetchNearbyStoresFromOverpass).mockResolvedValueOnce([
      {
        id: "store-1",
        name: "Test Market",
        address: "123 Main St",
        lat: 47.62,
        lng: -122.32,
        distanceMeters: 120,
        source: "overpass",
      },
    ]);

    const request = new Request(
      "http://localhost/api/stores/nearby?lat=47.61&lng=-122.33",
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.stores).toHaveLength(1);
    expect(json.stores[0].name).toBe("Test Market");
    expect(setCachedNearbyStores).toHaveBeenCalledTimes(1);
    expect(prisma.store.upsert).toHaveBeenCalledTimes(1);
  });

  it("returns cached stores without fetching", async () => {
    vi.mocked(getCachedNearbyStores).mockResolvedValueOnce([
      {
        id: "store-2",
        name: "Cached Market",
        lat: 47.63,
        lng: -122.31,
        distanceMeters: 200,
        source: "overpass",
      },
    ]);

    const request = new Request(
      "http://localhost/api/stores/nearby?lat=47.61&lng=-122.33",
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.stores[0].name).toBe("Cached Market");
    expect(fetchNearbyStoresFromOverpass).not.toHaveBeenCalled();
    expect(prisma.store.upsert).not.toHaveBeenCalled();
  });
});
