"use client";

import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  city: string;
  age: number;
  text: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Патимат Магомедова",
    city: "Махачкала",
    age: 29,
    text: "AI подобрал двушку у моря за вечер. Уже вносим задаток.",
    rating: 5,
  },
  {
    name: "Мурад Алиев",
    city: "Каспийск",
    age: 34,
    text: "Связался напрямую — скидка и парковка в подарок.",
    rating: 5,
  },
  {
    name: "Аминат Гаджиева",
    city: "Избербаш",
    age: 26,
    text: "Карта, метраж, рассрочка — всё в одном месте.",
    rating: 5,
  },
  {
    name: "Расул Омаров",
    city: "Махачкала",
    age: 38,
    text: "Купил студию для дочери. Просто, без посредников.",
    rating: 5,
  },
];

const PALETTES = [
  { accent: "#1D8E7A", avatarBg: "rgba(29,142,122,0.18)" },
  { accent: "#0075FF", avatarBg: "rgba(0,117,255,0.18)" },
  { accent: "#F1117E", avatarBg: "rgba(241,17,126,0.18)" },
  { accent: "#8B5CF6", avatarBg: "rgba(139,92,246,0.18)" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase() || "?";
}

export function Testimonials() {
  return (
    <section
      style={{ marginTop: 32 }}
      aria-labelledby="testimonials-heading"
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 12,
          padding: "0 16px",
        }}
      >
        <h2
          id="testimonials-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: "var(--home-text-primary)",
          }}
        >
          Нас выбирают
        </h2>
        <span
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13,
            color: "var(--home-text-tertiary)",
          }}
        >
          {TESTIMONIALS.length} отзыва
        </span>
      </header>

      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 8,
          scrollbarWidth: "none",
        }}
      >
        {TESTIMONIALS.map((t, i) => {
          const p = PALETTES[i % PALETTES.length];
          return (
            <article
              key={t.name}
              style={{
                flex: "0 0 auto",
                width: 230,
                scrollSnapAlign: "start",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 14,
                borderRadius: 14,
                background: "var(--home-surface)",
                overflow: "hidden",
                minHeight: 170,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: p.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: p.accent,
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {initials(t.name)}
              </div>

              {/* Name + city */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: 1.25,
                    color: "var(--home-text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.name}
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 11.5,
                    color: "var(--home-text-tertiary)",
                  }}
                >
                  {t.city}
                </span>
              </div>

              {/* Quote */}
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: 12.5,
                  lineHeight: 1.45,
                  color: "var(--home-text-secondary)",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {t.text}
              </p>

              {/* Footer rating */}
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Star
                  size={13}
                  strokeWidth={0}
                  style={{
                    color: "var(--home-star)",
                    fill: "var(--home-star)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--home-text-primary)",
                  }}
                >
                  {t.rating.toFixed(1)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Testimonials;
