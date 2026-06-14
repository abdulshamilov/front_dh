"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

type Tone = "primary" | "success" | "warning";

interface LeadCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  cta: string;
  onClick?: () => void;
  tone?: Tone;
}

export function LeadCard({
  icon,
  title,
  description,
  cta,
  onClick,
  tone = "primary",
}: LeadCardProps) {
  const accent =
    tone === "primary"
      ? "var(--accent-primary)"
      : tone === "success"
        ? "var(--success)"
        : "var(--warning)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="press-scale"
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
        padding: "16px 18px",
        background: "var(--surface)",
        border: "1px solid var(--border-color)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: 16,
        cursor: "pointer",
        transition: "background 160ms ease, transform 160ms ease",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `color-mix(in srgb, ${accent} 14%, transparent)`,
          color: accent,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>

      <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-stetica-medium)",
            fontSize: 15,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {title}
        </span>
        {description && (
          <span
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.4,
            }}
          >
            {description}
          </span>
        )}
      </span>

      <span
        aria-hidden
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "var(--surface-elevated)",
          color: accent,
        }}
      >
        <ArrowRight size={16} strokeWidth={2.4} />
      </span>

      <span className="sr-only">{cta}</span>
    </button>
  );
}
