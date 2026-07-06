"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Phone, Check } from "lucide-react";
import { Sheet } from "../shared/Sheet";
import { Button } from "../shared/Button";
import { useAppSelector } from "@/app/shared/redux/hooks";
import { useLeadSubmit } from "@/app/shared/hooks/useLeadSubmit";
import { extractDigits, formatPhoneInput, isValidRussianPhone } from "@/app/shared/utils/phone";
import type { ICard } from "@/app/types/models";

interface ScheduleViewingSheetProps {
  open: boolean;
  onClose: () => void;
  cards: ICard[];
}

/**
 * Запись на показ из избранного — один шаг: выбрать квартиры и нажать
 * «Записаться». Телефон и имя берутся из профиля, время согласует менеджер.
 * Поле телефона показывается только если в профиле его нет.
 */
export function ScheduleViewingSheet({ open, onClose, cards }: ScheduleViewingSheetProps) {
  const user = useAppSelector((s) => s.auth.user);
  const profilePhone = extractDigits(user?.phone_number ?? "");
  const hasProfilePhone = isValidRussianPhone(profilePhone);

  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(
    () => new Set(cards.slice(0, 3).map((c) => c.id))
  );
  const [phone, setPhone] = useState("");

  // Список избранного мог загрузиться после первого рендера — актуализируем
  // предвыбор при открытии.
  useEffect(() => {
    if (open) {
      setSelectedCardIds(new Set(cards.slice(0, 3).map((c) => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { submit, isSubmitting } = useLeadSubmit({
    successMessage: "Вы записаны! Менеджер позвонит и согласует время показа",
    onSuccess: () => {
      setPhone("");
      onClose();
    },
  });

  const phoneClean = hasProfilePhone ? profilePhone : extractDigits(phone);
  const isValid = selectedCardIds.size > 0 && isValidRussianPhone(phoneClean);

  const toggleCard = (id: number) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    await submit({
      kind: "schedule_viewing",
      phone_number: phoneClean,
      card_ids: Array.from(selectedCardIds),
      name: user?.name || undefined,
    });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Записаться на показ"
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          Записаться
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Выбор квартир */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-stetica-medium)",
                fontSize: 15,
                color: "var(--text-primary)",
              }}
            >
              Какие квартиры показать?
            </h3>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 12,
                color: "var(--text-tertiary)",
              }}
            >
              Выбрано: {selectedCardIds.size}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {cards.map((c) => {
              const checked = selectedCardIds.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCard(c.id)}
                  className="press-scale"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    background: checked
                      ? "color-mix(in srgb, var(--accent-primary) 14%, var(--surface-elevated))"
                      : "var(--surface-elevated)",
                    border: checked
                      ? "1px solid var(--accent-primary)"
                      : "1px solid var(--border-color)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 160ms ease, border-color 160ms ease",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: checked ? "var(--accent-primary)" : "transparent",
                      border: checked ? "1px solid var(--accent-primary)" : "1.5px solid var(--text-tertiary)",
                      color: "#FFFFFF",
                    }}
                  >
                    {checked && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-stetica-medium)",
                        fontSize: 14,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.title}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.price} · {c.address}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Телефон — только если в профиле его нет */}
        {!hasProfilePhone && (
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              borderRadius: 14,
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Phone size={18} strokeWidth={2} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <input
              type="tel"
              inputMode="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 15,
              }}
            />
          </label>
        )}

        {/* Как это работает */}
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--text-secondary)",
          }}
        >
          {hasProfilePhone
            ? `Менеджер позвонит на ${formatPhoneInput(profilePhone)} и согласует удобные дату и время показа.`
            : "Менеджер позвонит и согласует удобные дату и время показа."}
        </p>
      </div>
    </Sheet>
  );
}

// иконки экспорта чтобы импортировать из удобного места
export { Calendar };
