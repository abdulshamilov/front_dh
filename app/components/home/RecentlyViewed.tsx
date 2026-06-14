"use client";

import { ArrowRight } from "lucide-react";
import { ICard } from "@/app/types/models";
import { PropertyCard } from "./PropertyCard";

interface RecentlyViewedProps {
  cards: ICard[];
  // When provided, controls visibility (parent should pass isAuth)
  isAuth?: boolean;
}

export function RecentlyViewed({ cards, isAuth = true }: RecentlyViewedProps) {
  // Hide entirely if not authenticated or empty
  if (!isAuth) return null;
  if (!cards || cards.length === 0) return null;

  return (
    <section
      className="recently-viewed-section"
      style={{ marginTop: 40 }}
      aria-labelledby="recently-viewed-heading"
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
          id="recently-viewed-heading"
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
          Вы недавно смотрели
        </h2>
        <a
          href="#catalog"
          className="recently-viewed-all-link"
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
          Все
          <ArrowRight size={14} />
        </a>
      </header>

      <div
        className="recently-viewed-scroll tabs-scroll"
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: 8,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {cards.map((c) => (
          <div
            key={c.id}
            className="recently-viewed-item"
            style={{
              flex: "0 0 260px",
              width: 260,
              scrollSnapAlign: "start",
            }}
          >
            <PropertyCard card={c} variant="popular" />
          </div>
        ))}
      </div>

      <style jsx>{`
        .recently-viewed-all-link:hover {
          opacity: 0.8;
        }
        @media (max-width: 640px) {
          .recently-viewed-item {
            flex: 0 0 78% !important;
            width: 78% !important;
          }
        }
      `}</style>
    </section>
  );
}

export default RecentlyViewed;
