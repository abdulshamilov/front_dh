/**
 * Hardcoded points-of-interest for Dagestan (Makhachkala / Kaspiysk / Izberbash).
 *
 * Why hardcoded: there is no POI API on our backend, and OpenStreetMap
 * Overpass queries are slow + noisy for a curated set. These are the
 * landmarks our Dagestani buyers actually care about. Edit the lists
 * to extend.
 */

import type { LayerKey } from "@/app/map/components/LayersChip";

export interface PoiPoint {
  /** Stable id within a layer — used as MapLibre marker key. */
  id: string;
  /** [longitude, latitude] — MapLibre order. */
  lngLat: [number, number];
  label: string;
}

export const POI_DATA: Record<LayerKey, PoiPoint[]> = {
  sea: [
    // Caspian shoreline anchor points — used to draw "near the sea" hint pins.
    { id: "sea-makh-port", lngLat: [47.5089, 42.9633], label: "Махачкала · порт" },
    { id: "sea-makh-beach", lngLat: [47.532, 42.946], label: "Городской пляж" },
    { id: "sea-kaspiysk-1", lngLat: [47.6479, 42.8907], label: "Каспийск · набережная" },
    { id: "sea-izberbash", lngLat: [47.8569, 42.5683], label: "Избербаш · пляж" },
  ],
  schools: [
    { id: "sch-dgu", lngLat: [47.5023, 42.9831], label: "ДГУ" },
    { id: "sch-dgtu", lngLat: [47.5099, 42.9712], label: "ДГТУ" },
    { id: "sch-school1", lngLat: [47.504, 42.985], label: "Школа №1" },
    { id: "sch-school8", lngLat: [47.515, 42.978], label: "Школа №8" },
    { id: "sch-school38", lngLat: [47.498, 42.96], label: "Школа №38" },
    { id: "sch-kaspiysk", lngLat: [47.6411, 42.8945], label: "Школа · Каспийск" },
  ],
  mosques: [
    { id: "msq-juma-makh", lngLat: [47.5036, 42.9764], label: "Центральная Джума-мечеть" },
    { id: "msq-akhmad-mhi", lngLat: [47.515, 42.974], label: "Мечеть им. Ахмад-Хаджи" },
    { id: "msq-kaspiysk", lngLat: [47.638, 42.892], label: "Соборная мечеть · Каспийск" },
    { id: "msq-redutskaya", lngLat: [47.502, 42.991], label: "Редуктская мечеть" },
  ],
  transport: [
    { id: "tr-vokzal", lngLat: [47.4998, 42.974], label: "Ж/д вокзал" },
    { id: "tr-airport", lngLat: [47.6523, 42.8167], label: "Аэропорт Махачкала" },
    { id: "tr-avtovokzal-sev", lngLat: [47.488, 42.998], label: "Северный автовокзал" },
    { id: "tr-avtovokzal-yug", lngLat: [47.518, 42.957], label: "Южный автовокзал" },
  ],
};

export const LAYER_COLORS: Record<LayerKey, { bg: string; fg: string }> = {
  // Apple-Maps-style category colors with white pictograms.
  sea: { bg: "#1976D2", fg: "#FFFFFF" },
  schools: { bg: "#FFC107", fg: "#1A1A1A" },
  mosques: { bg: "#8B6F47", fg: "#FFFFFF" },
  // Transit gets a rounded-rectangle in the marker builder, not a circle.
  transport: { bg: "#0A84FF", fg: "#FFFFFF" },
};

export const LAYER_LABELS: Record<LayerKey, string> = {
  sea: "Море",
  schools: "Школы",
  mosques: "Мечети",
  transport: "Транспорт",
};
