"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * OpenStreetMap location preview.
 *
 * Yandex Maps (api-maps.yandex.ru) is unreachable from the target network
 * (ERR_CONNECTION_CLOSED), so the embedded map never rendered. This is the
 * replacement: MapLibre GL on Carto raster tiles — no API key required.
 *
 * Tiles use the same Carto "dark_all" basemap (4 subdomains, ToS allows
 * production/commercial use) as app/map/components/MapCanvas.tsx — NOT
 * tile.openstreetmap.org, whose usage policy forbids production apps.
 * Dark variant matches the dark detail-card theme.
 *
 * The parent supplies the height; this component fills it 100%.
 */

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export function OsmMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    // SSR-safe + double-init guard.
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: [longitude, latitude],
      zoom: 15,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // maplibre Marker.color accepts only a hex string (no CSS vars);
    // #0075FF === var(--accent-primary).
    new maplibregl.Marker({ color: "#0075FF" })
      .setLngLat([longitude, latitude])
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Coordinates for a single card don't change after mount; if they ever
    // did, the dynamic import + key would remount this anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Карта расположения объекта"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default OsmMap;
