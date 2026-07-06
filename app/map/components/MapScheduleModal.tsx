"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLeadSubmit } from "@/app/shared/hooks/useLeadSubmit";
import {
  extractDigits,
  formatPhoneInput,
} from "@/app/shared/utils/phone";

interface MapScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Название объекта — передаётся как поле jk в /api/leads/. */
  jk: string;
}

export function MapScheduleModal({ isOpen, onClose, jk }: MapScheduleModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);

  const { submit, isSubmitting } = useLeadSubmit({
    silentSuccess: true,
    onSuccess: () => {
      setDone(true);
    },
  });

  // Закрываем overlay-скроллинг пока модалка открыта
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Сброс при повторном открытии
  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setDone(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneInput(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      kind: "map_viewing",
      name,
      phone: extractDigits(phone),
      jk,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Записаться на показ"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      {/* Затемнённый фон */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          background: "var(--surface)",
          border: "1px solid var(--border-glass)",
          borderRadius: 24,
          padding: "28px 24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--border-glass)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 999,
                background: "rgba(241,17,126,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="#F1117E"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
                fontSize: 20,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              Заявка отправлена!
            </div>
            <div
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              В скором времени с вами свяжется менеджер
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
                fontSize: 20,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Записаться на показ
            </div>
            {jk && (
              <div
                style={{
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 20,
                  lineHeight: 1.4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {jk}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  htmlFor="msp-name"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Ваше имя
                </label>
                <input
                  id="msp-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Введите ваше имя"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "var(--input-dark, rgba(255,255,255,0.05))",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="msp-phone"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  Номер телефона
                </label>
                <input
                  id="msp-phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  placeholder="+7 (___) ___-__-__"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    background: "var(--input-dark, rgba(255,255,255,0.05))",
                    border: "1px solid var(--border-color, rgba(255,255,255,0.12))",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 15,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "#F1117E",
                  color: "#fff",
                  fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
                  fontSize: 15,
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: "opacity 160ms ease",
                }}
              >
                {isSubmitting ? "Отправка..." : "Записаться на показ"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default MapScheduleModal;
