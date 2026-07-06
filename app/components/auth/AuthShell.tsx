"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Общие блоки экранов авторизации в стиле референса (тёмный минимализм):
 * «Back» сверху, крупный двухстрочный заголовок, серый подзаголовок,
 * минималистичные поля с иконкой и белая «пилюля»-кнопка.
 *
 * Цвета берутся из дизайн-системы (--bg-primary / --text-*), поэтому экран
 * выглядит как в макете в тёмной теме и корректно в светлой.
 */

export function AuthShell({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-svh w-full flex flex-col font-[family-name:var(--font-stetica-bold)]"
      style={{ background: "var(--bg-primary)" }}
    >
      <div
        className="w-full max-w-md mx-auto flex-1 flex flex-col px-6"
        style={{ paddingTop: "max(24px, env(safe-area-inset-top))", paddingBottom: 32 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 -ml-1 mb-8 w-fit"
          style={{ color: "var(--text-primary)" }}
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
          <span className="text-[16px] font-[family-name:var(--font-stetica-regular)]">Back</span>
        </button>

        {children}
      </div>
    </div>
  );
}

export function AuthTitle({ line1, line2 }: { line1: string; line2?: string }) {
  return (
    <h1
      className="text-[40px] leading-[1.05] tracking-tight"
      style={{ color: "var(--text-primary)", fontWeight: 800 }}
    >
      {line1}
      {line2 ? (
        <>
          <br />
          {line2}
        </>
      ) : null}
    </h1>
  );
}

export function AuthSubtitle({ children }: { children: ReactNode }) {
  return (
    <p
      className="mt-4 text-[15px] leading-snug font-[family-name:var(--font-stetica-regular)]"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </p>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-6 p-3 rounded-2xl text-[14px] font-[family-name:var(--font-stetica-regular)]"
      style={{
        backgroundColor: "rgba(255, 68, 68, 0.12)",
        border: "1px solid rgba(255, 68, 68, 0.3)",
        color: "var(--error)",
      }}
    >
      {typeof children === "string" ? children : "Произошла ошибка"}
    </div>
  );
}

export function AuthField({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3 h-14 px-4 rounded-2xl"
      style={{
        background: "var(--input-dark)",
        border: "1px solid var(--border-color)",
      }}
    >
      <span style={{ color: "var(--text-tertiary)", flexShrink: 0, display: "flex" }}>
        {icon}
      </span>
      {children}
    </div>
  );
}

export function AuthSubmit({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-14 rounded-full text-[16px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] ${className}`}
      style={{
        background: "var(--text-primary)",
        color: "var(--bg-primary)",
      }}
    >
      {children}
    </button>
  );
}
