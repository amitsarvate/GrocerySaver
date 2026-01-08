import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LeafletMap } from "./LeafletMap";

const mapInstance = {
  setView: vi.fn(),
  invalidateSize: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
};

const layerInstance = {
  addTo: vi.fn(() => layerInstance),
  clearLayers: vi.fn(),
};

const markerInstance = {
  addTo: vi.fn(() => markerInstance),
  bindPopup: vi.fn(() => markerInstance),
};

const boundsInstance = {
  pad: vi.fn(() => boundsInstance),
};

vi.mock("leaflet", () => ({
  map: vi.fn(() => mapInstance),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  layerGroup: vi.fn(() => layerInstance),
  divIcon: vi.fn(() => ({})),
  marker: vi.fn(() => markerInstance),
  latLng: vi.fn((lat: number, lng: number) => ({ lat, lng })),
  latLngBounds: vi.fn(() => boundsInstance),
}));

describe("LeafletMap", () => {
  it("initializes the map and renders markers", async () => {
    render(
      <LeafletMap
        origin={{ lat: 47.61, lng: -122.33 }}
        stores={[
          {
            id: "store-1",
            name: "Test Market",
            address: "123 Main St",
            lat: 47.62,
            lng: -122.32,
            distanceMeters: 120,
            source: "overpass",
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("Map")).toBeInTheDocument();

    await waitFor(() => {
      expect(mapInstance.setView).toHaveBeenCalledWith([47.61, -122.33], 13);
      expect(mapInstance.fitBounds).toHaveBeenCalled();
    });
  });
});
