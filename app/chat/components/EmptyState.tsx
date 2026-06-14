"use client";

import { Wallet, Home, Sparkles, Percent, type LucideIcon } from "lucide-react";
import { AIAvatar } from "./AIAvatar";

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
  disabled?: boolean;
}

interface Suggestion {
  icon: LucideIcon;
  label: string;
}

// Mirror mobile AIScreen.kt
const SUGGESTIONS: ReadonlyArray<Suggestion> = [
  { icon: Wallet, label: "Квартиры до 5 миллионов" },
  { icon: Home, label: "Студии в центре" },
  { icon: Sparkles, label: "Новостройки со сданными домами" },
  { icon: Percent, label: "Что насчёт акций?" },
];

export function EmptyState({ onSuggestionClick, disabled = false }: EmptyStateProps) {
  return (
    <div
      role="region"
      aria-label="Начать диалог"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "24px 16px",
        maxWidth: 580,
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* AI avatar с glow */}
      <div
        className="animate-scale-in"
        style={{
          position: "relative",
          width: 88,
          height: 88,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--accent-primary) 35%, transparent) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
        <AIAvatar size="lg" />
      </div>

      {/* Title — h2 для согласованности с shared EmptyState */}
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-stetica-bold)",
          fontSize: 22,
          lineHeight: 1.2,
          textAlign: "center",
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}
        className="empty-chat-title"
      >
        Чем могу помочь?
      </h2>

      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--text-secondary)",
          textAlign: "center",
          maxWidth: 380,
        }}
      >
        Подберу квартиру под ваши критерии за секунду — опишите что ищете
      </p>

      {/* Tile-suggestions: иконка в tinted bg + label под ней */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          width: "100%",
          marginTop: 8,
        }}
      >
        {SUGGESTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              type="button"
              disabled={disabled}
              onClick={() => onSuggestionClick(s.label)}
              className="press-scale animate-fadeSlideUp"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: 14,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                textAlign: "left",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 13,
                lineHeight: 1.3,
                color: "var(--text-primary)",
                transition: "background 160ms ease, border-color 160ms ease",
                animationDelay: `${i * 60}ms`,
                minHeight: 56,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "color-mix(in srgb, var(--accent-primary) 14%, transparent)",
                  color: "var(--accent-primary)",
                }}
              >
                <Icon size={16} strokeWidth={2.2} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .empty-chat-title {
            font-size: 28px !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.animate-scale-in),
          :global(.animate-fadeSlideUp) {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
