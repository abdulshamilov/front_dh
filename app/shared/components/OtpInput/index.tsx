"use client";

import { useRef, useEffect, useState } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

/**
 * OTP-инпут на одном настоящем поле: ячейки — только визуализация, а весь
 * ввод (набор, вставка из буфера, автозаполнение кода из SMS, WebOTP) идёт
 * в одно невидимое поле поверх них. Это убирает все платформенные проблемы
 * с распределением вставки по нескольким input'ам.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className = "",
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  // Достаёт код из произвольного текста («Kod Dream House: 479153. Deistvitelen
  // 5 minut.»): сначала ищем группу ровно из `length` цифр подряд, иначе первые цифры.
  const extractCode = (text: string): string => {
    const exact = text.match(new RegExp(`\\d{${length}}`));
    if (exact) return exact[0];
    return text.replace(/\D/g, "").slice(0, length);
  };

  const digits = value.replace(/\D/g, "").slice(0, length);

  // Поле неуправляемое: Android-клавиатуры (Gboard и др.) вставляют текст
  // через commitText, и управляемый React-инпут может откатить вставку при
  // ререндере. Значение читаем из DOM и нормализуем руками.
  const handleInput = () => {
    const el = inputRef.current;
    if (!el) return;
    const raw = el.value;
    const cleaned = /\D/.test(raw) ? extractCode(raw) : raw.slice(0, length);
    if (el.value !== cleaned) el.value = cleaned;
    if (cleaned === digits) return;
    onChange(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
  };

  // Синхронизация DOM с внешним значением (например, сброс кода при ошибке).
  useEffect(() => {
    const el = inputRef.current;
    if (el && el.value !== digits) el.value = digits;
  }, [digits]);

  // Автофокус — клавиатура и подсказка кода из SMS появляются без тапа по полю.
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  // WebOTP API — автосчитывание кода из SMS (Android Chrome). На iOS код
  // подставляется через клавиатурную подсказку (autoComplete="one-time-code").
  useEffect(() => {
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;
    const ac = new AbortController();
    navigator.credentials
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .get({ otp: { transport: ["sms"] }, signal: ac.signal } as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((cred: any) => {
        const code = extractCode(String(cred?.code ?? ""));
        if (!code) return;
        onChange(code);
        if (code.length === length) onComplete?.(code);
      })
      .catch(() => {
        /* пользователь отклонил или не поддерживается — молча игнорируем */
      });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeIndex = Math.min(digits.length, length - 1);

  return (
    <div
      className={`relative flex gap-2 justify-center ${className}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Единственное настоящее поле — прозрачное, растянуто поверх ячеек */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        name="one-time-code"
        defaultValue={digits}
        onInput={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        aria-label="Код из SMS"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          color: "transparent",
          textShadow: "none",
          WebkitTextFillColor: "transparent",
          border: "none",
          outline: "none",
          background: "transparent",
          caretColor: "transparent",
          fontSize: 16, // не даёт iOS зумить страницу при фокусе
          cursor: disabled ? "not-allowed" : "text",
          zIndex: 1,
        }}
      />

      {/* Визуальные ячейки */}
      {Array.from({ length }).map((_, index) => {
        const isActive = focused && !disabled && index === activeIndex && digits.length < length;
        return (
          <div
            key={index}
            aria-hidden
            className="w-14 h-16 flex items-center justify-center text-2xl font-bold rounded-2xl border transition-all"
            style={{
              color: "var(--text-primary)",
              backgroundColor: error ? "rgba(255, 68, 68, 0.12)" : "var(--surface)",
              borderColor: error
                ? "var(--error)"
                : isActive
                  ? "var(--text-primary)"
                  : "var(--border-color)",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {digits[index] ?? ""}
            {isActive && (
              <span
                style={{
                  width: 2,
                  height: "1.4em",
                  marginLeft: 1,
                  background: "var(--text-primary)",
                  animation: "otp-caret 1.1s steps(1) infinite",
                }}
              />
            )}
          </div>
        );
      })}
      <style jsx>{`
        @keyframes otp-caret {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
