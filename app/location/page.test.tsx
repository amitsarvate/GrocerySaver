import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import LocationPage from "./page";

vi.mock("./LeafletMap", () => ({
  LeafletMap: () => <div data-testid="leaflet-map" />,
}));

describe("LocationPage", () => {
  it("shows idle state before a location is selected", () => {
    render(<LocationPage />);

    expect(screen.getByText("No location selected yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Select a location to see nearby stores."),
    ).toBeInTheDocument();
  });

  it("geocodes an address and renders nearby stores", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          result: {
            lat: 47.61,
            lng: -122.33,
            displayName: "Seattle, WA",
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          stores: [
            {
              id: "store-1",
              name: "Test Market",
              address: "123 Main St",
              lat: 47.62,
              lng: -122.32,
              distanceMeters: 120,
              source: "overpass",
            },
          ],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    render(<LocationPage />);

    await userEvent.type(
      screen.getByLabelText("Address"),
      "1600 Pennsylvania Ave NW",
    );
    const geocodeButtons = screen.getAllByRole("button", {
      name: "Geocode address",
    });
    await userEvent.click(geocodeButtons[0]);

    await waitFor(() =>
      expect(screen.getByText("Seattle, WA")).toBeInTheDocument(),
    );

    expect(screen.getByText("Test Market")).toBeInTheDocument();
    expect(screen.getByTestId("leaflet-map")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
