"use client";

import React from "react";

export type PageHeroAccent = "favorite" | "sale" | "primary" | string;

export interface PageHeroProps {
  title: string;
  icon?: React.ReactNode;
  accent?: PageHeroAccent;
  subtitle?: React.ReactNode;
  /** показывать декоративный glow за иконкой */
  showGlow?: boolean;
  /** правый слот для иконок-кнопок (Share, Compare и т.п.) */
  actions?: React.ReactNode;
  className?: string;
}

function resolveAccent(accent: PageHeroAccent): string {
  const map: Record<string, string> = {
    favorite: "var(--favorite)",
    sale: "var(--brand-blue-button)",
    primary: "var(--accent-primary)",
  };
  return map[accent] ?? accent;
}

export function PageHero({
  title,
  icon,
  accent = "primary",
  subtitle,
  showGlow = true,
  actions,
  className = "",
}: PageHeroProps) {
  const accentColor = resolveAccent(accent);

  return (
    <div
      className={`relative flex items-start justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Icon с glow */}
        {icon && (
          <div
            className="relative flex-shrink-0"
            style={{ width: 44, height: 44 }}
          >
            {showGlow && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, color-mix(in srgb, ${accentColor} 30%, transparent) 0%, transparent 70%)`,
                  filter: "blur(10px)",
                  pointerEvents: "none",
                }}
              />
            )}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: `color-mix(in srgb, ${accentColor} 16%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accentColor} 30%, transparent)`,
                color: accentColor,
              }}
            >
              {icon}
            </div>
          </div>
        )}

        <div className="flex flex-col min-w-0 flex-1" style={{ paddingTop: 2 }}>
          <h1
            className="text-xl sm:text-2xl lg:text-[28px] font-[family-name:var(--font-stetica-bold)] m-0"
            style={{ color: "var(--text-primary)", lineHeight: 1.2, letterSpacing: "-0.01em" }}
          >
            {title}
          </h1>
          {subtitle !== undefined && subtitle !== null && (
            <div
              className="text-xs sm:text-sm font-[family-name:var(--font-inter)] mt-1"
              style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex-shrink-0 flex items-center gap-1.5">{actions}</div>
      )}
    </div>
  );
}
