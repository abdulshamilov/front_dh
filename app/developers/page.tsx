"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Phone, Building2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchDevelopers } from "@/app/shared/redux/slices/developers";

function objectsWord(n: number): string {
  const m100 = n % 100, m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return "объектов";
  if (m10 === 1) return "объект";
  if (m10 >= 2 && m10 <= 4) return "объекта";
  return "объектов";
}

function SkeletonRow({ last }: { last?: boolean }) {
  return (
    <div className="ios-row" style={{ pointerEvents: "none" }}>
      <div className="ios-row-body" style={{ borderBottom: last ? "none" : undefined }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ height: 14, width: "55%", borderRadius: 7, background: "rgba(255,255,255,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 11, width: "30%", borderRadius: 6, background: "rgba(255,255,255,0.045)", animation: "pulse 1.5s ease-in-out infinite 0.15s" }} />
        </div>
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  const dispatch = useAppDispatch();
  const { developers: raw, loading, error } = useAppSelector((s) => s.developers);
  const developers = Array.isArray(raw) ? raw : [];

  useEffect(() => { dispatch(fetchDevelopers()); }, [dispatch]);

  const filtered = developers;

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <style>{`
        .ios-group {
          border-radius: 16px;
          background: var(--home-surface, #1D2024);
          overflow: hidden;
        }
        .ios-row {
          display: flex;
          align-items: center;
          padding-left: 16px;
          min-height: 76px;
          text-decoration: none;
          color: inherit;
          -webkit-tap-highlight-color: transparent;
          transition: background 120ms ease;
        }
        a.ios-row:active { background: rgba(255,255,255,0.09); }
        @media (hover: hover) {
          a.ios-row:hover { background: rgba(255,255,255,0.05); }
        }
        .ios-row-body {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
          padding: 12px 16px 12px 0;
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .ios-row:last-child .ios-row-body { border-bottom: none; }

        .ios-badge {
          flex-shrink: 0;
          font-family: var(--font-inter), -apple-system, system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 4px 10px;
        }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }
      `}</style>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 72px" }}>
        {error && (
          <div style={{
            padding: "13px 16px", borderRadius: 14, marginBottom: 14,
            background: "rgba(255,68,68,0.09)",
            color: "#FF6B6B", fontSize: 14,
            fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
          }}>
            {error}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p style={{
            margin: "0 0 8px",
            padding: "0 16px",
            fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "rgba(255,255,255,0.35)",
          }}>
            {filtered.length} {objectsWord(filtered.length)}
          </p>
        )}

        <div className="ios-group">
          {loading
            ? Array.from({ length: 8 }).map((_, i, arr) => (
                <SkeletonRow key={i} last={i === arr.length - 1} />
              ))
            : filtered.map((dev) => {
                const count = dev.cards?.length ?? 0;

                return (
                  <Link key={dev.id} href={`/developers/${dev.id}`} className="ios-row">
                    <div className="ios-row-body">
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "var(--font-stetica-bold), -apple-system, system-ui, sans-serif",
                          fontSize: 16,
                          color: "#FFFFFF",
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {dev.name}
                        </div>
                        {dev.phone && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: 5,
                            marginTop: 3,
                            fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
                            fontSize: 13,
                            color: "rgba(255,255,255,0.38)",
                          }}>
                            <Phone size={11} strokeWidth={2} />
                            {dev.phone}
                          </div>
                        )}
                      </div>

                      {count > 0 && <span className="ios-badge">{count}</span>}

                      <ChevronRight
                        size={17}
                        strokeWidth={2.5}
                        style={{ flexShrink: 0, color: "rgba(255,255,255,0.22)" }}
                      />
                    </div>
                  </Link>
                );
              })}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            textAlign: "center", padding: "72px 0",
          }}>
            <Building2 size={36} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.18)" }} />
            <span style={{
              fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
              fontSize: 15, color: "rgba(255,255,255,0.3)",
            }}>
              Жилые комплексы не найдены
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
