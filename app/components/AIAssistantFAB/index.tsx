"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const HIDDEN_PATHS = ["/chat", "/login", "/register", "/forgot", "/map"];

export function AIAssistantFAB() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  const shouldHide = useMemo(
    () =>
      HIDDEN_PATHS.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith("/card/"),
    [pathname]
  );

  if (shouldHide) return null;

  return (
    <Link
      href="/chat"
      aria-label="AI-помощник по подбору недвижимости"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="ai-fab-bottom"
      style={{
        position: "fixed",
        right: 24,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: hovered ? 10 : 0,
        height: 52,
        borderRadius: 999,
        padding: hovered ? "0 20px 0 14px" : "0 14px",
        background:
          "linear-gradient(135deg, #353358 0%, #22212F 55%, #15142A 100%)",
        boxShadow:
          "0 4px 24px rgba(0, 85, 255, 0.35), 0 2px 8px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.15)",
        textDecoration: "none",
        overflow: "hidden",
        transition:
          "padding 0.22s ease, gap 0.22s ease, box-shadow 0.15s ease, transform 0.15s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {/* Glow overlay */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(180px 120px at 120% -20%, rgba(0,117,255,0.5), transparent 70%)",
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      />

      {/* Icon */}
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          flexShrink: 0,
        }}
      >
        <Sparkles size={15} strokeWidth={2.2} color="#FFFFFF" />
      </span>

      {/* Label — slides in on hover */}
      <span
        style={{
          position: "relative",
          maxWidth: hovered ? 160 : 0,
          opacity: hovered ? 1 : 0,
          overflow: "hidden",
          transition: "max-width 0.22s ease, opacity 0.18s ease",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#FFFFFF",
          letterSpacing: "0.01em",
        }}
      >
        AI-помощник
      </span>
    </Link>
  );
}
