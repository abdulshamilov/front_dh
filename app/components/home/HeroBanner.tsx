"use client";

import Link from "next/link";
import { ChevronDown, MapPin, Search, Sparkles, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface HeroBannerProps {
  totalCount?: number;
  onCtaClick?: () => void;
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

function objectsWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "объектов";
  if (mod10 === 1) return "объект";
  if (mod10 >= 2 && mod10 <= 4) return "объекта";
  return "объектов";
}

const PLACEHOLDERS = [
  "ЖК Акватория в Махачкале",
  "1-комнатная до 3 млн",
  "Квартира у моря",
  "Студия с отделкой",
  "Новостройка в Каспийске",
];

function useTypewriterPlaceholder(items: string[]): string {
  const [text, setText] = useState(items[0] ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    let itemIdx = 0;
    let charIdx = items[0].length;
    let typing = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      const current = items[itemIdx];
      if (typing) {
        charIdx += 1;
        setText(current.slice(0, charIdx));
        if (charIdx === current.length) {
          typing = false;
          timeoutId = setTimeout(tick, 2200);
          return;
        }
        timeoutId = setTimeout(tick, 55);
      } else {
        charIdx -= 1;
        setText(current.slice(0, Math.max(0, charIdx)));
        if (charIdx <= 0) {
          typing = true;
          itemIdx = (itemIdx + 1) % items.length;
          timeoutId = setTimeout(tick, 400);
          return;
        }
        timeoutId = setTimeout(tick, 25);
      }
    };

    timeoutId = setTimeout(tick, 2200);
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [items]);

  return text;
}

export function HeroBanner({ totalCount = 1248 }: HeroBannerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const animatedPlaceholder = useTypewriterPlaceholder(PLACEHOLDERS);

  const safeCount = Math.max(0, Math.round(totalCount || 0));
  const countLabel = `${formatCompact(safeCount || 1248)} ${objectsWord(
    safeCount || 1248
  )}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section
      className="hero-banner"
      aria-label="Главный блок"
      style={{
        padding: "12px 16px 0",
        background: "var(--home-bg)",
      }}
    >
      <div
        className="hero-card"
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
          background:
            "linear-gradient(165deg, #353358 0%, #22212F 55%, #15142A 100%)",
          borderRadius: 28,
          overflow: "hidden",
          padding: "20px 20px 28px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Decorative soft glows */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(700px 320px at 90% -10%, rgba(29,142,122,0.35), transparent 70%), radial-gradient(500px 300px at -10% 110%, rgba(0,117,255,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Top row — location pill + live counter */}
          <div
            className="hero-top-row"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <button
              type="button"
              className="hero-location"
              aria-label="Выбрать город"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 4px",
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                textAlign: "left",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MapPin size={16} strokeWidth={2} color="#FFFFFF" />
              </span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.64)",
                    lineHeight: 1,
                  }}
                >
                  Ваша локация
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    lineHeight: 1.1,
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  }}
                >
                  Махачкала
                  <ChevronDown size={14} strokeWidth={2.2} />
                </span>
              </span>
            </button>

            <div
              aria-label="Объектов в продаже"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#FFFFFF",
                whiteSpace: "nowrap",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--home-success)",
                  boxShadow: "0 0 8px rgba(30,237,97,0.7)",
                }}
              />
              {countLabel}
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div
              className="hero-search-wrap"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 56,
                padding: "0 16px",
                background: "#FFFFFF",
                borderRadius: 16,
                boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
              }}
            >
              <Search
                size={20}
                strokeWidth={2}
                style={{ color: "#6A6C6F", flexShrink: 0 }}
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={animatedPlaceholder || "Попробуй: 2-комнатная у моря…"}
                className="hero-search-input"
                aria-label="Поиск квартир"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#0F1720",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              />
              {query.trim() && (
                <button
                  type="submit"
                  aria-label="Найти"
                  className="hero-search-submit press-scale"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    border: "none",
                    borderRadius: 12,
                    background: "var(--home-accent)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 160ms ease",
                  }}
                >
                  <Search size={18} strokeWidth={2.4} />
                </button>
              )}
            </div>
          </form>

          {/* AI banner */}
          <Link
            href="/chat"
            className="hero-ai-banner"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 16,
              padding: 16,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 18,
              textDecoration: "none",
              color: "inherit",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "background 180ms ease, border-color 180ms ease",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#FFFFFF",
                flexShrink: 0,
                boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
              }}
            >
              <Sparkles size={24} strokeWidth={2} color="#0E2B2A" />
            </span>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                flex: 1,
                minWidth: 0,
              }}
            >
              <span
                className="hero-ai-title"
                style={{
                  fontFamily: "var(--font-manrope), system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  lineHeight: 1.15,
                }}
              >
                Подбор квартиры с AI
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.76)",
                  lineHeight: 1.35,
                }}
              >
                Опиши мечту — покажем варианты
              </span>
            </span>
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <ArrowUpRight size={18} strokeWidth={2.2} />
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hero-ai-banner:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.22) !important;
        }
        .hero-search-submit:hover {
          background: var(--home-accent-hover) !important;
        }
        .hero-search-input::placeholder {
          color: #9AA3B2;
        }
        @media (min-width: 768px) {
          .hero-card {
            padding: 28px 32px 32px !important;
          }
          .hero-ai-title {
            font-size: 16px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-banner {
            padding: 8px 10px 0 !important;
          }
          .hero-card {
            border-radius: 24px !important;
            padding: 16px 16px 20px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroBanner;
