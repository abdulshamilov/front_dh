"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

// Группировка по 3 цифры пробелом: "50000000" → "50 000 000".
function groupDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  valueMin?: number;
  valueMax?: number;
  onChangeMin: (value: number | "") => void;
  onChangeMax: (value: number | "") => void;
  formatValue?: (value: number) => string;
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
  formatValue = (v) => v.toString(),
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState(valueMin ?? min);
  const [localMax, setLocalMax] = useState(valueMax ?? max);
  const [error, setError] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Текстовый ввод в поля «от»/«до».
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [minFocused, setMinFocused] = useState(false);
  const [maxFocused, setMaxFocused] = useState(false);

  useEffect(() => {
    setLocalMin(valueMin ?? min);
    setLocalMax(valueMax ?? max);
    setError(null);
  }, [valueMin, valueMax, min, max]);

  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(Math.max(v, lo), hi);

  // Ввод «от»: не ниже min и не выше текущего «до».
  const commitMin = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
      if (cleaned === "") {
        setLocalMin(min);
        onChangeMin("");
        return;
      }
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) return;
      const v = clamp(parsed, min, Math.min(localMax, max));
      setLocalMin(v);
      onChangeMin(v === min ? "" : v);
    },
    [localMax, min, max, onChangeMin]
  );

  // Ввод «до»: не выше max (указанного максимума) и не ниже текущего «от».
  const commitMax = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
      if (cleaned === "") {
        setLocalMax(max);
        onChangeMax("");
        return;
      }
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) return;
      const v = clamp(parsed, Math.max(localMin, min), max);
      setLocalMax(v);
      onChangeMax(v === max ? "" : v);
    },
    [localMin, min, max, onChangeMax]
  );

  const handleMinChange = useCallback(
    (value: number) => {
      const newMin = Math.min(value, localMax);
      setError(null);
      setLocalMin(newMin);
      onChangeMin(newMin === min ? "" : newMin);
    },
    [localMax, min, onChangeMin]
  );

  const handleMaxChange = useCallback(
    (value: number) => {
      const newMax = Math.max(value, localMin);
      setError(null);
      setLocalMax(newMax);
      onChangeMax(newMax === max ? "" : newMax);
    },
    [localMin, max, onChangeMax]
  );

  const handleMinKeyDown = (e: React.KeyboardEvent) => {
    let newValue = localMin;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      newValue = Math.max(min, localMin - step);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      newValue = Math.min(localMax, localMin + step);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      newValue = Math.max(min, localMin - step * 10);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      newValue = Math.min(localMax, localMin + step * 10);
    } else if (e.key === "Home") {
      e.preventDefault();
      newValue = min;
    } else if (e.key === "End") {
      e.preventDefault();
      newValue = localMax;
    }

    if (newValue !== localMin) {
      handleMinChange(newValue);
    }
  };

  const handleMaxKeyDown = (e: React.KeyboardEvent) => {
    let newValue = localMax;

    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      newValue = Math.max(localMin, localMax - step);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      newValue = Math.min(max, localMax + step);
    } else if (e.key === "PageDown") {
      e.preventDefault();
      newValue = Math.max(localMin, localMax - step * 10);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      newValue = Math.min(max, localMax + step * 10);
    } else if (e.key === "Home") {
      e.preventDefault();
      newValue = localMin;
    } else if (e.key === "End") {
      e.preventDefault();
      newValue = max;
    }

    if (newValue !== localMax) {
      handleMaxChange(newValue);
    }
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label
        id={`${label}-label`}
        style={{
          fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          padding: "0 4px",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
          <span
            style={{
              color: "var(--text-tertiary)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            от
          </span>
          <span className="range-field">
            <input
              type="text"
              inputMode="numeric"
              value={minFocused ? minInput : formatValue(localMin)}
              onFocus={() => {
                setMinFocused(true);
                setMinInput(groupDigits(String(localMin)));
              }}
              onChange={(e) => setMinInput(groupDigits(e.target.value))}
              onBlur={() => {
                commitMin(minInput);
                setMinFocused(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitMin(minInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              aria-label={`${label} минимум`}
              className="range-num"
            />
            {!minFocused && <Pencil size={12} className="range-pencil" aria-hidden />}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
          <span
            style={{
              color: "var(--text-tertiary)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            до
          </span>
          <span className="range-field">
            <input
              type="text"
              inputMode="numeric"
              value={maxFocused ? maxInput : formatValue(localMax)}
              onFocus={() => {
                setMaxFocused(true);
                setMaxInput(groupDigits(String(localMax)));
              }}
              onChange={(e) => setMaxInput(groupDigits(e.target.value))}
              onBlur={() => {
                commitMax(maxInput);
                setMaxFocused(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitMax(maxInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              aria-label={`${label} максимум`}
              className="range-num"
            />
            {!maxFocused && <Pencil size={12} className="range-pencil" aria-hidden />}
          </span>
        </div>
      </div>
      <div className="px-2">
        <div className="relative h-8" ref={sliderRef}>
          {error && (
            <div className="text-xs mb-2" role="alert" style={{ color: "var(--error)" }}>
              {error}
            </div>
          )}
          <div
            className="absolute w-full h-1 rounded-full top-1/2 -translate-y-1/2"
            style={{ backgroundColor: "var(--surface-elevated)" }}
          />

          <div
            className="absolute h-1 rounded-full top-1/2 -translate-y-1/2"
            style={{
              backgroundColor: "var(--accent-primary)",
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />

          <div className="relative">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={localMin}
              onChange={(e) => handleMinChange(Number(e.target.value))}
              onKeyDown={handleMinKeyDown}

              className="absolute w-full bg-transparent appearance-none pointer-events-none cursor-pointer focus:outline-none"
              style={{
                zIndex: localMin > max - (max - min) / 2 ? 5 : 3,
              }}
              role="slider"
              aria-label={`${label} минимум`}
              aria-labelledby={`${label}-label`}
              aria-valuemin={min}
              aria-valuemax={localMax}
              aria-valuenow={localMin}
              tabIndex={0}
            />

          </div>

          <div className="relative">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={localMax}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (newValue >= localMin) {
                  handleMaxChange(newValue);
                }
              }}
              onKeyDown={handleMaxKeyDown}

              className="absolute w-full bg-transparent appearance-none pointer-events-none cursor-pointer focus:outline-none"
              style={{
                zIndex: 4,
              }}
              role="slider"
              aria-label={`${label} максимум`}
              aria-labelledby={`${label}-label`}
              aria-valuemin={localMin}
              aria-valuemax={max}
              aria-valuenow={localMax}
              tabIndex={0}
            />

          </div>

          <style jsx>{`
            .range-field {
              flex: 1;
              min-width: 0;
              display: flex;
              align-items: center;
              justify-content: flex-end;
              gap: 4px;
              padding: 0;
              background: transparent;
              border: none;
              cursor: text;
            }
            .range-pencil {
              flex-shrink: 0;
              color: var(--text-tertiary);
              opacity: 0.6;
            }
            .range-num {
              flex: 1;
              width: 100%;
              min-width: 0;
              text-align: right;
              background: transparent !important;
              border: none;
              box-shadow: none;
              padding: 0;
              margin: 0;
              color: var(--text-primary);
              font-weight: 600;
              font-size: 13px;
              font-variant-numeric: tabular-nums;
              outline: none;
              -webkit-appearance: none;
              appearance: none;
              -webkit-tap-highlight-color: transparent;
              caret-color: var(--accent-primary);
            }
            .range-num:focus,
            .range-num:active {
              background: transparent !important;
              box-shadow: none;
              outline: none;
            }
            .range-field:focus-within .range-num {
              color: var(--accent-primary);
            }
            input[type="range"] {
              pointer-events: none;
              position: absolute;
              left: 0;
              top: 50%;
              transform: translateY(25%);
              height: 20px;
            }
            input[type="range"]::-webkit-slider-thumb {
              pointer-events: auto;
              -webkit-appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: var(--accent-primary);
              cursor: pointer;
              border: 3px solid var(--surface);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              transition: transform 0.2s;
            }
            input[type="range"]:hover::-webkit-slider-thumb,
            input[type="range"]:focus::-webkit-slider-thumb {
              transform: scale(1.15);
            }
            input[type="range"]::-moz-range-thumb {
              pointer-events: auto;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: var(--accent-primary);
              cursor: pointer;
              border: 3px solid var(--surface);
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              transition: transform 0.2s;
            }
            input[type="range"]:hover::-moz-range-thumb,
            input[type="range"]:focus::-moz-range-thumb {
              transform: scale(1.15);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
