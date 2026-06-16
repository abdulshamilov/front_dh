"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchDevelopers } from "@/app/shared/redux/slices/developers";

function objectsWord(n: number): string {
  const m100 = n % 100, m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return "объектов";
  if (m10 === 1) return "объект";
  if (m10 >= 2 && m10 <= 4) return "объекта";
  return "объектов";
}

function Skeleton() {
  return (
    <div style={{
      borderRadius: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 18px",
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, background: "rgba(255,255,255,0.06)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 15, width: "60%", borderRadius: 6, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 12, width: "35%", borderRadius: 6, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite 0.15s" }} />
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  const dispatch = useAppDispatch();
  const { developers: raw, loading, error } = useAppSelector((s) => s.developers);
  const developers = Array.isArray(raw) ? raw : [];

  useEffect(() => { dispatch(fetchDevelopers()); }, [dispatch]);

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 16px 28px",
      }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)",
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}>
            Жилые комплексы
          </h1>
          {!loading && developers.length > 0 && (
            <p style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.3)",
            }}>
              {developers.length} {objectsWord(developers.length)}
            </p>
          )}
        </div>
      </div>

      <style>{`
        .dev-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 10px;
        }
        @media (max-width: 640px) {
          .dev-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dev-card {
            padding: 10px 8px !important;
            gap: 8px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .dev-logo {
            width: 44px !important;
            height: 44px !important;
          }
          .dev-arrow {
            display: none !important;
          }
          .dev-name {
            font-size: 13px !important;
          }
          .dev-meta {
            flex-direction: column !important;
            gap: 3px !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      {/* List */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 16px 64px" }}>
        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: 12, marginBottom: 20,
            background: "rgba(241,17,126,0.07)", border: "1px solid rgba(241,17,126,0.15)",
            color: "rgba(255,255,255,0.5)", fontSize: 14,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
          }}>
            {error}
          </div>
        )}

        <div className="dev-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
            : developers.map((dev) => {
                const count = dev.cards?.length ?? 0;

                return (
                  <Link
                    key={dev.id}
                    href={`/developers/${dev.id}`}
                    className="dev-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "14px 16px",
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "background 160ms ease, border-color 160ms ease",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(255,255,255,0.055)";
                      el.style.borderColor = "rgba(255,255,255,0.13)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(255,255,255,0.03)";
                      el.style.borderColor = "rgba(255,255,255,0.07)";
                    }}
                  >
                    {/* Logo */}
                    <div className="dev-logo" style={{
                      width: 64,
                      height: 64,
                      borderRadius: 12,
                      background: "#FFFFFF",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      padding: 6,
                    }}>
                      {dev.logo ? (
                        <Image
                          src={dev.logo}
                          alt={dev.name}
                          width={52}
                          height={52}
                          style={{ objectFit: "contain", width: "100%", height: "100%" }}
                        />
                      ) : (
                        <span style={{
                          fontSize: 22,
                          fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
                          color: "#333",
                        }}>
                          {dev.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="dev-name" style={{
                        fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
                        fontSize: 15,
                        color: "#FFFFFF",
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {dev.name}
                      </div>

                      <div className="dev-meta" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                        {count > 0 && (
                          <span style={{
                            fontFamily: "var(--font-inter), system-ui, sans-serif",
                            fontSize: 12,
                            color: "rgba(255,255,255,0.35)",
                          }}>
                            {count} {objectsWord(count)}
                          </span>
                        )}
                        {dev.phone && (
                          <>
                            {count > 0 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>•</span>}
                            <span style={{
                              display: "flex", alignItems: "center", gap: 4,
                              fontFamily: "var(--font-inter), system-ui, sans-serif",
                              fontSize: 12,
                              color: "rgba(255,255,255,0.3)",
                            }}>
                              <Phone size={11} strokeWidth={2} />
                              {dev.phone}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="dev-arrow" style={{ flexShrink: 0, color: "rgba(255,255,255,0.2)" }}>
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                );
              })}
        </div>

        {!loading && !error && developers.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 0",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 15, color: "rgba(255,255,255,0.25)",
          }}>
            Жилые комплексы не найдены
          </div>
        )}
      </div>
    </div>
  );
}
