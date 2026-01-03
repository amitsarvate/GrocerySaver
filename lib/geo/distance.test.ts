import { describe, expect, it } from "vitest";

import { haversineDistanceMeters } from "./distance";

describe("haversineDistanceMeters", () => {
  it("is zero for identical points", () => {
    expect(
      haversineDistanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }),
    ).toBe(0);
  });

  it("returns a reasonable distance", () => {
    // Approx distance between SF and LA (~559km).
    const d = haversineDistanceMeters(
      { lat: 37.7749, lng: -122.4194 },
      { lat: 34.0522, lng: -118.2437 },
    );
    expect(d).toBeGreaterThan(500_000);
    expect(d).toBeLessThan(700_000);
  });
});
