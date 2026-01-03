"use client";

import { useMemo, useState } from "react";

import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { LeafletMap } from "./LeafletMap";

import type { NearbyStore } from "../../lib/stores/types";

type LocationResult =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "error"; message: string }
  | {
      kind: "success";
      source: "geocode" | "geolocation";
      lat: number;
      lng: number;
      displayName?: string;
    };

function formatCoord(value: number): string {
  return value.toFixed(6);
}

export default function LocationPage() {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState<LocationResult>({ kind: "idle" });
  const [stores, setStores] = useState<{
    status: "idle" | "loading" | "error" | "success";
    message?: string;
    items: NearbyStore[];
  }>({ status: "idle", items: [] });

  const resolved = useMemo(() => {
    if (result.kind !== "success") return null;
    return {
      lat: formatCoord(result.lat),
      lng: formatCoord(result.lng),
      displayName: result.displayName,
      source: result.source,
    };
  }, [result]);

  const resolvedRaw = useMemo(() => {
    if (result.kind !== "success") return null;
    return { lat: result.lat, lng: result.lng };
  }, [result]);

  async function loadNearbyStores(lat: number, lng: number) {
    setStores({
      status: "loading",
      message: "Loading nearby stores…",
      items: [],
    });

    try {
      const url = `/api/stores/nearby?lat=${encodeURIComponent(
        lat,
      )}&lng=${encodeURIComponent(lng)}`;
      const response = await fetch(url);
      const json = (await response.json()) as
        | { ok: true; stores: NearbyStore[] }
        | { ok: false; error: string };

      if (!response.ok || json.ok === false) {
        const message = "error" in json ? json.error : "Store lookup failed";
        setStores({ status: "error", message, items: [] });
        return;
      }

      setStores({ status: "success", items: json.stores });
    } catch (error) {
      setStores({
        status: "error",
        message: error instanceof Error ? error.message : "Store lookup failed",
        items: [],
      });
    }
  }

  function formatDistance(distanceMeters: number): string {
    if (!Number.isFinite(distanceMeters)) return "-";
    if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  }

  async function handleAddressSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ kind: "loading", message: "Geocoding address…" });
    setStores({ status: "idle", items: [] });

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(address)}`,
      );
      const json = (await response.json()) as
        | { ok: true; result: null }
        | {
            ok: true;
            result: { lat: number; lng: number; displayName?: string };
          }
        | { ok: false; error: string };

      if (!response.ok || json.ok === false) {
        const message = "error" in json ? json.error : "Geocoding failed";
        setResult({ kind: "error", message });
        return;
      }

      if (json.result === null) {
        setResult({ kind: "error", message: "No results found." });
        return;
      }

      setResult({
        kind: "success",
        source: "geocode",
        lat: json.result.lat,
        lng: json.result.lng,
        displayName: json.result.displayName,
      });
      await loadNearbyStores(json.result.lat, json.result.lng);
    } catch (error) {
      setResult({
        kind: "error",
        message: error instanceof Error ? error.message : "Geocoding failed",
      });
    }
  }

  async function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setResult({ kind: "error", message: "Geolocation is not supported." });
      return;
    }

    setResult({ kind: "loading", message: "Requesting browser location…" });
    setStores({ status: "idle", items: [] });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setResult({
          kind: "success",
          source: "geolocation",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        void loadNearbyStores(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setResult({
          kind: "error",
          message:
            err.message || "Could not get location. Check browser permissions.",
        });
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 30_000 },
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Choose your location
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter an address or use your browser location. We’ll use this to find
        nearby stores.
      </p>

      <div className="mt-8 grid gap-4">
        <Card>
          <form onSubmit={handleAddressSubmit} className="grid gap-3">
            <label className="text-sm font-medium text-foreground" htmlFor="q">
              Address
            </label>
            <input
              id="q"
              name="q"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 1600 Pennsylvania Ave NW, Washington, DC"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={result.kind === "loading"}>
                Geocode address
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleUseMyLocation}
                disabled={result.kind === "loading"}
              >
                Use my location
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="text-sm font-medium text-foreground">Resolved</div>

          {result.kind === "idle" ? (
            <div className="mt-2 text-sm text-muted">
              No location selected yet.
            </div>
          ) : null}

          {result.kind === "loading" ? (
            <div className="mt-2 text-sm text-muted">{result.message}</div>
          ) : null}

          {result.kind === "error" ? (
            <div className="mt-2 text-sm text-red-600">{result.message}</div>
          ) : null}

          {resolved ? (
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Source</span>
                <span className="font-mono text-foreground">
                  {resolved.source}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Latitude</span>
                <span className="font-mono text-foreground">
                  {resolved.lat}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Longitude</span>
                <span className="font-mono text-foreground">
                  {resolved.lng}
                </span>
              </div>
              {resolved.displayName ? (
                <div className="mt-1 text-xs text-muted">
                  {resolved.displayName}
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card>
          <div className="text-sm font-medium text-foreground">
            Nearby stores
          </div>

          {stores.status === "idle" ? (
            <div className="mt-2 text-sm text-muted">
              Select a location to see nearby stores.
            </div>
          ) : null}

          {stores.status === "loading" ? (
            <div className="mt-2 text-sm text-muted">{stores.message}</div>
          ) : null}

          {stores.status === "error" ? (
            <div className="mt-2 text-sm text-red-600">{stores.message}</div>
          ) : null}

          {stores.status === "success" ? (
            <div className="mt-3 grid gap-3">
              {resolvedRaw ? (
                <LeafletMap origin={resolvedRaw} stores={stores.items} />
              ) : null}

              {stores.items.length === 0 ? (
                <div className="text-sm text-muted">
                  No stores found near this location.
                </div>
              ) : (
                <ul className="grid gap-2">
                  {stores.items.map((store) => (
                    <li
                      key={store.id}
                      className="rounded-md border border-border bg-background p-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {store.name}
                          </div>
                          {store.address ? (
                            <div className="mt-1 text-xs text-muted">
                              {store.address}
                            </div>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-right text-xs text-muted">
                          {formatDistance(store.distanceMeters)}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted">
                        <span className="font-mono">
                          {formatCoord(store.lat)}, {formatCoord(store.lng)}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="font-mono">{store.source}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
