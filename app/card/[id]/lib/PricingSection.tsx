"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/app/shared/config/axios";
import type { ICardPricing, IInstallmentMatch } from "@/app/types/models";
import { formatPrice } from "@/app/card/[id]/lib";

const BLUE = "#0075FF";

function Row({ label, value, faded, last }: { label: string; value: React.ReactNode; faded?: boolean; last?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
      padding: "12px 0", borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.07)",
    }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-stetica-medium)" }}>
        {label}
      </span>
      <span style={{
        fontSize: 14, fontFamily: "var(--font-stetica-bold)", textAlign: "right",
        color: faded ? "rgba(255,255,255,0.25)" : "#FFFFFF",
        transition: "color 0.15s", whiteSpace: "nowrap",
      }}>
        {value}
      </span>
    </div>
  );
}

function InputSlider({
  label,
  value,
  min,
  max,
  step,
  minLabel,
  maxLabel,
  unit,
  onValueChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  unit: string;
  onValueChange: (v: number) => void;
}) {
  const fmt = (n: number) =>
    unit === "мес." ? String(n) : new Intl.NumberFormat("ru-RU").format(n);

  const [display, setDisplay] = useState(fmt(value));

  useEffect(() => {
    setDisplay(fmt(value));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const commit = (raw: string) => {
    const n = parseInt(raw.replace(/\D/g, ""), 10);
    const clamped = isNaN(n) ? min : clamp(n);
    setDisplay(fmt(clamped));
    onValueChange(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplay(e.target.value);
  };

  const handleBlur = () => commit(display);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setDisplay(fmt(v));
    onValueChange(v);
  };

  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 12 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-stetica-medium)" }}>
          {label}
        </span>
        {/* Поле ввода — нейтральный инпут */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 10, padding: "6px 12px",
        }}>
          <input
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              background: "transparent", border: "none", outline: "none",
              color: "#FFFFFF", fontFamily: "var(--font-stetica-bold)", fontSize: 14,
              width: unit === "мес." ? 36 : 88,
              textAlign: "right",
              padding: 0,
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-stetica-bold)", fontSize: 14, flexShrink: 0 }}>
            {unit}
          </span>
        </div>
      </div>

      <div style={{ position: "relative", height: 32, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 5,
          borderRadius: 3, background: "rgba(255,255,255,0.1)",
        }} />
        <div style={{
          position: "absolute", left: 0, height: 5,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${BLUE} 0%, #00D4FF 100%)`,
          width: `${pct}%`, transition: "width 0.04s",
          pointerEvents: "none",
        }} />
        <input
          type="range"
          min={min} max={max} step={step}
          value={Math.min(Math.max(value, min), max)}
          onChange={handleSlider}
          style={{
            position: "absolute", left: 0, right: 0, width: "100%",
            appearance: "none", WebkitAppearance: "none",
            background: "transparent", cursor: "pointer",
            margin: 0, padding: 0, height: 32,
            touchAction: "pan-y",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-stetica-medium)" }}>
          {minLabel}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-stetica-medium)" }}>
          {maxLabel}
        </span>
      </div>
    </div>
  );
}

export function PricingSection({ cardId }: { cardId: number }) {
  const [options, setOptions] = useState<ICardPricing | null>(null);
  const [planId, setPlanId] = useState<number | null>(null);
  const [termVal, setTermVal] = useState(0);
  const [downVal, setDownVal] = useState(0);
  // Точный диапазон взноса выбранного тарифа (down_payment_from/to
  // из /installment/match/); null — бэкенд недоступен, границы
  // считаются из payment-options.
  const [planRange, setPlanRange] = useState<{ planId: number; from: number; to: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Подтягивает реальные условия тарифа: слайдер взноса работает
  // строго в границах выбранного тарифа.
  const fetchPlanRange = useCallback(
    (pId: number, downMin: number, term: number) => {
      axiosInstance
        .post<IInstallmentMatch>(`/cards/${cardId}/installment/match/`, {
          down_payment: String(downMin),
          term_months: term,
        })
        .then((res) => {
          setPlanRange({
            planId: res.data.plan_id,
            from: Math.round(Number(res.data.down_payment_from)),
            to: Math.round(Number(res.data.down_payment_to)),
          });
        })
        .catch(() => setPlanRange(null));
    },
    [cardId]
  );

  useEffect(() => {
    setLoading(true);
    setError(false);

    axiosInstance
      .get<ICardPricing>(`/cards/${cardId}/payment-options/`)
      .then((res) => {
        setOptions(res.data);
        const opts = [...(res.data.installment_options ?? [])].sort(
          (a, b) => Number(a.down_payment_min_amount) - Number(b.down_payment_min_amount)
        );
        if (opts.length) {
          // По умолчанию выбран тариф с минимальным взносом
          const first = opts[0];
          setPlanId(first.id);
          setTermVal(Number(first.term_months));
          const minD = Math.round(Number(first.down_payment_min_amount));
          setDownVal(minD);
          fetchPlanRange(first.id, minD, Number(first.term_months));
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [cardId, fetchPlanRange]);

  const plans = useMemo(
    () =>
      [...(options?.installment_options ?? [])].sort(
        (a, b) => Number(a.down_payment_min_amount) - Number(b.down_payment_min_amount)
      ),
    [options]
  );

  if (loading) return <PricingSkeleton />;
  if (error || !options || !plans.length) return <PricingEmpty />;

  // Сначала выбирается тариф (плашка), ползунки работают только
  // в границах выбранного тарифа — переключение между тарифами
  // ползунком невозможно, никаких скачков шкалы.
  const active = plans.find((p) => p.id === planId) ?? plans[0];

  const total = Math.round(Number(active.total_price));
  const minDown = Math.round(Number(active.down_payment_min_amount));
  const DOWN_STEP = 1_000;
  // Границы взноса — из условий выбранного тарифа (бэкенд).
  // Фолбэк без /installment/match/: до следующего тарифа либо до
  // полной стоимости (не включая её) у последнего.
  let maxDown: number;
  if (planRange && planRange.planId === active.id) {
    maxDown = planRange.to;
  } else {
    const activeIdx = plans.findIndex((p) => p.id === active.id);
    const nextPlanMin =
      activeIdx >= 0 && plans[activeIdx + 1]
        ? Math.round(Number(plans[activeIdx + 1].down_payment_min_amount))
        : null;
    maxDown = active.down_payment_max_amount
      ? Math.round(Number(active.down_payment_max_amount))
      : total - DOWN_STEP;
    if (nextPlanMin != null) maxDown = Math.min(maxDown, nextPlanMin - DOWN_STEP);
  }
  // Если явный максимум взноса у тарифа не задан, ограничиваем 90%
  // стоимости: взнос почти в полную цену превращает рассрочку в
  // бессмысленные платежи по несколько рублей в месяц.
  if (!active.down_payment_max_amount) {
    maxDown = Math.min(maxDown, Math.round(total * 0.9));
  }
  // Выравнивание по шагу, чтобы ползунок доезжал до максимума
  maxDown = Math.max(
    minDown,
    minDown + Math.floor((maxDown - minDown) / DOWN_STEP) * DOWN_STEP
  );
  const maxTerm = Number(active.term_months);

  const down = Math.min(Math.max(downVal, minDown), maxDown);
  const term = Math.min(Math.max(termVal, 1), maxTerm);
  const monthly = term > 0 ? Math.max(0, Math.round((total - down) / term)) : 0;
  const perSqm = Math.round(Number(active.price_per_sqm));

  const handlePlan = (p: (typeof plans)[number]) => {
    setPlanId(p.id);
    // Ползунки сбрасываются в границы нового тарифа
    const minP = Math.round(Number(p.down_payment_min_amount));
    setDownVal(minP);
    setTermVal(Number(p.term_months));
    setPlanRange(null);
    fetchPlanRange(p.id, minP, Number(p.term_months));
  };

  const activePlanId = active.id;
  const calcLoading = false;

  const downPct = total > 0 ? Math.round((down / total) * 100) : 0;

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div style={{
        borderRadius: 24, overflow: "hidden",
        background: "var(--surface, #1D2024)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>

        {/* Hero — ежемесячный платёж на градиенте */}
        <div style={{
          padding: "22px 18px 20px",
          background: "linear-gradient(135deg, #0075FF 0%, #0057D6 60%, #003E9C 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Декоративный блик */}
          <div style={{
            position: "absolute", top: -60, right: -40, width: 180, height: 180,
            borderRadius: "50%", background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }} />
          <div style={{
            fontSize: 11, fontFamily: "var(--font-stetica-bold)",
            color: "rgba(255,255,255,0.72)", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: 8,
          }}>
            Ежемесячный платёж
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 34, fontFamily: "var(--font-stetica-bold)", lineHeight: 1,
              color: "#FFFFFF",
              opacity: calcLoading ? 0.4 : 1,
              transition: "opacity 0.15s",
            }}>
              {formatPrice(Math.round(Number(monthly)))} ₽
            </span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", fontFamily: "var(--font-stetica-medium)" }}>
              / мес.
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 12, fontFamily: "var(--font-stetica-medium)", color: "#FFFFFF",
              background: "rgba(255,255,255,0.16)", borderRadius: 999, padding: "5px 12px",
            }}>
              {term} мес.
            </span>
            <span style={{
              fontSize: 12, fontFamily: "var(--font-stetica-medium)", color: "#FFFFFF",
              background: "rgba(255,255,255,0.16)", borderRadius: 999, padding: "5px 12px",
            }}>
              Взнос {downPct}%
            </span>
          </div>
        </div>

        {/* Варианты рассрочки: разный взнос → разная цена за м².
            Горизонтальный скролл — плашки не сжимаются на узких экранах */}
        {plans.length > 1 && (
          <div
            className="plans-scroll"
            style={{
              display: "flex", gap: 8, padding: "16px 18px 2px",
              overflowX: "auto", WebkitOverflowScrolling: "touch",
              scrollSnapType: "x proximity",
            }}
          >
            {plans.map((p) => {
              const active = p.id === activePlanId;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePlan(p)}
                  style={{
                    flex: plans.length > 2 ? "0 0 auto" : 1,
                    minWidth: plans.length > 2 ? 150 : 0,
                    cursor: "pointer", textAlign: "left",
                    scrollSnapAlign: "start",
                    borderRadius: 14, padding: "12px 14px",
                    background: active ? "rgba(0,117,255,0.14)" : "rgba(255,255,255,0.05)",
                    border: `1.5px solid ${active ? BLUE : "rgba(255,255,255,0.1)"}`,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div style={{
                    fontSize: 11, color: active ? "rgba(0,117,255,0.9)" : "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-stetica-medium)", marginBottom: 4, whiteSpace: "nowrap",
                  }}>
                    Взнос от {formatPrice(Math.round(Number(p.down_payment_min_amount)))} ₽
                  </div>
                  <div style={{
                    fontSize: 15, fontFamily: "var(--font-stetica-bold)", whiteSpace: "nowrap",
                    color: "#FFFFFF",
                  }}>
                    {formatPrice(Math.round(Number(p.price_per_sqm)))} ₽/м²
                  </div>
                  {p.floor_label && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3, whiteSpace: "nowrap" }}>
                      {p.floor_label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Слайдеры */}
        <div style={{ padding: "18px 18px 6px", display: "flex", flexDirection: "column", gap: 20 }}>
          <InputSlider
            label="Срок рассрочки"
            value={term}
            min={1}
            max={maxTerm}
            step={1}
            minLabel="1 мес."
            maxLabel={`${maxTerm} мес.`}
            unit="мес."
            onValueChange={setTermVal}
          />
          <InputSlider
            label="Первоначальный взнос"
            value={down}
            min={minDown}
            max={maxDown}
            step={DOWN_STEP}
            minLabel={`${formatPrice(String(minDown))} ₽`}
            maxLabel={`${formatPrice(String(maxDown))} ₽`}
            unit="₽"
            onValueChange={setDownVal}
          />
        </div>

        {/* Детали */}
        <div style={{ margin: "16px 18px 18px", padding: "2px 14px", borderRadius: 14, background: "rgba(255,255,255,0.04)" }}>
          {Number(down) > 0 && (
            <Row label="Первоначальный взнос" value={`${formatPrice(Math.round(Number(down)))} ₽`} faded={calcLoading} />
          )}
          {Number(perSqm) > 0 && (
            <Row label="Цена за м²" value={`${formatPrice(Math.round(Number(perSqm)))} ₽`} faded={calcLoading} />
          )}
          {Number(total) > 0 && (
            <Row label="Итоговая сумма" value={`${formatPrice(Math.round(Number(total)))} ₽`} faded={calcLoading} last />
          )}
        </div>
      </div>

      <style jsx>{`
        .plans-scroll {
          scrollbar-width: none;
        }
        .plans-scroll::-webkit-scrollbar {
          display: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${BLUE};
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${BLUE};
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-runnable-track { background: transparent; }
        input[type="range"]::-moz-range-track { background: transparent; }
      `}</style>
    </div>
  );
}

function PricingSkeleton() {
  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div style={{
        height: 360, borderRadius: 20,
        background: "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
      }} />
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function PricingEmpty() {
  return (
    <div style={{
      textAlign: "center", padding: "52px 20px",
      background: "rgba(255,255,255,0.02)", borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.06)", margin: "16px",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px",
        background: "rgba(0,117,255,0.1)", border: "1px solid rgba(0,117,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>
        📅
      </div>
      <p style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 15, color: "var(--text-primary)", margin: 0 }}>
        Нет данных о рассрочке
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6, marginBottom: 0 }}>
        Информация об условиях ещё не добавлена
      </p>
    </div>
  );
}
