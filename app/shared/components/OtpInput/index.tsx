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

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    
    // Разрешаем только цифры
    if (isNaN(Number(val)) && val !== "") {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1); // Берем только последний символ
    setOtp(newOtp);

    // Обновляем родительский компонент
    const otpValue = newOtp.join("");
    onChange(otpValue);

    // Переходим к следующему полю, если введена цифра
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Вызываем onComplete, если все поля заполнены
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
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const pastedArray = pastedData.split("").filter((char) => !isNaN(Number(char)));
    
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
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border-2 focus:outline-none transition-all"
          style={{
            color: "var(--text-primary)",
            backgroundColor: error
              ? "rgba(255, 68, 68, 0.12)"
              : "var(--card-bg)",
            borderColor: error
              ? "var(--error)"
              : "var(--border-color)",
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
