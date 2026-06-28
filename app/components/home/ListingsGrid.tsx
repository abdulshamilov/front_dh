"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { ICard } from "@/app/types/models";
import { PropertyCard } from "./PropertyCard";
import { CardSkeleton } from "./CardSkeleton";

interface ListingsGridProps {
  cards: ICard[];
  loading: boolean;
  hasMore: boolean;
  page: number;
  error?: string | null;
  onLoadMore: () => void;
  onClearFilters?: () => void;
  /** Show only the first N cards until user clicks "Больше квартир". */
  initialLimit?: number;
  /** Custom empty-state title. Falls back to default if omitted. */
  emptyTitle?: string;
  /** When set, hides the default empty-state entirely (parent renders its own). */
  hideEmpty?: boolean;
  /** Show WhatsApp CTA on each card. Used on /favorite. */
  showWhatsapp?: boolean;
  /** Show installment badge on each card. Used on /sale installment tab. */
  showInstallmentBadge?: boolean;
}

export function ListingsGrid({
  cards,
  loading,
  hasMore,
  error,
  onLoadMore,
  onClearFilters,
  initialLimit,
  emptyTitle,
  hideEmpty,
  showWhatsapp,
  showInstallmentBadge,
}: ListingsGridProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleCards =
    initialLimit && !expanded ? cards.slice(0, initialLimit) : cards;
  const hasMoreLocally =
    !!initialLimit && !expanded && cards.length > initialLimit;
  const canLoadMore = hasMoreLocally || (expanded && hasMore) || (!initialLimit && hasMore);

  const handleLoadMore = () => {
    if (!expanded && hasMoreLocally) {
      setExpanded(true);
      return;
    }
    if (hasMore && !loading) {
      onLoadMore();
    }
  };

  const showEmpty = !loading && cards.length === 0 && !error && !hideEmpty;

  if (error) {
    return (
      <div
        style={{
          padding: "24px 20px",
          margin: "0 16px",
          background: "var(--home-surface)",
          border: "1px solid var(--home-border)",
          borderRadius: 18,
          color: "var(--home-text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: 14,
        }}
        role="alert"
      >
        <span>
          {error === "Network Error"
            ? "Проблемы с сетью. Проверьте соединение."
            : `Ошибка: ${error}`}
        </span>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          style={{
            padding: "10px 18px",
            background: "var(--home-accent)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 12,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Обновить
        </button>
      </div>
    );
  }

  if (showEmpty) {
    return (
      <div
        style={{
          padding: "56px 24px",
          margin: "0 16px",
          background: "var(--home-surface)",
          border: "1px solid var(--home-border)",
          borderRadius: 18,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 15,
            color: "var(--home-text-secondary)",
          }}
        >
          {emptyTitle ?? "Ничего не найдено. Попробуйте изменить фильтры."}
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="press-scale"
            style={{
              padding: "12px 22px",
              background: "var(--home-accent)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 14,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="listings-grid">
        {visibleCards.map((c) => (
          <PropertyCard key={c.id} card={c} showWhatsapp={showWhatsapp} showInstallmentBadge={showInstallmentBadge} />
        ))}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={`sk-${i}`} />
          ))}
      </div>

      {canLoadMore && cards.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
            padding: "0 16px",
          }}
        >
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="listings-load-more press-scale"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              height: 52,
              padding: "0 28px",
              background: "var(--home-surface)",
              border: "1px solid var(--home-border-strong)",
              borderRadius: 14,
              color: "var(--home-text-primary)",
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "background 160ms ease, border-color 160ms ease",
            }}
          >
            {loading ? "Загружаем…" : "Больше квартир"}
            {!loading && <ArrowDown size={16} strokeWidth={2.2} />}
          </button>
        </div>
      )}

      <style jsx>{`
        .listings-load-more:hover:not(:disabled) {
          background: var(--home-surface-elevated) !important;
          border-color: var(--home-accent) !important;
        }
        .listings-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          column-gap: 16px;
          row-gap: 16px;
          padding: 0 16px;
        }
        @media (max-width: 1023px) {
          .listings-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 4px;
            row-gap: 6px;
            padding: 0;
          }
        }
      `}</style>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .product-card:hover {
            transform: translateY(-3px);
          }
          .product-card:hover .product-card-img {
            transform: scale(1.03);
          }
        }
      `}</style>
    </div>
  );
}

export default ListingsGrid;
