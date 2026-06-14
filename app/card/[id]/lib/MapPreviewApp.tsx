"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { ICard } from "@/app/types/models";
import { translateCity } from "@/app/card/[id]/lib";

// MapLibre GL is browser-only — load the OSM map client-side, no SSR.
const OsmMap = dynamic(
  () => import("@/app/card/[id]/lib/OsmMap").then((m) => m.OsmMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ width: "100%", height: "100%", background: "var(--surface-elevated)" }}
      />
    ),
  }
);

/**
 * Location block.
 *
 * Many objects have NO coordinates (latitude/longitude null) but DO
 * have an address (e.g. "Махачкала, Луговая 10"). The mobile app
 * shows this block whenever the city/address resolves and opens
 * Yandex Maps by text, so we do the same — the block is shown when
 * there is an address OR valid coordinates (it must not vanish just
 * because coordinates are missing).
 *
 * - Coordinates present  → real interactive OSM (MapLibre GL) map +
 *   "На карте" opens Yandex Maps with a route to the point.
 * - No coordinates       → app-style preview card + "На карте"
 *   opens Yandex Maps search by {address}.
 *
 * The embedded preview engine is OpenStreetMap (OsmMap) because the
 * Yandex JS API is unreachable from some networks. The external deep
 * link still goes to Yandex Maps — it opens in the user's own browser
 * (where Yandex usually works) and matches the mobile app.
 */
export function MapPreviewApp({ card }: { card: ICard }) {
  const [pressed, setPressed] = useState(false);

  const lat = Number(card.latitude);
  const lng = Number(card.longitude);

  const hasCoords =
    card.latitude != null &&
    card.longitude != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !(lat === 0 && lng === 0);

  const cityName = translateCity(card.city);
  const hasAddress = !!card.address && card.address.trim().length > 0;
  const label = hasAddress ? card.address : cityName;

  // Nothing to show at all — no address and no coordinates.
  if (!hasAddress && !hasCoords && !cityName) return null;

  // Yandex Maps deep link. The embedded preview engine is OSM (Yandex
  // JS API is unreachable from some networks), but the external link
  // opens in the user's own browser where Yandex usually works, and
  // matches the mobile app (DetailContentSections.kt uses ?text=).
  // With coordinates → build a route to the point (rtext=~lat,lng).
  // Without → search by address text (mobile-app behaviour).
  const fullMapUrl = hasCoords
    ? `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`
    : `https://yandex.ru/maps/?text=${encodeURIComponent(
        hasAddress ? (card.address as string) : cityName
      )}`;

  const openFullMap = () => {
    window.open(fullMapUrl, "_blank", "noopener,noreferrer");
  };

  const release = () => {
    if (pressed) setPressed(false);
  };

  return (
    <div style={{ padding: "12px 16px" }}>
      <h2
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        Где находится
      </h2>

      <div
        style={{
          marginTop: "12px",
          borderRadius: "16px",
          overflow: "hidden",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
        }}
      >
        {hasCoords ? (
          // Real interactive map — user can pan/zoom to plan a route.
          <div
            style={{
              width: "100%",
              height: "240px",
              backgroundColor: "var(--surface-elevated)",
            }}
          >
            <OsmMap latitude={lat} longitude={lng} />
          </div>
        ) : (
          // No coordinates — app-style preview tile that opens
          // Yandex Maps search by address (a route can be built there).
          <button
            type="button"
            onClick={openFullMap}
            onPointerDown={() => setPressed(true)}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            aria-label="Открыть на Яндекс.Картах"
            style={{
              width: "100%",
              height: "140px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background:
                "linear-gradient(135deg, rgba(0,117,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(0,117,255,0.08) 100%), var(--surface-elevated)",
              transform: pressed ? "scale(0.99)" : "scale(1)",
              transition: "transform 120ms ease-out",
            }}
          >
            <span
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "color-mix(in srgb, var(--accent-primary) 15%, transparent)",
              }}
            >
              <MapPin
                size={24}
                color="var(--accent-primary)"
                aria-hidden="true"
              />
            </span>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-stetica-medium)",
                color: "var(--text-primary)",
                textAlign: "center",
                padding: "0 16px",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-stetica-medium)",
                color: "var(--accent-primary)",
              }}
            >
              Открыть на Яндекс.Картах →
            </span>
          </button>
        )}

        {/* Address row + open-in-full-map action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <span
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "color-mix(in srgb, var(--accent-primary) 15%, transparent)",
            }}
          >
            <MapPin size={20} color="var(--accent-primary)" aria-hidden="true" />
          </span>

          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: "14px",
              fontFamily: "var(--font-stetica-medium)",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>

          <button
            type="button"
            onClick={openFullMap}
            aria-label="Открыть на карте"
            className="press-scale"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background:
                "color-mix(in srgb, var(--accent-primary) 14%, transparent)",
              cursor: "pointer",
              fontSize: "12px",
              fontFamily: "var(--font-stetica-medium)",
              color: "var(--accent-primary)",
            }}
          >
            На карте
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MapPreviewApp;
