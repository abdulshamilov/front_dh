"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import maplibregl from "maplibre-gl";
// Required: without MapLibre's CSS, .maplibregl-marker gets position:static
// and every marker collapses to the top-left, invisible. Same import as the
// working app/card/[id]/lib/OsmMap.tsx.
import "maplibre-gl/dist/maplibre-gl.css";
import { ICard } from "@/app/types/models";
import { parsePriceToNumber } from "@/app/shared/utils/price";
import type { LayerKey } from "@/app/map/components/LayersChip";
import { POI_DATA, LAYER_COLORS, LAYER_LABELS } from "@/app/map/data/poi";

const MAKHACHKALA_CENTER: [number, number] = [47.5047, 42.9849];
const DEFAULT_ZOOM = 11;

const DARK_MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "carto-dark": {
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
  layers: [
    {
      id: "carto-dark-tiles",
      type: "raster",
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

type PinState = "default" | "selected" | "compared";

function formatPriceShort(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}М`;
  if (n >= 1000) return `${Math.round(n / 1000)}т`;
  return String(n);
}

/**
 * Builds the small downward "nose" triangle that points from the bottom
 * of a pill onto the exact coordinate. Pure CSS border-trick (no SVG) so
 * it composes cleanly with the pill DOM. Colour matches the pill bg so it
 * reads as one shape. Placed inside a wrapper whose bottom edge (the nose
 * tip) is anchored to the point via Marker({ anchor: "bottom" }).
 */
function buildNose(color: string): HTMLDivElement {
  const nose = document.createElement("div");
  nose.style.cssText = `
    width: 0;
    height: 0;
    margin-top: -1px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 7px solid ${color};
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.45));
  `;
  return nose;
}

/**
 * Builds a price-pill marker — Zillow/Airbnb pattern. The pill shows the
 * price directly on the map so users see "what fits my budget" at a glance,
 * without tapping pins. A CSS nose points the pill onto the coordinate.
 * The returned element is a column wrapper [pill][nose]; the wrapper's
 * BOTTOM edge is the coordinate (Marker uses anchor: "bottom"), so the
 * nose tip lands exactly on the point.
 */
function buildPricePill(
  card: ICard,
  state: PinState,
  dimmed: boolean
): HTMLButtonElement {
  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.setAttribute("aria-label", card.title || `Объект #${card.id}`);

  // Unified marker style: every pin is the brand blue (#0075FF ===
  // var(--accent-primary)), same shape/size as cluster pills. Only the
  // status changes the colour: selected = pink #F1117E + white border
  // (must pop out against the sea of blue); dimmed (already opened) =
  // muted dark-blue + lowered opacity. maplibre marker DOM can't read
  // CSS vars, so hex is intentional (same convention everywhere here).
  let bg = "#0075FF";
  let border = "#FFFFFF";
  if (state === "selected") {
    bg = "#F1117E";
    border = "#FFFFFF";
  }

  // White text reads on blue / pink / dimmed-dark-blue alike — same
  // as the hard-coded white in buildClusterPill.
  const fg = "#FFFFFF";
  const isBig = state === "selected" || state === "compared";
  const price = parsePriceToNumber(card.price);
  const label = price > 0 ? `${formatPriceShort(price)} ₽` : "—";

  // Dimmed === user already opened /card/{id}. Never dim selected
  // (it carries its own accent). Muted dark-blue + lower opacity so
  // the pin recedes without breaking the single visual language.
  const dim = dimmed && state === "default";
  const pillBg = dim ? "#0A3D6B" : bg;

  wrap.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    user-select: none;
    pointer-events: auto;
    opacity: ${dim ? 0.6 : 1};
    transition: opacity 200ms ease;
  `;

  const pill = document.createElement("span");
  pill.style.cssText = `
    padding: ${isBig ? "8px 15px" : "7px 13px"};
    background: ${pillBg};
    color: ${fg};
    border: 1.5px solid ${dim ? "rgba(255,255,255,0.35)" : border};
    border-radius: 999px;
    font-family: var(--font-stetica-bold, system-ui), sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.01em;
    white-space: nowrap;
    box-shadow: 0 4px 14px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4);
    transition: background 200ms ease;
  `;
  pill.textContent = label;

  wrap.appendChild(pill);
  wrap.appendChild(buildNose(pillBg));
  return wrap;
}

/**
 * Builds a cluster marker — used when several objects share the SAME
 * coordinate (whole apartment complexes geocode to one point in the
 * dataset). Without this they stack pixel-on-pixel and look like one pin.
 * Shows the cheapest price + object count ("от 4,2М ₽ · 4 кв.") so the
 * user gets the same budget-at-a-glance signal as single pins; tapping
 * it selects the first object and zooms in (see marker effect).
 *
 * `minPrice` is the smallest valid price in the group (0 when none of
 * the group has a usable price → "от" prefix is dropped). Same column
 * wrapper [pill][nose] as buildPricePill so the nose tip hits the point.
 */
function buildClusterPill(
  count: number,
  minPrice: number,
  selected: boolean
): HTMLButtonElement {
  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.setAttribute("aria-label", `Комплекс — ${count} объектов`);

  // Same unified language as buildPricePill: blue #0075FF
  // (var(--accent-primary)) by default, pink #F1117E when selected.
  // Single pins and cluster pills are now visually identical except
  // for the label text. Hex is intentional (marker DOM, no CSS vars).
  const bg = selected ? "#F1117E" : "#0075FF";

  const label =
    minPrice > 0
      ? `от ${formatPriceShort(minPrice)} ₽ · ${count} кв.`
      : `${count} кв.`;

  wrap.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    user-select: none;
    pointer-events: auto;
    z-index: 2;
  `;

  const pill = document.createElement("span");
  pill.style.cssText = `
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 13px;
    background: ${bg};
    color: #FFFFFF;
    border: 1.5px solid #FFFFFF;
    border-radius: 999px;
    font-family: var(--font-stetica-bold, system-ui), sans-serif;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.01em;
    white-space: nowrap;
    box-shadow: 0 4px 14px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.4);
    transition: background 200ms ease;
  `;
  pill.textContent = label;

  wrap.appendChild(pill);
  wrap.appendChild(buildNose(bg));
  return wrap;
}

const LAYER_ICON_SVGS: Record<LayerKey, string> = {
  sea: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  schools: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 10L12 4 2 10l10 6 10-6Z" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"/><path d="M6 12v4c0 1.5 3 3 6 3s6-1.5 6-3v-4" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"/></svg>`,
  mosques: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l1 2-1 2-1-2 1-2Z" fill="white"/><path d="M5 10c0-3.5 3-6 7-6s7 2.5 7 6v10H5V10Z" stroke="white" stroke-width="2" stroke-linejoin="round"/><path d="M10 20v-4a2 2 0 1 1 4 0v4" stroke="white" stroke-width="2"/></svg>`,
  transport: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="3" width="14" height="14" rx="2" stroke="white" stroke-width="2"/><path d="M5 13h14" stroke="white" stroke-width="2"/><circle cx="8.5" cy="16" r="1" fill="white"/><circle cx="15.5" cy="16" r="1" fill="white"/><path d="M8 17v3M16 17v3" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
};

function buildPoiElement(layer: LayerKey, label: string): HTMLDivElement {
  const wrap = document.createElement("div");
  const colors = LAYER_COLORS[layer];
  const isTransit = layer === "transport";
  wrap.title = label;
  wrap.style.cssText = `
    transform: translate(-50%, -50%);
    width: 28px;
    height: 28px;
    border-radius: ${isTransit ? "8px" : "999px"};
    background: ${colors.bg};
    color: ${colors.fg};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.45), 0 0 0 1.5px rgba(0,0,0,0.3);
    pointer-events: auto;
    cursor: default;
  `;
  wrap.innerHTML = LAYER_ICON_SVGS[layer];
  return wrap;
}

export interface MapCanvasHandle {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  panTo: (lng: number, lat: number) => void;
  getCenter: () => [number, number] | null;
  getZoom: () => number | null;
}

interface MapCanvasProps {
  cards: ICard[];
  selectedCard: ICard | null;
  comparingIds?: Set<number>;
  /** Ids the user already opened (/card/{id}). Single pins in this set
   *  render dimmed; clusters are never dimmed (mixed objects). */
  viewedIds?: Set<number>;
  activeLayers: Set<LayerKey>;
  onPinClick: (card: ICard) => void;
  /** Tap on a cluster pin (>1 object on the same coordinate). Receives the
   *  WHOLE group so the parent can open a list sheet. When omitted, cluster
   *  taps fall back to the legacy behaviour: select the first object. */
  onClusterClick?: (cards: ICard[]) => void;
  onMapClick: () => void;
  onMoveEnd?: () => void;
}

/**
 * MapLibre wrapper. On every cards/selection update we wipe the existing
 * card markers and rebuild — simple and robust at our scale (≤100 cards).
 * Reusing markers via dedup-by-id was prone to flicker because state changes
 * required swapping the inner element anyway. Wipe-and-rebuild is cheaper
 * to reason about and visually identical.
 */
export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  function MapCanvas(
    {
      cards,
      selectedCard,
      comparingIds,
      viewedIds,
      activeLayers,
      onPinClick,
      onClusterClick,
      onMapClick,
      onMoveEnd,
    },
    handleRef
  ) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const cardMarkersRef = useRef<maplibregl.Marker[]>([]);
    const poiMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
    const programmaticMoveRef = useRef(false);

    const onMapClickRef = useRef(onMapClick);
    const onPinClickRef = useRef(onPinClick);
    const onClusterClickRef = useRef(onClusterClick);
    const onMoveEndRef = useRef(onMoveEnd);
    useEffect(() => {
      onMapClickRef.current = onMapClick;
    }, [onMapClick]);
    useEffect(() => {
      onPinClickRef.current = onPinClick;
    }, [onPinClick]);
    useEffect(() => {
      onClusterClickRef.current = onClusterClick;
    }, [onClusterClick]);
    useEffect(() => {
      onMoveEndRef.current = onMoveEnd;
    }, [onMoveEnd]);

    useImperativeHandle(handleRef, () => ({
      flyTo: (lng, lat, zoom = 14) => {
        programmaticMoveRef.current = true;
        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom,
          duration: 600,
          essential: true,
        });
      },
      panTo: (lng, lat) => {
        programmaticMoveRef.current = true;
        mapRef.current?.panTo([lng, lat], { duration: 400 });
      },
      getCenter: () => {
        const c = mapRef.current?.getCenter();
        return c ? [c.lng, c.lat] : null;
      },
      getZoom: () => mapRef.current?.getZoom() ?? null,
    }));

    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: DARK_MAP_STYLE,
        center: MAKHACHKALA_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );
      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right"
      );
      map.on("click", () => onMapClickRef.current());

      // Suppress moveend events for the first second after init — MapLibre
      // fires synthetic moves while it's still figuring out tile bounds and
      // we don't want "Search this area" to appear before the user has done
      // anything.
      let mapReady = false;
      const readyAt = Date.now() + 800;
      map.on("moveend", () => {
        if (!mapReady) {
          if (Date.now() < readyAt) return;
          mapReady = true;
          return;
        }
        if (programmaticMoveRef.current) {
          programmaticMoveRef.current = false;
          return;
        }
        onMoveEndRef.current?.();
      });
      mapRef.current = map;

      return () => {
        cardMarkersRef.current.forEach((m) => m.remove());
        cardMarkersRef.current = [];
        poiMarkersRef.current.forEach((m) => m.remove());
        poiMarkersRef.current.clear();
        map.remove();
        mapRef.current = null;
      };
    }, []);

    // Stable identity for the card set — useMapCards returns a fresh
    // array every render (paginated fetch), which would needlessly
    // rebuild all markers on every parent render. Key by id list so
    // the marker effect only re-runs when the cards actually change.
    const cardsKey = useMemo(() => cards.map((c) => c.id).join(","), [cards]);

    // Card markers — wipe and rebuild on any change. ≤100 markers; trivial.
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const rebuild = () => {
        const m = mapRef.current;
        if (!m) return;
        cardMarkersRef.current.forEach((mk) => mk.remove());
        cardMarkersRef.current = [];

        // Group cards by exact coordinate key. Whole complexes geocode to
        // one point in the dataset (e.g. ids 70/71/72 → 42.92745,47.58320),
        // so without grouping their pins stack pixel-on-pixel and only one
        // is ever tappable. toFixed(5) ≈ 1 m precision — collapses the
        // identical complex coords while keeping genuinely distinct points
        // apart.
        const groups = new Map<string, ICard[]>();
        cards.forEach((card) => {
          if (
            !card.latitude ||
            !card.longitude ||
            card.latitude === 0 ||
            card.longitude === 0 ||
            !Number.isFinite(card.latitude) ||
            !Number.isFinite(card.longitude)
          )
            return;
          const key = `${card.latitude.toFixed(5)},${card.longitude.toFixed(5)}`;
          const bucket = groups.get(key);
          if (bucket) bucket.push(card);
          else groups.set(key, [card]);
        });

        groups.forEach((group) => {
          const first = group[0];
          const lngLat: [number, number] = [
            first.longitude,
            first.latitude,
          ];

          if (group.length === 1) {
            // Single object → existing price-pill (unchanged behaviour).
            const state: PinState =
              selectedCard?.id === first.id
                ? "selected"
                : comparingIds?.has(first.id)
                  ? "compared"
                  : "default";
            const dimmed = viewedIds?.has(first.id) ?? false;
            const el = buildPricePill(first, state, dimmed);
            el.addEventListener("click", (e) => {
              e.stopPropagation();
              onPinClickRef.current(first);
            });
            const marker = new maplibregl.Marker({
              element: el,
              anchor: "bottom",
            })
              .setLngLat(lngLat)
              .addTo(m);
            cardMarkersRef.current.push(marker);
            return;
          }

          // Multiple objects on the same point → one cluster pill. Selected
          // when ANY card in the group is the selected one. Tapping it zooms
          // in (+2) AND opens a list sheet with every apartment of the
          // complex (Cian/Avito pattern) via onClusterClick; falls back to
          // selecting the first object when no handler is supplied.
          const groupSelected =
            selectedCard != null &&
            group.some((c) => c.id === selectedCard.id);
          // Cheapest valid price in the group; 0 when none usable so the
          // pill drops the "от" prefix and shows just the count.
          let minPrice = 0;
          group.forEach((c) => {
            const p = parsePriceToNumber(c.price);
            if (p > 0 && (minPrice === 0 || p < minPrice)) minPrice = p;
          });
          const el = buildClusterPill(group.length, minPrice, groupSelected);
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            const cur = mapRef.current;
            if (cur) {
              programmaticMoveRef.current = true;
              cur.flyTo({
                center: lngLat,
                zoom: Math.min(cur.getZoom() + 2, 18),
                duration: 500,
                essential: true,
              });
            }
            // List sheet with the whole complex when a handler exists;
            // otherwise legacy fallback (select the first object).
            if (onClusterClickRef.current) {
              onClusterClickRef.current(group);
            } else {
              onPinClickRef.current(first);
            }
          });
          const marker = new maplibregl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat(lngLat)
            .addTo(m);
          cardMarkersRef.current.push(marker);
        });
      };

      // Robustness guard: if the style isn't ready yet, markers added now
      // can be dropped. Defer to the load/style.load event (same pattern as
      // OsmMap's mount-time guard) so pins appear regardless of timing.
      if (!map.isStyleLoaded()) {
        // style.load and load can both fire on first mount; the flag
        // keeps rebuild() running exactly once.
        let done = false;
        const onReady = () => {
          if (done) return;
          done = true;
          rebuild();
        };
        map.once("style.load", onReady);
        map.once("load", onReady);
        return () => {
          map.off("style.load", onReady);
          map.off("load", onReady);
        };
      }

      rebuild();
      // cardsKey is the stable derived identity of `cards`; depending
      // on it instead of the array ref avoids redundant marker rebuilds.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardsKey, selectedCard, comparingIds, viewedIds]);

    // POI markers — diff so toggling one layer doesn't churn others.
    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const desired = new Set<string>();
      activeLayers.forEach((layer) => {
        POI_DATA[layer].forEach((p) => desired.add(p.id));
      });

      poiMarkersRef.current.forEach((m, id) => {
        if (!desired.has(id)) {
          m.remove();
          poiMarkersRef.current.delete(id);
        }
      });

      activeLayers.forEach((layer) => {
        POI_DATA[layer].forEach((p) => {
          if (poiMarkersRef.current.has(p.id)) return;
          const el = buildPoiElement(layer, p.label);
          el.addEventListener("click", (e) => e.stopPropagation());
          const m = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat(p.lngLat)
            .addTo(map);
          poiMarkersRef.current.set(p.id, m);
        });
      });
    }, [activeLayers]);

    // Fly to selected card
    useEffect(() => {
      if (!selectedCard || !mapRef.current) return;
      const { latitude: lat, longitude: lng } = selectedCard;
      // Guard invalid coords — otherwise flyTo lands in the ocean at 0,0
      // (or NaN). Mirrors the coord validation used for markers.
      if (
        lat == null ||
        lng == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        (lat === 0 && lng === 0)
      ) {
        return;
      }
      programmaticMoveRef.current = true;
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: Math.max(mapRef.current.getZoom(), 13),
        duration: 500,
        essential: true,
      });
    }, [selectedCard]);

    return (
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    );
  }
);

export { LAYER_LABELS };
export default MapCanvas;
