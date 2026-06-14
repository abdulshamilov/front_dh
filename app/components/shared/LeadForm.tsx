"use client";

import { useState } from "react";
import { useLeadSubmit } from "@/app/shared/hooks/useLeadSubmit";
import { extractDigits, formatPhoneInput, isValidRussianPhone } from "@/app/shared/utils/phone";
import { SHORT_PHONE_DISPLAY } from "@/app/shared/utils/contacts";

interface LeadFormProps {
  variant?: "hero" | "card";
  onSuccess?: () => void;
  /** Source-метка для CRM. По умолчанию "site". */
  source?: string;
}

export function LeadForm({ variant = "card", onSuccess, source = "site" }: LeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);

  const { submit, isSubmitting, error } = useLeadSubmit({
    silentSuccess: true, // у формы свой inline-checkmark — toast не нужен
    silentError: true, // у формы свой inline error-блок — toast не нужен
    onSuccess: () => {
      setSuccess(true);
      setName("");
      setPhone("");
      onSuccess?.();
    },
  });

  const isValid = name.trim().length >= 2 && isValidRussianPhone(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    await submit({
      kind: "callback",
      name: name.trim(),
      phone_number: extractDigits(phone),
      source,
    });
  };

  // Показываем простой fallback-текст ошибки для inline-display в форме —
  // toast уже показывается из useLeadSubmit при ошибке.
  const displayError = error
    ? `${error}. Позвоните нам: ${SHORT_PHONE_DISPLAY}`
    : null;

  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-8"
        style={{ color: "#1EED61" }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="32"
            r="30"
            stroke="#1EED61"
            strokeWidth="3"
            className="animate-scale-in"
          />
          <path
            d="M20 32L28 40L44 24"
            stroke="#1EED61"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 50,
              strokeDashoffset: 0,
              animation: "checkmark-draw 0.5s ease 0.3s both",
            }}
          />
        </svg>
        <p
          className="text-lg text-center"
          style={{
            fontFamily: "var(--font-stetica-bold)",
            color: "#FFFFFF",
          }}
        >
          Заявка отправлена!
        </p>
        <p
          className="text-sm text-center"
          style={{ color: "#AAABAC" }}
        >
          Мы перезвоним вам в ближайшее время
        </p>
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <input
        type="text"
        placeholder="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3.5 rounded-full outline-none transition-all text-base"
        style={{
          backgroundColor: isHero ? "rgba(255,255,255,0.1)" : "#1F1E2B",
          color: "#FFFFFF",
          border: "1px solid rgba(255,255,255,0.15)",
          fontFamily: "var(--font-stetica-regular)",
        }}
      />
      <input
        type="tel"
        placeholder="+7 (999) 999-99-99"
        value={phone}
        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        className="w-full px-4 py-3.5 rounded-full outline-none transition-all text-base"
        style={{
          backgroundColor: isHero ? "rgba(255,255,255,0.1)" : "#1F1E2B",
          color: "#FFFFFF",
          border: "1px solid rgba(255,255,255,0.15)",
          fontFamily: "var(--font-stetica-regular)",
        }}
      />
      {displayError && (
        <div
          className="px-4 py-2.5 rounded-xl text-sm"
          style={{
            backgroundColor: "rgba(255, 68, 68, 0.12)",
            border: "1px solid rgba(255, 68, 68, 0.3)",
            color: "#FF4444",
            fontFamily: "var(--font-stetica-regular)",
          }}
        >
          {displayError}
        </div>
      )}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full py-4 rounded-full text-base transition-all cursor-pointer"
        style={{
          backgroundColor: isValid ? "#0075FF" : "rgba(0,117,255,0.4)",
          color: "#FFFFFF",
          fontFamily: "var(--font-stetica-bold)",
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? "Отправляем..." : "Перезвоните мне"}
      </button>
      <p
        className="text-xs text-center"
        style={{ color: "#77797B" }}
      >
        Нажимая кнопку, вы соглашаетесь с{" "}
        <a
          href="/politic_conf.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80"
        >
          политикой конфиденциальности
        </a>
      </p>
    </form>
  );
}
