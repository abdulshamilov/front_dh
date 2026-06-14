"use client";

import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PhoneInputProps {
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  label?: string;
  autoComplete?: string;
}

export function PhoneInput({
  register,
  error,
  placeholder = "+7 (___) ___-__-__",
  label = "Номер телефона",
  autoComplete = "tel",
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "");
    let formatted = numbers;
    if (formatted.startsWith("8")) {
      formatted = "7" + formatted.slice(1);
    }
    if (!formatted.startsWith("7") && formatted.length > 0) {
      formatted = "7" + formatted;
    }
    formatted = formatted.slice(0, 11);
    if (formatted.length === 0) return "";
    if (formatted.length === 1) return `+${formatted}`;
    if (formatted.length <= 4) return `+${formatted[0]} (${formatted.slice(1)}`;
    if (formatted.length <= 7) {
      return `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(
        4
      )}`;
    }
    if (formatted.length <= 9) {
      return `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(
        4,
        7
      )}-${formatted.slice(7)}`;
    }
    return `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(
      4,
      7
    )}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
  };

  const getRawPhoneNumber = (formatted: string): string => {
    const numbers = formatted.replace(/\D/g, "");
    return numbers.startsWith("7") ? numbers : "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);
    setDisplayValue(formatted);
    const rawValue = getRawPhoneNumber(formatted);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    if (nativeInputValueSetter && e.target) {
      nativeInputValueSetter.call(e.target, rawValue);
      const event = new Event("input", { bubbles: true });
      e.target.dispatchEvent(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (
      allowedKeys.includes(e.key) ||
      (e.key >= "0" && e.key <= "9") ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const formatted = formatPhoneNumber(pastedText);
    setDisplayValue(formatted);
    const rawValue = getRawPhoneNumber(formatted);
    const target = e.target as HTMLInputElement;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(target, rawValue);
      const event = new Event("input", { bubbles: true });
      target.dispatchEvent(event);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    register.onBlur(e);
  };

  return (
    <label className="block">
      <span
        className="text-[20px]"
        style={{
          color: "var(--text-primary)",
          transition: "color 0.3s ease",
        }}
      >
        {label}
      </span>
      <div className="relative">
        <input
          {...register}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={handleBlur}
          placeholder={placeholder}
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: error ? "var(--error)" : "var(--border-color)",
            color: "var(--text-primary)",
            border: "1px solid",
            transition: "all 0.3s ease",
          }}
          className="mt-2 block w-full rounded-lg px-4 py-3 focus:outline-none font-[family-name:var(--font-stetica-regular)]"
        />
        {displayValue && (
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none"
            style={{
              color: "var(--text-secondary)",
              marginTop: "4px",
            }}
          >
            {getRawPhoneNumber(displayValue).length}/11
          </div>
        )}
      </div>
      {error && (
        <span className="text-sm mt-1 block" style={{ color: "var(--error)" }}>{error}</span>
      )}
    </label>
  );
}
