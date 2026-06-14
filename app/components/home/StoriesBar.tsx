"use client";

import { useCallback, useMemo } from "react";
import { ICardFilters } from "@/app/types";

// Story definition type
interface StoryDef {
  key: string;
  emoji: string;
  label: string;
  gradient: string;
  // A partial set of filters applied when clicked
  filters: Partial<ICardFilters>;
  // Optional fields removed from existing filters when applying
  clears?: Array<keyof ICardFilters>;
  // Custom match predicate to show "active" state
  isActive: (f: ICardFilters) => boolean;
}

const STORIES: StoryDef[] = [
  {
    key: "new",
    emoji: "🆕",
    label: "Новое",
    gradient: "linear-gradient(135deg, #0767D7, #4A9EFF)",
    filters: {},
    clears: ["price_max", "city", "house_type", "complex_type", "finishing"],
    isActive: (f) =>
      !f.price_max &&
      !f.city &&
      !f.house_type &&
      !f.complex_type &&
      !f.finishing,
  },
  {
    key: "discount",
    emoji: "🔥",
    label: "Со скидкой",
    gradient: "linear-gradient(135deg, #F1117E, #FF6B9D)",
    filters: {},
    // This story is a marketing shortcut — we simply scroll to listings.
    // Client-side discount filtering can be added later if needed.
    isActive: () => false,
  },
  {
    key: "cheap",
    emoji: "💰",
    label: "До 5 млн",
    gradient: "linear-gradient(135deg, #1EED61, #0AB84C)",
    filters: { price_max: 5000000 },
    isActive: (f) => f.price_max === 5000000,
  },
  {
    key: "under_construction",
    emoji: "🏗",
    label: "Строится",
    gradient: "linear-gradient(135deg, #8B5CF6, #6D38E0)",
    filters: { house_type: "brick_monolith" },
    isActive: (f) => f.house_type === "brick_monolith",
  },
  {
    key: "with_finish",
    emoji: "✨",
    label: "С отделкой",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    filters: { finishing: "with_finish" },
    isActive: (f) => f.finishing === "with_finish",
  },
  {
    key: "makhachkala",
    emoji: "📍",
    label: "В Махачкале",
    gradient: "linear-gradient(135deg, #06B6D4, #0891B2)",
    filters: { city: 1 },
    isActive: (f) => f.city === 1,
  },
];

interface StoriesBarProps {
  filters: ICardFilters;
  onFiltersChange: (f: ICardFilters) => void;
}

export function StoriesBar({ filters, onFiltersChange }: StoriesBarProps) {
  const activeKey = useMemo(() => {
    // First match wins. "Новое" (empty) will act as fallback.
    for (const s of STORIES) {
      if (s.key !== "new" && s.isActive(filters)) return s.key;
    }
    if (STORIES[0].isActive(filters)) return "new";
    return null;
  }, [filters]);

  const handleClick = useCallback(
    (story: StoryDef) => {
      const next: ICardFilters = { ...filters };
      if (story.clears) {
        for (const k of story.clears) {
          delete next[k];
        }
      }
      // Apply story's filters on top
      Object.assign(next, story.filters);
      onFiltersChange(next);

      // Scroll to catalog
      if (typeof window !== "undefined") {
        // Use requestAnimationFrame so URL update settles first
        requestAnimationFrame(() => {
          const el = document.getElementById("catalog");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    },
    [filters, onFiltersChange]
  );

  return (
    <section
      aria-label="Быстрые фильтры"
      className="stories-bar-section"
      style={{ marginTop: 24, marginBottom: 8 }}
    >
      <div
        className="stories-bar-scroll tabs-scroll"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 4,
          paddingLeft: 2,
          paddingRight: 2,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {STORIES.map((story) => {
          const isActive = activeKey === story.key;
          return (
            <button
              key={story.key}
              type="button"
              onClick={() => handleClick(story)}
              className="stories-bar-item press-scale-sm"
              data-active={isActive ? "true" : "false"}
              aria-pressed={isActive}
              style={{
                flex: "0 0 auto",
                width: 80,
                height: 110,
                scrollSnapAlign: "start",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: 0,
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <span
                className="stories-bar-avatar"
                aria-hidden
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: story.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  lineHeight: 1,
                  boxShadow: isActive
                    ? "0 0 0 2px var(--home-accent), 0 0 0 4px var(--home-bg)"
                    : "var(--shadow-sm)",
                  transition: "box-shadow 200ms ease",
                }}
              >
                {story.emoji}
              </span>
              <span
                className="stories-bar-label"
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  color: isActive
                    ? "var(--home-accent)"
                    : "var(--home-text-secondary)",
                  textAlign: "center",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  maxWidth: 80,
                  transition: "color 160ms ease",
                }}
              >
                {story.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default StoriesBar;
