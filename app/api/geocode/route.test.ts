import { describe, expect, it, vi } from "vitest";

import { GeocodingError } from "../../../lib/geocoding/types";

vi.mock("../../../lib/geocoding/nominatim", () => ({
  geocodeAddressWithNominatim: vi.fn(),
}));

import { geocodeAddressWithNominatim } from "../../../lib/geocoding/nominatim";
import { GET } from "./route";

describe("GET /api/geocode", () => {
  it("validates the query string", async () => {
    const request = new Request("http://localhost/api/geocode?q=ab");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.ok).toBe(false);
  });

  it("returns a geocode result on success", async () => {
    vi.mocked(geocodeAddressWithNominatim).mockResolvedValueOnce({
      lat: 47.61,
      lng: -122.33,
      displayName: "Seattle, WA",
    });

    const request = new Request("http://localhost/api/geocode?q=Seattle");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      result: { lat: 47.61, lng: -122.33, displayName: "Seattle, WA" },
    });
  });

  it("returns null when the provider has no results", async () => {
    vi.mocked(geocodeAddressWithNominatim).mockRejectedValueOnce(
      new GeocodingError("No results", "NO_RESULTS"),
    );

    const request = new Request("http://localhost/api/geocode?q=Nowhere");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, result: null });
  });
});
