"use client";

import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface PasswordInputProps {
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  label?: string;
  autoComplete?: string;
}

export function PasswordInput({
  register,
  error,
  placeholder = "Введите пароль",
  label = "Пароль",
  autoComplete = "current-password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="relative mt-2">
        <input
          {...register}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: error ? "var(--error)" : "var(--border-color)",
            color: "var(--text-primary)",
            border: "1px solid",
            transition: "all 0.3s ease",
          }}
          className="block w-full rounded-lg px-4 py-3 pr-24 focus:outline-none font-[family-name:var(--font-stetica-regular)]"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          className="absolute inset-y-0 right-4 flex items-center text-sm font-medium cursor-pointer hover:opacity-70 transition-opacity"
          style={{
            color: "var(--accent-primary)",
            transition: "color 0.3s ease, opacity 0.3s ease",
          }}
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
      {error && <span className="text-sm mt-1 block" style={{ color: "var(--error)" }}>{error}</span>}
    </label>
  );
}
