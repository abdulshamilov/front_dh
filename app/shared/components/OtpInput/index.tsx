"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className = "",
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Достаёт код из произвольного текста («Kod Dream House: 479153. Deistvitelen 5 minut.»):
  // сначала ищем группу ровно из `length` цифр подряд, иначе берём первые цифры.
  const extractCode = (text: string): string => {
    const exact = text.match(new RegExp(`\\d{${length}}`));
    if (exact) return exact[0];
    return text.replace(/\D/g, "").slice(0, length);
  };

  useEffect(() => {
    // Синхронизируем внутреннее состояние с внешним value
    if (value) {
      const otpArray = value.split("").slice(0, length);
      const newOtp = new Array(length).fill("");
      otpArray.forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);
    } else {
      setOtp(new Array(length).fill(""));
    }
  }, [value, length]);

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
        const newOtp = new Array(length).fill("");
        code.split("").forEach((c, i) => {
          if (i < length) newOtp[i] = c;
        });
        setOtp(newOtp);
        onChange(code);
        if (code.length === length) onComplete?.(code);
      })
      .catch(() => {
        /* пользователь отклонил или не поддерживается — молча игнорируем */
      });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Заполнить несколько ячеек сразу (автозаполнение SMS / вставка).
  const fillFrom = (digits: string, index: number) => {
    const newOtp = [...otp];
    for (let i = 0; i < digits.length && index + i < length; i++) {
      newOtp[index + i] = digits[i];
    }
    setOtp(newOtp);
    const otpValue = newOtp.join("");
    onChange(otpValue);
    const nextIndex = Math.min(index + digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const raw = element.value;
    const digits = raw.replace(/\D/g, "");

    // Нецифровой символ — игнорируем.
    if (raw !== "" && digits === "") {
      return;
    }

    // Автозаполнение из SMS (iOS/Android) кидает весь текст сообщения в одно
    // поле — вытаскиваем из него код и распределяем по ячейкам.
    if (digits.length > 1) {
      fillFrom(extractCode(raw), index);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digits.slice(-1);
    setOtp(newOtp);

    const otpValue = newOtp.join("");
    onChange(otpValue);

    if (digits && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (otpValue.length === length) {
      onComplete?.(otpValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Обработка Backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Обработка стрелок
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedArray = extractCode(e.clipboardData.getData("text")).split("");

    if (pastedArray.length > 0) {
      const newOtp = [...otp];
      pastedArray.forEach((char, index) => {
        if (index < length) {
          newOtp[index] = char;
        }
      });
      setOtp(newOtp);
      
      const otpValue = newOtp.join("");
      onChange(otpValue);
      
      // Фокус на последнее заполненное поле или следующее пустое
      const nextIndex = Math.min(pastedArray.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (otpValue.length === length) {
        onComplete?.(otpValue);
      }
    }
  };

  return (
    <div className={`flex gap-2 justify-center ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          name={index === 0 ? "one-time-code" : undefined}
          maxLength={index === 0 ? undefined : 1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--error)"
              : "var(--text-primary)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? "var(--error)"
              : "var(--border-color)";
          }}
          disabled={disabled}
          className="w-14 h-16 text-center text-2xl font-bold rounded-2xl border focus:outline-none transition-all"
          style={{
            color: "var(--text-primary)",
            backgroundColor: error
              ? "rgba(255, 68, 68, 0.12)"
              : "var(--surface)",
            borderColor: error ? "var(--error)" : "var(--border-color)",
            boxShadow: "none",
            outline: "none",
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
      ))}
    </div>
  );
}
