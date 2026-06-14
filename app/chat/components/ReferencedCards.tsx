"use client";

import { Home } from "lucide-react";
import { ICard } from "@/app/types/models";
import { PropertyCard } from "@/app/components/home/PropertyCard";
import { pluralRu } from "@/app/shared/utils/plural";

interface ReferencedCardsProps {
  cards: ICard[];
}

// Горизонтальный snap-scroll рекомендуемых объектов под ответом AI.
// Использует общий PropertyCard (как на главной/favorite/sale) — единый visual.
export function ReferencedCards({ cards }: ReferencedCardsProps) {
  if (cards.length === 0) return null;

  const visibleCards = cards.slice(0, 6);
  const word = pluralRu(cards.length, ["объект", "объекта", "объектов"]);

  return (
    <div
      role="region"
      aria-label="Рекомендованные объекты"
      className="referenced-cards-root"
    >
      <div className="referenced-cards-header">
        <Home size={14} strokeWidth={2.4} />
        <span>
          Подходит вам · {cards.length} {word}
        </span>
      </div>

      <div className="referenced-cards-scroll">
        {visibleCards.map((card) => (
          <div key={card.id} className="referenced-cards-item">
            <PropertyCard card={card} />
          </div>
        ))}
      </div>

      <style jsx>{`
        .referenced-cards-root {
          width: 100%;
          margin-right: -16px;
        }
        .referenced-cards-header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-left: 40px;
          padding: 6px 10px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
          color: var(--accent-primary);
          font-family: var(--font-stetica-medium);
          font-weight: 500;
          font-size: 12px;
        }
        .referenced-cards-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 0 0 4px 16px;
          margin: 10px 0 0;
        }
        .referenced-cards-scroll::-webkit-scrollbar {
          display: none;
        }
        .referenced-cards-item {
          flex: 0 0 200px;
          scroll-snap-align: start;
        }
        @media (min-width: 768px) {
          .referenced-cards-item {
            flex: 0 0 240px;
          }
        }
      `}</style>
    </div>
  );
}
