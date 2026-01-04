"use client";

import { useEffect, useRef, useState } from "react";

import type { NearbyStore } from "../../lib/stores/types";

type Props = {
  origin: { lat: number; lng: number };
  stores: NearbyStore[];
};

export function LeafletMap({ origin, stores }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled) return;

      const map = L.map(containerRef.current!, {
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const layer = L.layerGroup().addTo(map);
      mapRef.current = map;
      layerRef.current = layer;
      map.setView([origin.lat, origin.lng], 13);
      map.invalidateSize();
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, [origin.lat, origin.lng]);

  useEffect(() => {
    if (!isReady || !mapRef.current || !layerRef.current) return;

    (async () => {
      const L = await import("leaflet");
      mapRef.current!.invalidateSize();
      const layer = layerRef.current!;
      layer.clearLayers();

      const originIcon = L.divIcon({
        className: "",
        html: '<div style="width:12px;height:12px;border-radius:9999px;background:#0f172a;border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const storeIcon = L.divIcon({
        className: "",
        html: '<div style="width:12px;height:12px;border-radius:9999px;background:#22c55e;border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,.35)"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const originMarker = L.marker([origin.lat, origin.lng], {
        icon: originIcon,
        title: "You",
      }).bindPopup("You");
      originMarker.addTo(layer);

      for (const store of stores) {
        L.marker([store.lat, store.lng], { icon: storeIcon, title: store.name })
          .bindPopup(
            `${store.name}${store.address ? `<br/>${store.address}` : ""}`,
          )
          .addTo(layer);
      }

      const points = [
        L.latLng(origin.lat, origin.lng),
        ...stores.map((s) => L.latLng(s.lat, s.lng)),
      ];
      const bounds = L.latLngBounds(points);
      mapRef.current!.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
    })();
  }, [isReady, origin.lat, origin.lng, stores]);

  return (
    <div
      ref={containerRef}
      className="h-72 w-full rounded-lg border border-border"
      aria-label="Map"
    />
  );
}
