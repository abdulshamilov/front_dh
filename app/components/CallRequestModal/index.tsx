"use client";

import { useState, useEffect } from "react";
import { useLeadSubmit } from "@/app/shared/hooks/useLeadSubmit";
import {
  extractDigits,
  formatPhoneInput,
} from "@/app/shared/utils/phone";

interface CallRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: number;
}

export function CallRequestModal({
  isOpen,
  onClose,
  cardId,
}: CallRequestModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");

  const { submit, isSubmitting } = useLeadSubmit({
    onSuccess: () => {
      setName("");
      setPhone("");
      setTime("");
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      kind: "call_request",
      cardId,
      phone_number: extractDigits(phone),
      name,
      preferred_time: time || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--overlay-scrim)",
          backdropFilter: "blur(4px)",
        }}
      />

      <div
        className="relative w-full max-w-md rounded-[24px] shadow-2xl p-6 sm:p-8"
        style={{
          backgroundColor: "var(--modal-bg)",
          border: "1px solid var(--border-glass)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors"
          style={{
            color: "var(--text-secondary)",
          }}
          aria-label="Закрыть"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h2
          className="text-2xl mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-stetica-medium)",
          }}
        >
          Оставить заявку
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Ваш номер телефона
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              required
              className="w-full px-4 py-3 rounded-full outline-none transition-all"
              style={{
                backgroundColor: "var(--input-dark)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Ваше имя
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full outline-none transition-all"
              style={{
                backgroundColor: "var(--input-dark)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
              placeholder="Введите ваше имя"
            />
          </div>

          <div>
            <label
              htmlFor="time"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Выберите удобное время для звонка
            </label>
            <select
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-full outline-none transition-all cursor-pointer"
              style={{
                backgroundColor: "var(--input-dark)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <option value="">Выберите время</option>
              <option value="morning">Утро (9:00 - 12:00)</option>
              <option value="afternoon">День (12:00 - 15:00)</option>
              <option value="evening">Вечер (15:00 - 18:00)</option>
              <option value="late">Поздний вечер (18:00 - 21:00)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-[16px] transition-all duration-300 cursor-pointer"
            style={{
              fontFamily: "var(--font-stetica-bold)",
              backgroundColor: "var(--accent-primary)",
              color: "#FFFFFF",
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Отправка..." : "Отправить"}
          </button>
        </form>
      </div>
    </div>
  );
}
