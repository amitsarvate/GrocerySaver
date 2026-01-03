import { beforeEach, describe, expect, it, vi } from "vitest";

import { geocodeAddressWithNominatim } from "./nominatim";

describe("geocodeAddressWithNominatim", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses lat/lng from the first result", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          lat: "37.4220",
          lon: "-122.0841",
          display_name: "Test Place",
        },
      ],
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await geocodeAddressWithNominatim(
      "1600 Amphitheatre Parkway",
    );
    expect(result).toEqual({
      lat: 37.422,
      lng: -122.0841,
      displayName: "Test Place",
    });
  });

  it("returns NO_RESULTS when empty list", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(geocodeAddressWithNominatim("nowhere")).rejects.toMatchObject({
      name: "GeocodingError",
      code: "NO_RESULTS",
    });
  });
});
