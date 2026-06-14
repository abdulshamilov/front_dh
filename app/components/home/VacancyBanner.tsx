"use client";

import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export function VacancyBanner() {
  return (
    <Link
      href="/vacancy"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        margin: "32px 16px",
        padding: "18px 22px",
        borderRadius: 18,
        background:
          "linear-gradient(135deg, rgba(0,117,255,0.18) 0%, rgba(0,212,255,0.08) 50%, rgba(241,17,126,0.10) 100%)",
        border: "1px solid rgba(0,117,255,0.28)",
        textDecoration: "none",
        cursor: "pointer",
        transition: "transform 0.18s, border-color 0.18s",
        position: "relative",
        overflow: "hidden",
      }}
      className="hover:-translate-y-0.5 hover:border-[rgba(0,117,255,0.5)]"
    >
      {/* bg glow */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(241,17,126,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "rgba(0,117,255,0.2)",
            border: "1px solid rgba(0,117,255,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap size={18} color="var(--accent-cyan)" />
        </span>
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontFamily: "var(--font-stetica-bold)",
              color: "var(--text-primary)",
            }}
          >
            Открытая вакансия — Менеджер по продажам
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontFamily: "var(--font-stetica-medium)",
              color: "var(--text-secondary)",
              marginTop: 2,
            }}
          >
            График 5/2 · Обучение бесплатно · Заработок без потолка
          </p>
        </div>
      </div>

      <ArrowRight
        size={20}
        color="var(--accent-primary)"
        style={{ flexShrink: 0 }}
      />
    </Link>
  );
}
