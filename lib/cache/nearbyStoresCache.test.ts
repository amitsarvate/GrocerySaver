import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NearbyStore } from "../stores/types";
import {
  buildNearbyStoresCacheKey,
  clearInMemoryNearbyStoresCache,
  getCachedNearbyStores,
  setCachedNearbyStores,
} from "./nearbyStoresCache";

describe("nearbyStoresCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
    clearInMemoryNearbyStoresCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearInMemoryNearbyStoresCache();
  });

  it("builds deterministic cache keys", () => {
    expect(buildNearbyStoresCacheKey(47.612345, -122.334567)).toBe(
      "nearbyStores:47.6123:-122.3346",
    );
  });

  it("stores and expires cached values", async () => {
    const key = "nearbyStores:47.61:-122.33";
    const stores: NearbyStore[] = [
      {
        id: "store-1",
        name: "Test Market",
        lat: 47.62,
        lng: -122.32,
        distanceMeters: 120,
        source: "overpass",
      },
    ];

    await setCachedNearbyStores(key, stores);
    const cached = await getCachedNearbyStores(key);
    expect(cached).toEqual(stores);

    vi.advanceTimersByTime(10 * 60 * 1000 + 1);
    const expired = await getCachedNearbyStores(key);
    expect(expired).toBeNull();
  });
});
