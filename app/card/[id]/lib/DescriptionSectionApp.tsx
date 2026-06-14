"use client";

import { useState } from "react";

/**
 * Mirrors DescriptionSection from DetailContentSections.kt.
 *
 * - Empty/blank text → render nothing.
 * - Collapsed: max 4 lines (Compose maxLines = 4, TextOverflow.Ellipsis).
 * - Toggle shown only when text.length > 200 (Compose threshold).
 *
 * Verbatim strings (strings.xml):
 *   description = "Описание"
 *   show_full = "Показать полностью"
 *   collapse_text = "Свернуть"
 */

export function DescriptionSectionApp({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [pressed, setPressed] = useState(false);

  if (!text || text.trim().length === 0) return null;

  const showToggle = text.length > 200;

  const release = () => {
    if (pressed) setPressed(false);
  };

  return (
    <div style={{ padding: "12px 16px" }}>
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        Описание
      </div>

      {/* Spacer 8px (Spacing.sm) */}
      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          fontSize: "14px",
          lineHeight: "20px",
          fontFamily: "var(--font-stetica-medium)",
          color: "var(--text-secondary)",
          whiteSpace: "pre-wrap",
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }),
        }}
      >
        {text}
      </p>

      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          onPointerDown={() => setPressed(true)}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          style={{
            display: "block",
            marginTop: "8px",
            padding: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "var(--font-stetica-medium)",
            color: "var(--accent-primary)",
            transform: pressed ? "scale(0.98)" : "scale(1)",
            transition: "transform 120ms ease-out",
          }}
        >
          {expanded ? "Свернуть" : "Показать полностью"}
        </button>
      ) : null}
    </div>
  );
}
