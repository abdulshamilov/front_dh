"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import { ICard } from "@/app/types/models";
import { parsePriceToNumber } from "@/app/shared/utils/price";

interface NearbyCardsStripProps {
  cards: ICard[];
  /** Map center [lng, lat] — strip resorts whenever this changes. */
  center: [number, number] | null;
  /** Currently selected card; that strip item gets highlighted + scrolled into view. */
  selectedCard: ICard | null;
  /** Tap on a strip item — pans the map and opens the preview. */
  onCardTap: (card: ICard) => void;
  /** Card IDs in the compare tray; strip item shows a small blue dot. */
  comparingIds: Set<number>;
  /** True while the first batch of cards is still loading. Shows skeleton. */
  isLoading?: boolean;
  /** When the SelectedCardSheet is open, the strip lifts above it. */
  liftedAboveCard?: boolean;
  /** Approximate height of the lifted card sheet (px). */
  cardSheetHeight?: number;
}

const MAX_ITEMS = 12;

function formatPriceShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} млн`;
  if (n >= 1000) return `${Math.round(n / 1000)} тыс`;
  return String(n);
}

/**
 * Yandex-Realty-style horizontal carousel above the bottom edge.
 * Always visible while in map mode. Tapping a card pans the map (no zoom
 * change) and shows the preview. When a pin is selected externally, the
 * matching card scrolls into view.
 */
export function NearbyCardsStrip({
  cards,
  center,
  selectedCard,
  onCardTap,
  comparingIds,
  isLoading = false,
  liftedAboveCard = false,
  cardSheetHeight = 220,
}: NearbyCardsStripProps) {
  const [debouncedCenter, setDebouncedCenter] = useState(center);
  useEffect(() => {
    if (!center) return;
    const t = setTimeout(() => setDebouncedCenter(center), 220);
    return () => clearTimeout(t);
  }, [center]);

  const nearby = useMemo(() => {
    if (cards.length === 0) return [];
    const c = debouncedCenter;
    if (!c) return cards.slice(0, MAX_ITEMS);
    return [...cards]
      .map((card) => ({
        card,
        d: (card.longitude - c[0]) ** 2 + (card.latitude - c[1]) ** 2,
      }))
      .sort((a, b) => a.d - b.d)
      .slice(0, MAX_ITEMS)
      .map((x) => x.card);
  }, [cards, debouncedCenter]);

  const trackRef = useRef<HTMLDivElement | null>(null);

  // Scroll the selected card into view (bidirectional pin → strip sync).
  useEffect(() => {
    if (!selectedCard || !trackRef.current) return;
    const el = trackRef.current.querySelector<HTMLElement>(
      `[data-card-id="${selectedCard.id}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedCard]);

  if (nearby.length === 0 && !isLoading) return null;

  return (
    <div
      role="region"
      aria-label="Объекты рядом"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        // When a card-preview sheet is open at the very bottom, the strip
        // lifts above it. Otherwise it sits near the screen edge.
        bottom: liftedAboveCard
          ? `calc(env(safe-area-inset-bottom, 0px) + ${cardSheetHeight}px)`
          : "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        zIndex: 25,
        pointerEvents: "none",
        transition: "bottom 280ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "flex",
          gap: 8,
          padding: "0 16px 4px",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          pointerEvents: "auto",
        }}
      >
        {isLoading && nearby.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              aria-hidden
              style={{
                flexShrink: 0,
                width: 240,
                height: 72,
                padding: 8,
                background: "rgba(7,7,7,0.85)",
                border: "1px solid var(--border-glass)",
                borderRadius: 14,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  background: "var(--surface-elevated)",
                  animation: "nearby-pulse 1.4s ease-in-out infinite",
                }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div
                  style={{
                    width: "60%",
                    height: 12,
                    borderRadius: 6,
                    background: "var(--surface-elevated)",
                    animation: "nearby-pulse 1.4s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    width: "85%",
                    height: 9,
                    borderRadius: 5,
                    background: "var(--surface-elevated)",
                    animation: "nearby-pulse 1.4s ease-in-out infinite",
                  }}
                />
              </div>
              <style>{`
                @keyframes nearby-pulse {
                  0%, 100% { opacity: 0.55; }
                  50% { opacity: 0.85; }
                }
              `}</style>
            </div>
          ))}
        {nearby.map((card) => {
          const isSelected = selectedCard?.id === card.id;
          const isComparing = comparingIds.has(card.id);
          const img =
            card.images?.find((i) => i.image && i.image.trim() !== "")?.image ||
            "/placeholder.jpg";
          const price = parsePriceToNumber(card.price);
          return (
            <button
              key={card.id}
              data-card-id={card.id}
              type="button"
              onClick={() => onCardTap(card)}
              style={{
                flexShrink: 0,
                scrollSnapAlign: "center",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: 240,
                padding: 8,
                background: "rgba(7,7,7,0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: isSelected
                  ? "1.5px solid #F1117E"
                  : "1px solid var(--border-glass)",
                borderRadius: 14,
                cursor: "pointer",
                textAlign: "left",
                transition:
                  "border-color 160ms ease, transform 160ms ease, background 160ms ease",
                transform: isSelected ? "scale(1.02)" : "scale(1)",
                boxShadow: isSelected
                  ? "0 8px 24px rgba(241,17,126,0.3)"
                  : "0 4px 12px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: 56,
                  height: 56,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "var(--surface-elevated)",
                }}
              >
                <Image
                  src={img}
                  alt={card.title}
                  fill
                  sizes="56px"
                  style={{ objectFit: "cover" }}
                />
                {isComparing && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "#0075FF",
                      boxShadow: "0 0 0 2px rgba(7,7,7,0.88)",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "var(--font-stetica-bold), system-ui, sans-serif",
                    fontSize: 14,
                    color: "#F1117E",
                    whiteSpace: "nowrap",
                    lineHeight: 1.1,
                  }}
                >
                  {formatPriceShort(price)} ₽
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 150,
                  }}
                >
                  {card.address || card.title || "Махачкала"}
                </span>
                {card.rooms > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      fontSize: 10,
                      color: "var(--text-tertiary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {card.rooms} комн.
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default NearbyCardsStrip;
