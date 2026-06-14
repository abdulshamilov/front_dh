"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Phone, Check } from "lucide-react";
import { Sheet } from "../shared/Sheet";
import { Button } from "../shared/Button";
import { useLeadSubmit } from "@/app/shared/hooks/useLeadSubmit";
import { extractDigits, formatPhoneInput, isValidRussianPhone } from "@/app/shared/utils/phone";
import type { ICard } from "@/app/types/models";

interface ScheduleViewingSheetProps {
  open: boolean;
  onClose: () => void;
  cards: ICard[];
}

const TIME_SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];

function getNextDates(count = 7): Date[] {
  const dates: Date[] = [];
  let d = new Date();
  while (dates.length < count) {
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    if (d.getDay() === 0) continue; // skip sundays
    dates.push(new Date(d));
  }
  return dates;
}

function formatDate(d: Date): string {
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export function ScheduleViewingSheet({ open, onClose, cards }: ScheduleViewingSheetProps) {
  const dates = useMemo(() => getNextDates(7), []);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(
    () => new Set(cards.slice(0, 3).map((c) => c.id))
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const { submit, isSubmitting } = useLeadSubmit({
    onSuccess: () => {
      // Сбрасываем форму чтобы при повторном открытии Sheet'а юзер
      // видел чистое состояние
      setPhone("");
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedCardIds(new Set(cards.slice(0, 3).map((c) => c.id)));
      onClose();
    },
  });

  const phoneClean = extractDigits(phone);
  const isValid =
    selectedCardIds.size > 0 &&
    !!selectedDate &&
    !!selectedTime &&
    isValidRussianPhone(phoneClean);

  const toggleCard = (id: number) => {
    setSelectedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isValid || !selectedDate || !selectedTime) return;
    const dateStr = selectedDate.toISOString().slice(0, 10); // YYYY-MM-DD
    await submit({
      kind: "schedule_viewing",
      phone_number: phoneClean,
      card_ids: Array.from(selectedCardIds),
      date: dateStr,
      time: selectedTime,
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
        {/* Step 1: cards */}
        <Section
          step={1}
          title="Какие квартиры показать?"
          subtitle={`Выбрано: ${selectedCardIds.size}`}
        >
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
        </Section>

        {/* Step 2: дата */}
        <Section step={2} title="Когда удобно?">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {dates.map((d) => {
              const active = selectedDate?.toDateString() === d.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className="press-scale"
                  style={{
                    flexShrink: 0,
                    minWidth: 80,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: active ? "var(--accent-primary)" : "var(--surface-elevated)",
                    color: active ? "#FFFFFF" : "var(--text-primary)",
                    border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                    fontFamily: "var(--font-stetica-medium)",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background 160ms ease",
                    textAlign: "center",
                  }}
                  aria-pressed={active}
                >
                  {formatDate(d)}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Step 3: время */}
        {selectedDate && (
          <Section step={3} title="Во сколько?">
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((t) => {
                const active = selectedTime === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTime(t)}
                    className="press-scale"
                    aria-pressed={active}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 999,
                      background: active ? "var(--accent-primary)" : "var(--surface-elevated)",
                      color: active ? "#FFFFFF" : "var(--text-primary)",
                      border: active ? "1px solid var(--accent-primary)" : "1px solid var(--border-color)",
                      fontFamily: "var(--font-stetica-medium)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Step 4: телефон */}
        {selectedDate && selectedTime && (
          <Section step={4} title="Куда позвонить?">
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
          </Section>
        )}
      </div>
    </Sheet>
  );
}

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-color)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-stetica-medium)",
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          {step}
        </span>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-stetica-medium)",
            fontSize: 15,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 12,
              color: "var(--text-tertiary)",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// иконки экспорта чтобы импортировать из удобного места
export { Calendar };
