"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  // Portal-target — рендерим в document.body чтобы избежать stacking-context
  // и blur-фильтров родительских элементов (Header).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const sheet = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "sheet-title" : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      {/* Scrim — кликабельный фон */}
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          animation: "sheet-fade 200ms ease-out",
        }}
      />

      {/* Sheet body */}
      <div
        style={{
          position: "relative",
          marginTop: "auto",
          width: "100%",
          maxWidth: 540,
          maxHeight: "90vh",
          background: "var(--bg-primary)",
          border: "1px solid var(--border-color)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "sheet-up 240ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 -24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--border-color)",
            background: "var(--bg-primary)",
          }}
        >
          {title ? (
            <h2
              id="sheet-title"
              style={{
                margin: 0,
                fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
                fontSize: 18,
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="press-scale"
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content scroll */}
        <div
          style={{
            overflow: "auto",
            padding: "16px 20px",
            flex: 1,
            background: "var(--bg-primary)",
          }}
        >
          {children}
        </div>

        {/* Footer (sticky) — учитывает BottomBar (~80px) и safe-area iPhone */}
        {footer && (
          <div
            style={{
              padding:
                "12px 20px calc(env(safe-area-inset-bottom, 0px) + 12px)",
              borderTop: "1px solid var(--border-color)",
              background: "var(--bg-primary)",
            }}
          >
            {footer}
          </div>
        )}

        <style>{`
          @keyframes sheet-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes sheet-fade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
