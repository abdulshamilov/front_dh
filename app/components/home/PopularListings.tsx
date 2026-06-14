"use client";

import { ArrowRight } from "lucide-react";
import { ICard } from "@/app/types/models";
import { PropertyCard } from "./PropertyCard";

interface PopularListingsProps {
  cards: ICard[];
}

export function PopularListings({ cards }: PopularListingsProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section
      className="popular-listings-section"
      style={{ marginTop: 40 }}
      aria-labelledby="popular-heading"
    >
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
          id="popular-heading"
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
          Популярное
        </h2>
        <a
          href="#catalog"
          className="popular-all-link"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--home-accent-link)",
            textDecoration: "none",
            transition: "opacity 160ms ease",
          }}
        >
          Смотреть все
          <ArrowRight size={14} />
        </a>
      </header>

      <div className="popular-listings-grid">
        {cards.slice(0, 3).map((c) => (
          <PropertyCard key={c.id} card={c} variant="popular" />
        ))}
      </div>

      <style jsx>{`
        .popular-listings-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1023px) {
          .popular-listings-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 639px) {
          .popular-listings-grid {
            display: flex;
            grid-template-columns: none;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 8px;
            -webkit-overflow-scrolling: touch;
          }
          .popular-listings-grid > :global(*) {
            flex: 0 0 82%;
            scroll-snap-align: start;
          }
        }
        .popular-all-link:hover {
          opacity: 0.8;
        }
      `}</style>
    </section>
  );
}

export default PopularListings;
