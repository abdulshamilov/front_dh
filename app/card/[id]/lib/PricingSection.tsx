"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axiosInstance from "@/app/shared/config/axios";
import type { ICardPricing, IInstallmentMatch } from "@/app/types/models";
import { formatPrice } from "@/app/card/[id]/lib";

const BLUE = "#0075FF";
const BLUE_DIM = "rgba(0,117,255,0.7)";

function Row({ label, value, faded }: { label: string; value: React.ReactNode; faded?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.07)",
    }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-stetica-medium)" }}>
        {label}
      </span>
      <span style={{
        fontSize: 13, fontFamily: "var(--font-stetica-bold)", textAlign: "right", maxWidth: "55%",
        color: faded ? "rgba(255,255,255,0.25)" : "#FFFFFF",
        transition: "color 0.15s",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-stetica-medium)" }}>
          {label}
        </span>
        {/* Поле ввода — нейтральный инпут */}
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8, padding: "3px 10px",
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
              color: "#FFFFFF", fontFamily: "var(--font-stetica-bold)", fontSize: 13,
              width: unit === "мес." ? 36 : 80,
              textAlign: "right",
              padding: 0,
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-stetica-bold)", fontSize: 13, flexShrink: 0 }}>
            {unit}
          </span>
        </div>
      </div>

      <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 4,
          borderRadius: 2, background: "rgba(255,255,255,0.1)",
        }} />
        <div style={{
          position: "absolute", left: 0, height: 4,
          borderRadius: 2, background: "rgba(255,255,255,0.25)",
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
            margin: 0, padding: 0, height: 24,
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-stetica-medium)" }}>
          {minLabel}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-stetica-medium)" }}>
          {maxLabel}
        </span>
      </div>
    </div>
  );
}

export function PricingSection({ cardId }: { cardId: number }) {
  const [options, setOptions] = useState<ICardPricing | null>(null);
  const [calc, setCalc] = useState<IInstallmentMatch | null>(null);
  const [termVal, setTermVal] = useState(36);
  const [downVal, setDownVal] = useState(300_000);
  const [maxTerm, setMaxTerm] = useState(36);
  const [minDown, setMinDown] = useState(300_000);
  const [maxDown, setMaxDown] = useState(500_000);
  const [loading, setLoading] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const termRef = useRef(36);
  const downRef = useRef(300_000);

  useEffect(() => {
    setLoading(true);
    setError(false);

    axiosInstance
      .get<ICardPricing>(`/cards/${cardId}/payment-options/`)
      .then(async (res) => {
        setOptions(res.data);
        const opt = res.data.installment_options?.[0];
        if (!opt) { setLoading(false); return; }

        const term = Number(opt.term_months);
        const minD = Math.round(Number(opt.down_payment_min_amount));

        setMaxTerm(term);
        setTermVal(term);
        termRef.current = term;
        setMinDown(minD);
        setDownVal(minD);
        downRef.current = minD;

        try {
          const matchRes = await axiosInstance.post<IInstallmentMatch>(
            `/cards/${cardId}/installment/match/`,
            { down_payment: String(minD), term_months: term }
          );
          setCalc(matchRes.data);
          const maxD = Math.round(Number(matchRes.data.down_payment_to));
          if (maxD > minD) setMaxDown(maxD);
        } catch {
          // данные из payment-options будут показаны
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [cardId]);

  const runMatch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCalcLoading(true);
      axiosInstance
        .post<IInstallmentMatch>(`/cards/${cardId}/installment/match/`, {
          down_payment: String(downRef.current),
          term_months: termRef.current,
        })
        .then((res) => {
          setCalc(res.data);
          const newMax = Math.round(Number(res.data.down_payment_to));
          if (newMax > 0) setMaxDown(newMax);
          setCalcLoading(false);
        })
        .catch(() => setCalcLoading(false));
    }, 280);
  }, [cardId]);

  const handleTerm = (v: number) => {
    setTermVal(v);
    termRef.current = v;
    runMatch();
  };

  const handleDown = (v: number) => {
    setDownVal(v);
    downRef.current = v;
    runMatch();
  };

  if (loading) return <PricingSkeleton />;
  if (error || !options) return <PricingEmpty />;

  const opt = options.installment_options?.[0];
  if (!opt) return <PricingEmpty />;

  const monthly = calc ? calc.monthly_payment : String(opt.monthly_payment);
  const total   = calc ? calc.total_price      : String(opt.total_price);
  const down    = calc ? calc.down_payment     : String(opt.down_payment_min_amount);
  const perSqm  = calc ? calc.price_per_sqm    : String(opt.price_per_sqm);

  return (
    <div style={{ padding: "16px 16px 32px" }}>
      <div style={{
        borderRadius: 20, overflow: "hidden",
        background: "rgba(255,255,255,0.04)",
        border: `1.5px solid ${BLUE_DIM}`,
        boxShadow: `0 4px 24px rgba(0,117,255,0.12)`,
      }}>

        {/* Hero */}
        <div style={{ padding: "22px 18px 18px" }}>
          <div style={{
            fontSize: 10, fontFamily: "var(--font-stetica-bold)",
            color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
            letterSpacing: "0.1em", marginBottom: 8,
          }}>
            Ежемесячный платёж
          </div>
          <div style={{
            fontSize: 36, fontFamily: "var(--font-stetica-bold)", lineHeight: 1,
            color: calcLoading ? "rgba(0,117,255,0.3)" : BLUE,
            transition: "color 0.15s",
          }}>
            {formatPrice(Math.round(Number(monthly)))} ₽
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 5, fontFamily: "var(--font-stetica-medium)" }}>
            в месяц · {termVal} мес.
          </div>
        </div>

        {/* Слайдеры */}
        <div style={{ padding: "4px 18px 20px", display: "flex", flexDirection: "column", gap: 22 }}>
          <InputSlider
            label="Срок рассрочки"
            value={termVal}
            min={1}
            max={maxTerm}
            step={1}
            minLabel="1 мес."
            maxLabel={`${maxTerm} мес.`}
            unit="мес."
            onValueChange={handleTerm}
          />
          <InputSlider
            label="Первоначальный взнос"
            value={downVal}
            min={minDown}
            max={maxDown}
            step={1_000}
            minLabel={`${formatPrice(String(minDown))} ₽`}
            maxLabel={`${formatPrice(String(maxDown))} ₽`}
            unit="₽"
            onValueChange={handleDown}
          />
        </div>

        {/* Детали */}
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 2 }}>
            {Number(down) > 0 && (
              <Row label="Первоначальный взнос" value={`${formatPrice(Math.round(Number(down)))} ₽`} faded={calcLoading} />
            )}
            {Number(total) > 0 && (
              <Row label="Итоговая сумма" value={`${formatPrice(Math.round(Number(total)))} ₽`} faded={calcLoading} />
            )}
            {Number(perSqm) > 0 && (
              <Row label="Цена за м²" value={`${formatPrice(Math.round(Number(perSqm)))} ₽`} faded={calcLoading} />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          border: none;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          border: none;
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
