"use client";

import { useState } from "react";
import { FileText, Share2 } from "lucide-react";
import type { ICard } from "@/app/types/models";

/**
 * Mirrors DocumentsSection from DetailContentSections.kt.
 *
 * - No documents (null/empty) → render nothing (Compose: early return).
 * - Each doc = GlassCard (r12), clickable → opens resolved URL in a new tab.
 *   URL resolution copied 1:1 from Compose:
 *     starts with "http"  → as-is
 *     starts with "/"     → "https://api.dreamhouse05.com" + file
 *     else                → "https://api.dreamhouse05.com/media/cards/documents/" + file
 */

// GlassCard surface (same overlay as DetailCharacteristics GlassCard).
const GLASS_STYLE: React.CSSProperties = {
  background: "var(--surface)",
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.016) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function resolveDocUrl(file: string): string {
  if (file.startsWith("http")) return file;
  if (file.startsWith("/")) return `https://api.dreamhouse05.com${file}`;
  return `https://api.dreamhouse05.com/media/cards/documents/${file}`;
}

function DocumentRow({
  title,
  file,
}: {
  title: string;
  file: string;
}) {
  const [pressed, setPressed] = useState(false);

  const release = () => {
    if (pressed) setPressed(false);
  };

  const open = () => {
    window.open(resolveDocUrl(file), "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={open}
      onPointerDown={() => setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      style={{
        ...GLASS_STYLE,
        display: "flex",
        alignItems: "center",
        width: "100%",
        textAlign: "left",
        padding: "12px",
        borderRadius: "12px",
        cursor: "pointer",
        transform: pressed ? "scale(0.98)" : "scale(1)",
        transition: "transform 120ms ease-out",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: "var(--badge-blue)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={24} color="#FFFFFF" aria-hidden="true" />
      </div>

      {/* Spacer 12px (Spacing.md) */}
      <span
        style={{
          marginLeft: "12px",
          flex: 1,
          minWidth: 0,
          fontSize: "14px",
          fontFamily: "var(--font-stetica-medium)",
          color: "var(--text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>

      <Share2 size={20} color="var(--text-tertiary)" aria-hidden="true" />
    </button>
  );
}

export function DocumentsSectionApp({
  documents,
}: {
  documents: ICard["documents"];
}) {
  if (!documents || documents.length === 0) return null;

  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {documents.map((doc) => (
        <DocumentRow key={doc.id} title={doc.title} file={doc.file} />
      ))}
    </div>
  );
}
