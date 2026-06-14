"use client";

import {
  Bed,
  BedDouble,
  Home,
  Building,
  Building2,
  Crown,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ICardFilters } from "@/app/types";

// UI-level category keys for new-building rooms filter.
// Each tile maps to a (rooms_min / rooms_max) range on ICardFilters.
export type CategoryUIKey =
  | "studio"
  | "one_room"
  | "two_rooms"
  | "three_rooms"
  | "four_plus"
  | "penthouse";

interface RoomsFilter {
  rooms_min?: number;
  rooms_max?: number;
}

interface CategoryDef {
  key: CategoryUIKey;
  label: string;
  subtitle: string;
  filters: RoomsFilter;
  Icon: typeof Building2;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "studio",
    label: "Студии",
    subtitle: "Компактно",
    filters: { rooms_max: 0 },
    Icon: Bed,
  },
  {
    key: "one_room",
    label: "1-комнатные",
    subtitle: "Старт жизни",
    filters: { rooms_min: 1, rooms_max: 1 },
    Icon: BedDouble,
  },
  {
    key: "two_rooms",
    label: "2-комнатные",
    subtitle: "Для семьи",
    filters: { rooms_min: 2, rooms_max: 2 },
    Icon: Home,
  },
  {
    key: "three_rooms",
    label: "3-комнатные",
    subtitle: "Просторно",
    filters: { rooms_min: 3, rooms_max: 3 },
    Icon: Building,
  },
  {
    key: "four_plus",
    label: "4+ комнат",
    subtitle: "Для большой семьи",
    filters: { rooms_min: 4 },
    Icon: Building2,
  },
  {
    key: "penthouse",
    label: "Пентхаусы",
    subtitle: "Премиум",
    filters: { rooms_min: 5 },
    Icon: Crown,
  },
];

interface CategoryGridProps {
  currentFilters: ICardFilters;
  onFiltersChange: (filters: Partial<ICardFilters>) => void;
}

interface TileProps {
  def: CategoryDef;
  active: boolean;
  onClick: () => void;
}

function matchesDef(def: CategoryDef, f: ICardFilters): boolean {
  const { rooms_min: dMin, rooms_max: dMax } = def.filters;
  const fMin = f.rooms_min;
  const fMax = f.rooms_max;
  return dMin === fMin && dMax === fMax;
}

function CategoryTile({ def, active, onClick }: TileProps) {
  const { Icon, label, subtitle } = def;

  return (
    <button
      type="button"
      onClick={onClick}
      className="category-tile press-scale-card"
      data-active={active ? "true" : "false"}
      aria-pressed={active}
      style={{
        // aspect ratio handled via utility class via style fallback
        aspectRatio: "1.45 / 1",
        padding: 20,
        borderRadius: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        cursor: "pointer",
        background: active
          ? "var(--home-accent-soft)"
          : "var(--home-surface)",
        border: active
          ? "1.5px solid var(--home-accent)"
          : "1px solid var(--home-border)",
        color: "var(--home-text-primary)",
        transition:
          "background 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease",
        position: "relative",
      }}
    >
      {/* Icon container */}
      <span
        aria-hidden
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: active ? "var(--home-accent)" : "var(--home-surface-elevated)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 180ms ease, color 180ms ease",
        }}
      >
        <Icon
          size={22}
          strokeWidth={2}
          style={{
            color: active ? "#FFFFFF" : "var(--home-accent)",
            transition: "color 180ms ease",
          }}
        />
      </span>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 17,
            lineHeight: 1.2,
            color: "var(--home-text-primary)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 13,
            color: "var(--home-text-secondary)",
          }}
        >
          {subtitle}
          <ArrowUpRight
            size={14}
            style={{
              color: active
                ? "var(--home-accent)"
                : "var(--home-text-tertiary)",
              flexShrink: 0,
            }}
          />
        </span>
      </div>
    </button>
  );
}

export function CategoryGrid({
  currentFilters,
  onFiltersChange,
}: CategoryGridProps) {
  // Derive active key from current rooms_min/rooms_max values
  const deriveActiveKey = useCallback(
    (f: ICardFilters): CategoryUIKey | undefined => {
      for (const def of CATEGORIES) {
        if (matchesDef(def, f)) return def.key;
      }
      return undefined;
    },
    []
  );

  const [localActiveKey, setLocalActiveKey] = useState<
    CategoryUIKey | undefined
  >(() => deriveActiveKey(currentFilters));

  // Keep local state in sync with externally-applied filter change (URL etc.)
  useEffect(() => {
    setLocalActiveKey(deriveActiveKey(currentFilters));
  }, [currentFilters, deriveActiveKey]);

  const handleTileClick = useCallback(
    (def: CategoryDef) => {
      // Deselect if clicking already-active tile — clear rooms filter
      if (localActiveKey === def.key) {
        setLocalActiveKey(undefined);
        onFiltersChange({ rooms_min: undefined, rooms_max: undefined });
        return;
      }
      setLocalActiveKey(def.key);
      onFiltersChange({
        rooms_min: def.filters.rooms_min,
        rooms_max: def.filters.rooms_max,
      });
    },
    [localActiveKey, onFiltersChange]
  );

  const activeKey = localActiveKey;

  return (
    <section className="category-grid-section" style={{ marginTop: 8 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: "var(--home-text-primary)",
          }}
        >
          Категории
        </h2>
        <a
          href="#catalog"
          className="category-all-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--home-accent)",
            textDecoration: "none",
            transition: "opacity 160ms ease",
          }}
        >
          Все
          <ArrowRight size={14} />
        </a>
      </header>

      <div className="category-grid">
        {CATEGORIES.map((c) => (
          <CategoryTile
            key={c.key}
            def={c}
            active={activeKey === c.key}
            onClick={() => handleTileClick(c)}
          />
        ))}
      </div>

      <style jsx>{`
        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1023px) {
          .category-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 599px) {
          .category-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
        .category-all-link:hover {
          opacity: 0.8;
        }
      `}</style>

      <style jsx global>{`
        .category-tile:hover[data-active="false"] {
          background: var(--home-surface-elevated) !important;
          border-color: rgba(0, 117, 255, 0.4) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}

export default CategoryGrid;
