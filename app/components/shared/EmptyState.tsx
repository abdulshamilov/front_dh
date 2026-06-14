"use client";

import React from "react";
import Link from "next/link";

export interface EmptyStateCta {
  icon: React.ReactNode;
  title: string;
  href: string;
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  accentColor?: string;
  title: string;
  description?: React.ReactNode;
  features?: React.ReactNode;
  ctas?: EmptyStateCta[];
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  accentColor = "var(--accent-primary)",
  title,
  description,
  features,
  ctas,
  primaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-12 px-5 sm:py-14 sm:px-8 rounded-[24px] flex flex-col items-center gap-5 ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Icon с двойным glow */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 88, height: 88 }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle, color-mix(in srgb, ${accentColor} 35%, transparent) 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: `color-mix(in srgb, ${accentColor} 18%, transparent)`,
            border: `1px solid color-mix(in srgb, ${accentColor} 35%, transparent)`,
          }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>

      {/* Title */}
      <h2
        className="text-xl sm:text-2xl font-[family-name:var(--font-stetica-bold)] m-0"
        style={{ color: "var(--text-primary)", lineHeight: 1.2 }}
      >
        {title}
      </h2>

      {/* Description */}
      {description !== undefined && description !== null && (
        <p
          className="text-sm sm:text-base max-w-md m-0"
          style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}
        >
          {description}
        </p>
      )}

      {/* Features list */}
      {features !== undefined && features !== null && (
        <div
          className="flex flex-col gap-2.5 items-start text-left max-w-sm mx-auto w-full mt-1"
          style={{ paddingLeft: 4 }}
        >
          {features}
        </div>
      )}

      {/* CTA tiles */}
      {ctas && ctas.length > 0 && (
        <div
          className="grid grid-cols-3 gap-2.5 w-full max-w-md mt-2"
        >
          {ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="press-scale"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 8px",
                borderRadius: 16,
                backgroundColor: "var(--surface-elevated)",
                color: "var(--text-primary)",
                textDecoration: "none",
                border: "1px solid var(--border-color)",
                transition: "background 160ms ease, border-color 160ms ease",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
                  color: accentColor,
                }}
              >
                {cta.icon}
              </span>
              <span
                className="text-xs font-[family-name:var(--font-stetica-medium)] text-center"
                style={{ color: "var(--text-primary)", lineHeight: 1.3 }}
              >
                {cta.title}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Primary action button */}
      {primaryAction && (
        primaryAction.href ? (
          <Link
            href={primaryAction.href}
            className="press-scale inline-flex items-center justify-center mt-2"
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 12,
              background: "var(--accent-primary)",
              color: "#FFFFFF",
              fontFamily: "var(--font-stetica-medium)",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            {primaryAction.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={primaryAction.onClick}
            className="press-scale inline-flex items-center justify-center mt-2"
            style={{
              height: 44,
              padding: "0 22px",
              borderRadius: 12,
              background: "var(--accent-primary)",
              color: "#FFFFFF",
              fontFamily: "var(--font-stetica-medium)",
              fontSize: 14,
              border: "none",
              cursor: "pointer",
            }}
          >
            {primaryAction.label}
          </button>
        )
      )}
    </div>
  );
}
