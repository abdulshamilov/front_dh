"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/app/shared/redux/hooks";

function objectsWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "объектов";
  if (mod10 === 1) return "объект";
  if (mod10 >= 2 && mod10 <= 4) return "объекта";
  return "объектов";
}

export function DevelopersPreview() {
  const developersRaw = useAppSelector((s) => s.developers.developers);
  const developers = Array.isArray(developersRaw) ? developersRaw : [];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [developers.length]);

  if (developers.length === 0) return <div ref={containerRef} style={{ minHeight: 1 }} aria-hidden />;

  const items = developers.slice(0, 12);

  return (
    <section ref={containerRef} style={{ marginTop: 28 }} aria-labelledby="developers-heading">
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 12, padding: "0 16px",
      }}>
        <h2 id="developers-heading" style={{
          margin: 0,
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          fontWeight: 700, fontSize: 20, lineHeight: 1.2,
          letterSpacing: "-0.015em", color: "var(--home-text-primary)",
        }}>
          ЖК
        </h2>
        <Link href="/developers" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 500, fontSize: 13,
          color: "var(--home-text-tertiary)", textDecoration: "none",
        }}>
          Все <ArrowRight size={13} />
        </Link>
      </header>

      {visible && (
        <div style={{
          display: "flex", gap: 8,
          overflowX: "auto", overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          paddingLeft: 16, paddingRight: 16, paddingBottom: 4,
          scrollbarWidth: "none",
        }}>
          {items.map((dev) => {
            const count = dev.cards?.length ?? 0;
            return (
              <Link
                key={dev.id}
                href={`/developers/${dev.id}`}
                style={{
                  flex: "0 0 auto",
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px",
                  borderRadius: 14,
                  background: "var(--home-surface)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  textDecoration: "none", color: "inherit",
                  transition: "border-color 160ms ease, background 160ms ease",
                  maxWidth: 200,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(255,255,255,0.16)";
                  el.style.background = "rgba(255,255,255,0.07)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(255,255,255,0.07)";
                  el.style.background = "var(--home-surface)";
                }}
              >
                {/* Name + count */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-manrope), system-ui, sans-serif",
                    fontWeight: 600, fontSize: 13, lineHeight: 1.25,
                    color: "var(--home-text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    maxWidth: 110,
                  }}>
                    {dev.name}
                  </div>
                  {count > 0 && (
                    <div style={{
                      marginTop: 2,
                      fontFamily: "var(--font-inter), system-ui, sans-serif",
                      fontSize: 11, color: "var(--home-text-tertiary)",
                    }}>
                      {count} {objectsWord(count)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default DevelopersPreview;
