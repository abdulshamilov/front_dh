"use client";

interface ZoomBreadcrumbProps {
  city: string;
  zoom: number | null;
}

/**
 * Tiny glass label "City · z11" floating in a low-priority slot.
 * Helps the user sense their bbox/zoom level — pure orientation aid.
 */
export function ZoomBreadcrumb({ city, zoom }: ZoomBreadcrumbProps) {
  if (zoom === null) return null;
  const z = Math.round(zoom);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        // Top-center under the filter chips, so it doesn't clash with the
        // bottom strip or right-side controls.
        top: 130,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 18,
        padding: "6px 10px",
        background: "rgba(7,7,7,0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border-glass)",
        borderRadius: 999,
        color: "var(--text-tertiary)",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: 11,
        letterSpacing: "0.02em",
        pointerEvents: "none",
      }}
    >
      {city} · z{z}
    </div>
  );
}

export default ZoomBreadcrumb;
