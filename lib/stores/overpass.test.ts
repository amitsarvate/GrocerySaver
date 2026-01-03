import { describe, expect, it } from "vitest";

import { normalizeOverpassElementsToStores } from "./overpass";

describe("normalizeOverpassElementsToStores", () => {
  it("normalizes and sorts deterministically", () => {
    const stores = normalizeOverpassElementsToStores({ lat: 0, lng: 0 }, [
      {
        type: "node",
        id: 2,
        lat: 0.002,
        lon: 0,
        tags: { name: "B Store" },
      },
      {
        type: "node",
        id: 1,
        lat: 0.001,
        lon: 0,
        tags: {
          name: "A Store",
          "addr:housenumber": "123",
          "addr:street": "Main St",
          "addr:city": "Town",
          "addr:state": "CA",
          "addr:postcode": "12345",
        },
      },
    ]);

    expect(stores[0]).toMatchObject({
      id: "osm:node:1",
      name: "A Store",
      address: "123 Main St, Town, CA, 12345",
    });
    expect(stores[1]).toMatchObject({ id: "osm:node:2", name: "B Store" });
    expect(stores[0].distanceMeters).toBeLessThan(stores[1].distanceMeters);
  });
});
