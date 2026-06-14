"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  Waves,
  GraduationCap,
  Building2,
  Train,
  Check,
  X,
} from "lucide-react";

export type LayerKey = "sea" | "schools" | "mosques" | "transport";

interface LayersChipProps {
  active: Set<LayerKey>;
  onToggle: (key: LayerKey) => void;
  /** Lift above the nearby-strip when it's visible. */
  liftedAboveStrip?: boolean;
}

const LAYERS: {
  key: LayerKey;
  label: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
  color: string;
}[] = [
  {
    key: "sea",
    label: "Море",
    description: "Берег Каспия и пляжи",
    Icon: Waves,
    color: "#1976D2",
  },
  {
    key: "schools",
    label: "Школы и вузы",
    description: "Образование рядом",
    Icon: GraduationCap,
    color: "#FFC107",
  },
  {
    key: "mosques",
    label: "Мечети",
    description: "Главные мечети",
    Icon: Building2,
    color: "#8B6F47",
  },
  {
    key: "transport",
    label: "Транспорт",
    description: "Вокзалы, аэропорт",
    Icon: Train,
    color: "#0A84FF",
  },
];

/**
 * Layers FAB + Google-Maps-style bottom sheet picker.
 *
 * Sheet stays open while the user batches selections (Yandex/Google pattern).
 * Active state shown both as filled colored chip background AND a checkmark —
 * never color-only, so it remains a11y-readable.
 */
export function LayersChip({
  active,
  onToggle,
  liftedAboveStrip = false,
}: LayersChipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const count = active.size;

  return (
    <>
      <div
        ref={wrapRef}
        style={{
          position: "absolute",
          left: 16,
          // Always sit above the persistent strip (~92px tall + padding).
          bottom: liftedAboveStrip
            ? "calc(env(safe-area-inset-bottom, 0px) + 100px)"
            : "calc(env(safe-area-inset-bottom, 0px) + 100px)",
          transition: "bottom 240ms ease",
          zIndex: 22,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Слои на карте"
          aria-expanded={open}
          style={{
            width: 48,
            height: 48,
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(7,7,7,0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--border-glass)",
            borderRadius: 999,
            color: "var(--text-primary)",
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          <Layers size={20} strokeWidth={2.2} />
          {count > 0 && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--accent-primary)",
                borderRadius: 999,
                color: "#FFFFFF",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 10,
                lineHeight: 1,
                boxShadow: "0 0 0 2px rgba(7,7,7,0.85)",
              }}
            >
              {count}
            </span>
          )}
        </button>
      </div>

      {open &&
        mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Слои на карте"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 220,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(6px)",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            />
            <div
              role="document"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 540,
                background: "var(--surface)",
                borderRadius: "20px 20px 0 0",
                borderTop: "1px solid var(--border-glass)",
                padding:
                  "8px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)",
                boxShadow: "0 -16px 48px rgba(0,0,0,0.5)",
                animation: "layers-sheet-up 280ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0 12px",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "var(--font-stetica-bold), system-ui, sans-serif",
                    fontSize: 16,
                    color: "var(--text-primary)",
                  }}
                >
                  Слои на карте
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть"
                  style={{
                    width: 32,
                    height: 32,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: 999,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} strokeWidth={2.4} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {LAYERS.map(({ key, label, description, Icon, color }) => {
                  const isOn = active.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      role="checkbox"
                      aria-checked={isOn}
                      onClick={() => onToggle(key)}
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 6,
                        padding: "12px 14px",
                        minHeight: 88,
                        background: isOn
                          ? "rgba(0,117,255,0.16)"
                          : "var(--bg-primary)",
                        border: isOn
                          ? "1.5px solid var(--accent-primary)"
                          : "1px solid var(--border-glass)",
                        borderRadius: 14,
                        color: "var(--text-primary)",
                        textAlign: "left",
                        cursor: "pointer",
                        transition:
                          "background 160ms ease, border-color 160ms ease",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: 32,
                          height: 32,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: color,
                          borderRadius:
                            key === "transport" ? 8 : 999,
                          color: key === "schools" ? "#1A1A1A" : "#FFFFFF",
                        }}
                      >
                        <Icon size={16} strokeWidth={2.2} />
                      </span>
                      <span
                        style={{
                          fontFamily:
                            "var(--font-stetica-medium), system-ui, sans-serif",
                          fontSize: 14,
                          color: "var(--text-primary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily:
                            "var(--font-inter), system-ui, sans-serif",
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          lineHeight: 1.3,
                        }}
                      >
                        {description}
                      </span>
                      {isOn && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 22,
                            height: 22,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "var(--accent-primary)",
                            borderRadius: 999,
                            color: "#FFFFFF",
                          }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "12px",
                  background: "var(--accent-primary)",
                  border: "none",
                  borderRadius: 12,
                  color: "#FFFFFF",
                  fontFamily:
                    "var(--font-stetica-bold), system-ui, sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Готово
              </button>
            </div>

            <style>{`
              @keyframes layers-sheet-up {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
          </div>,
          document.body
        )}
    </>
  );
}

export default LayersChip;
