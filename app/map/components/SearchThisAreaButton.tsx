"use client";

import { Search } from "lucide-react";

interface SearchThisAreaButtonProps {
  /** Show only after the user has panned/zoomed the map. */
  visible: boolean;
  onClick: () => void;
}

/**
 * Floating "Search this area" pill that appears when the user moves the map.
 * Tapping triggers the parent to recompute filtered pins by current bbox.
 */
export function SearchThisAreaButton({
  visible,
  onClick,
}: SearchThisAreaButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Искать в этой области"
      style={{
        position: "absolute",
        top: 130,
        left: "50%",
        transform: visible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(-12px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        zIndex: 22,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        background: "var(--accent-primary)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 999,
        color: "#FFFFFF",
        fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
        fontSize: 13,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,117,255,0.45)",
        transition:
          "opacity 200ms ease, transform 200ms ease",
      }}
    >
      <Search size={14} strokeWidth={2.4} />
      Искать в этой области
    </button>
  );
}

export default SearchThisAreaButton;
