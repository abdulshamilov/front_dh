"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Chip } from "@/app/components/shared/Chip";
import { objectsWord } from "@/app/shared/utils/plural";

export type MapFilterKey = "maxPrice" | "minRooms" | "onlyNew";

export interface MapFilters {
  maxPrice: boolean;
  minRooms: boolean;
  onlyNew: boolean;
}

interface MapTopBarProps {
  count: number;
  isLoading: boolean;
  filters: MapFilters;
  onFilterChange: (key: MapFilterKey) => void;
}

const GLASS_PILL: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 14px",
  background: "rgba(7, 7, 7, 0.78)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid var(--border-glass)",
  borderRadius: 14,
  color: "var(--text-primary)",
  fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
  fontSize: 13,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

/**
 * Floating glass controls over the map: back, count badge, filter chips.
 * Three independent absolute children — no shared container, so each can
 * collapse / wrap independently on narrow screens.
 */
export function MapTopBar({
  count,
  isLoading,
  filters,
  onFilterChange,
}: MapTopBarProps) {
  const countLabel = isLoading
    ? "Загрузка…"
    : `${count} ${objectsWord(count)}`;

  return (
    <>
      <Link
        href="/"
        aria-label="Назад на главную"
        style={{
          ...GLASS_PILL,
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 20,
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
        <span>Назад</span>
      </Link>

      <div
        aria-live="polite"
        style={{
          ...GLASS_PILL,
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 20,
        }}
      >
        {countLabel}
      </div>

      <div
        role="group"
        aria-label="Быстрые фильтры"
        style={{
          position: "absolute",
          top: 72,
          left: 16,
          zIndex: 20,
          display: "flex",
          gap: 8,
          padding: 6,
          background: "rgba(7, 7, 7, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-glass)",
          borderRadius: 999,
          maxWidth: "calc(100vw - 32px)",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Chip
          active={filters.maxPrice}
          onClick={() => onFilterChange("maxPrice")}
          size="sm"
        >
          До 10 млн
        </Chip>
        <Chip
          active={filters.minRooms}
          onClick={() => onFilterChange("minRooms")}
          size="sm"
        >
          2+ комнат
        </Chip>
        <Chip
          active={filters.onlyNew}
          onClick={() => onFilterChange("onlyNew")}
          size="sm"
        >
          Новостройка
        </Chip>
      </div>
    </>
  );
}

export default MapTopBar;
