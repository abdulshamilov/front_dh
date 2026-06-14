"use client";

import { useRouter } from "next/navigation";
import { List, MapPin } from "lucide-react";
import { useCallback } from "react";

type ViewMode = "list" | "map";

interface ViewToggleProps {
  active?: ViewMode;
}

export function ViewToggle({ active = "list" }: ViewToggleProps) {
  const router = useRouter();

  const handleList = useCallback(() => {
    // Already on list — no-op
  }, []);

  const handleMap = useCallback(() => {
    router.push("/map");
  }, [router]);

  const isList = active === "list";

  return (
    <div
      className="view-toggle"
      role="tablist"
      aria-label="Режим просмотра"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: 4,
        background: "var(--home-surface)",
        border: "1px solid var(--home-border)",
        borderRadius: 999,
      }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={isList}
        onClick={handleList}
        className="view-toggle-btn press-scale-sm"
        data-active={isList ? "true" : "false"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          border: "none",
          borderRadius: 999,
          background: isList ? "var(--home-accent)" : "transparent",
          color: isList ? "#FFFFFF" : "var(--home-text-secondary)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          cursor: isList ? "default" : "pointer",
          whiteSpace: "nowrap",
          transition:
            "background 160ms ease, color 160ms ease",
        }}
      >
        <List size={14} strokeWidth={2} />
        Список
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!isList}
        onClick={handleMap}
        className="view-toggle-btn press-scale-sm"
        data-active={!isList ? "true" : "false"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          border: "none",
          borderRadius: 999,
          background: !isList ? "var(--home-accent)" : "transparent",
          color: !isList ? "#FFFFFF" : "var(--home-text-secondary)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition:
            "background 160ms ease, color 160ms ease",
        }}
      >
        <MapPin size={14} strokeWidth={2} />
        На карте
      </button>

      <style jsx>{`
        .view-toggle-btn[data-active="false"]:hover {
          color: var(--home-text-primary) !important;
        }
      `}</style>
    </div>
  );
}

export default ViewToggle;
