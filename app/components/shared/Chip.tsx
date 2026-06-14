"use client";

import React from "react";

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
  "aria-label"?: string;
}

export function Chip({
  active = false,
  onClick,
  children,
  size = "md",
  "aria-label": ariaLabel,
}: ChipProps) {
  const isInteractive = !!onClick;
  const padding = size === "sm" ? "6px 12px" : "8px 14px";
  const fontSize = size === "sm" ? 12 : 13;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isInteractive ? active : undefined}
      aria-label={ariaLabel}
      className={isInteractive ? "press-scale" : ""}
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding,
        borderRadius: 999,
        fontFamily: "var(--font-stetica-medium)",
        fontSize,
        fontWeight: 500,
        whiteSpace: "nowrap",
        cursor: isInteractive ? "pointer" : "default",
        transition: "background 160ms ease, color 160ms ease, border-color 160ms ease",
        background: active ? "var(--accent-primary)" : "var(--surface-elevated)",
        color: active ? "#FFFFFF" : "var(--text-secondary)",
        border: active
          ? "1px solid var(--accent-primary)"
          : "1px solid var(--border-color)",
      }}
    >
      {children}
    </button>
  );
}
