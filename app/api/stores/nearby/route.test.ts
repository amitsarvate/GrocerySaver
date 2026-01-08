import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../lib/stores/overpass", () => ({
  fetchNearbyStoresFromOverpass: vi.fn(),
}));

import { fetchNearbyStoresFromOverpass } from "../../../../lib/stores/overpass";
import { GET } from "./route";

describe("GET /api/stores/nearby", () => {
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
  });
});
