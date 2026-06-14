"use client";

import React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "whatsapp";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  "aria-label"?: string;
}

type ButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

function getStyles(variant: Variant, size: Size, fullWidth: boolean) {
  const sizeStyle: React.CSSProperties =
    size === "sm"
      ? { height: 36, padding: "0 14px", fontSize: 13, gap: 6 }
      : size === "lg"
        ? { height: 52, padding: "0 22px", fontSize: 15, gap: 10 }
        : { height: 44, padding: "0 18px", fontSize: 14, gap: 8 };

  const variantStyle: React.CSSProperties =
    variant === "primary"
      ? { background: "var(--accent-primary)", color: "#FFFFFF", border: "1px solid var(--accent-primary)" }
      : variant === "secondary"
        ? { background: "var(--surface-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }
        : variant === "ghost"
          ? { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }
          : variant === "danger"
            ? { background: "var(--error)", color: "#FFFFFF", border: "1px solid var(--error)" }
            : variant === "success"
              ? { background: "var(--success)", color: "#070707", border: "1px solid var(--success)" }
              : /* whatsapp */ { background: "#25D366", color: "#FFFFFF", border: "1px solid #25D366" };

  return {
    ...sizeStyle,
    ...variantStyle,
    width: fullWidth ? "100%" : undefined,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    fontFamily: "var(--font-stetica-medium)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "transform 160ms ease, opacity 160ms ease, background 160ms ease",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  };
}

export function Button({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const styles = getStyles(variant, size, fullWidth);
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`press-scale ${className ?? ""}`}
      style={{
        ...styles,
        opacity: disabled || loading ? 0.5 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? <Spinner /> : iconLeft}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  href,
  external = false,
  className,
  children,
  "aria-label": ariaLabel,
}: LinkProps) {
  const styles = getStyles(variant, size, fullWidth);
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`press-scale ${className ?? ""}`}
      style={styles}
      {...linkProps}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        borderRadius: "50%",
        display: "inline-block",
        animation: "btn-spin 700ms linear infinite",
      }}
    >
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
