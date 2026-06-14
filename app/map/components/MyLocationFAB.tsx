"use client";

import { useState } from "react";
import { Crosshair, Loader2 } from "lucide-react";

interface MyLocationFABProps {
  onLocate: (lng: number, lat: number) => void;
  onError: (message: string) => void;
  /** When the nearby-strip is visible we lift the FAB above it (~116px).
   *  When it's hidden we drop closer to the screen edge (~16px). */
  liftedAboveStrip?: boolean;
}

/**
 * Floating round button that asks the browser for current location and
 * forwards it to the parent for `flyTo`. Handles permission denial and
 * timeout cases by surfacing them to the parent (which shows a toast).
 */
export function MyLocationFAB({
  onLocate,
  onError,
  liftedAboveStrip = false,
}: MyLocationFABProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = () => {
    if (busy) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      onError("Геолокация недоступна в этом браузере");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        onLocate(pos.coords.longitude, pos.coords.latitude);
      },
      (err) => {
        setBusy(false);
        const msg =
          err.code === err.PERMISSION_DENIED
            ? "Разрешите доступ к геолокации в настройках браузера"
            : err.code === err.TIMEOUT
              ? "Не удалось определить местоположение — попробуйте ещё раз"
              : "Не удалось определить местоположение";
        onError(msg);
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 60_000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label="Показать моё местоположение"
      style={{
        position: "absolute",
        right: 16,
        // Default: above the strip (strip ≈ 92px). When a card-preview is
        // open, the strip lifts to ~220px+92px → FAB rises with it.
        bottom: liftedAboveStrip
          ? "calc(env(safe-area-inset-bottom, 0px) + 320px)"
          : "calc(env(safe-area-inset-bottom, 0px) + 100px)",
        zIndex: 22,
        width: 48,
        height: 48,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(7,7,7,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--border-glass)",
        borderRadius: 999,
        color: "var(--text-primary)",
        cursor: busy ? "wait" : "pointer",
        boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
        transition:
          "bottom 240ms ease, background 160ms ease, transform 160ms ease",
      }}
    >
      {busy ? (
        <Loader2 size={20} strokeWidth={2.2} className="map-fab-spin" />
      ) : (
        <Crosshair size={20} strokeWidth={2.2} />
      )}
      <style jsx>{`
        :global(.map-fab-spin) {
          animation: mapFabSpin 1s linear infinite;
        }
        @keyframes mapFabSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}

export default MyLocationFAB;
