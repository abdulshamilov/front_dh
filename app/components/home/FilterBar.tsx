"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import FiltersPanel from "@/app/components/Filter";
import { ICardFilters } from "@/app/types";

export type SortKey = "new" | "price_asc" | "price_desc" | "rating";

interface FilterBarProps {
  filters: ICardFilters;
  onFiltersChange: (f: ICardFilters) => void;
  sortKey: SortKey;
  onSortChange: (s: SortKey) => void;
}

const SORT_CHIPS: { key: SortKey; label: string }[] = [
  { key: "new", label: "Сначала новые" },
  { key: "price_asc", label: "Цена ↑" },
  { key: "price_desc", label: "Цена ↓" },
];

export function FilterBar({
  filters,
  onFiltersChange,
  sortKey,
  onSortChange,
}: FilterBarProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  // Listen for global "open-filters" event from Header search-bar sliders icon.
  useEffect(() => {
    const handler = () => setModalOpen(true);
    window.addEventListener("open-filters", handler);
    return () => window.removeEventListener("open-filters", handler);
  }, []);

  return (
    <section
      id="catalog"
      style={{ marginTop: 20, marginBottom: 14 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          paddingLeft: 16,
          paddingRight: 16,
          scrollbarWidth: "none",
        }}
      >
        {/* Map — primary action, accent-styled */}
        <button
          type="button"
          onClick={() => router.push("/map")}
          aria-label="Открыть карту"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 16px",
            background: "var(--home-accent)",
            border: "1px solid var(--home-accent)",
            borderRadius: 999,
            color: "#FFFFFF",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "background 160ms ease",
          }}
        >
          <MapPin size={14} strokeWidth={2.2} />
          Карта
        </button>

        {SORT_CHIPS.map((chip) => {
          const active = chip.key === sortKey;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onSortChange(chip.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 40,
                padding: "0 14px",
                background: active
                  ? "var(--home-accent-soft)"
                  : "var(--home-surface)",
                border: active
                  ? "1px solid var(--home-accent)"
                  : "1px solid var(--home-border-strong)",
                borderRadius: 999,
                color: active
                  ? "var(--home-accent)"
                  : "var(--home-text-primary)",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition:
                  "background 160ms ease, border-color 160ms ease, color 160ms ease",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Modal-only FiltersPanel — opened via "open-filters" CustomEvent
          from the Header search bar's sliders icon. */}
      <FiltersPanel
        onApplyFilters={onFiltersChange}
        currentFilters={filters}
        externalOpen={modalOpen}
        onExternalOpenChange={setModalOpen}
        hideDefaultTrigger
      />
    </section>
  );
}

export default FilterBar;
