"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { objectsWord } from "@/app/shared/utils/plural";

interface AiBannerProps {
  totalCount?: number;
  title?: string;
  subtitle?: string;
  href?: string;
  ariaLabel?: string;
}

function formatCompact(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

export function AiBanner({
  totalCount = 0,
  title,
  subtitle,
  href = "/chat",
  ariaLabel = "Подбор квартиры с AI-помощником",
}: AiBannerProps) {
  const safe = Math.max(0, Math.round(totalCount || 0));
  const showCount = safe > 0;

  const finalTitle = title ?? "Подбор с AI";
  const finalSubtitle =
    subtitle ??
    (showCount
      ? `Найдём среди ${formatCompact(safe)} ${objectsWord(safe)}`
      : "Опиши мечту — покажем варианты");

  return (
    <Link
      href={href}
      className="ai-banner press-scale-card"
      aria-label={ariaLabel}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        background:
          "linear-gradient(135deg, rgba(53,51,88,0.9) 0%, rgba(34,33,47,0.9) 55%, rgba(21,20,42,0.92) 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(340px 200px at 100% -30%, rgba(0,117,255,0.45), transparent 65%), radial-gradient(260px 160px at 0% 130%, rgba(241,17,126,0.22), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <span
        aria-hidden
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "#FFFFFF",
          flexShrink: 0,
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        }}
      >
        <Sparkles size={18} strokeWidth={2.2} color="#22212F" />
      </span>

      <span
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.02em",
            color: "#FFFFFF",
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {finalTitle}
        </span>
        <span
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 11.5,
            color: "rgba(255,255,255,0.64)",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {finalSubtitle}
        </span>
      </span>

      <span
        aria-hidden
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "rgba(255,255,255,0.14)",
          color: "#FFFFFF",
          flexShrink: 0,
        }}
      >
        <ArrowUpRight size={14} strokeWidth={2.4} />
      </span>
    </Link>
  );
}

export default AiBanner;
