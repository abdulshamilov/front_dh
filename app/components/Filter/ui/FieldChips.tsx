import { memo, useCallback } from "react";

interface FieldChipsOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FieldChipsProps {
  label?: string;
  options: FieldChipsOption[];
  value: string[];
  onToggle: (val: string) => void;
  multiSelect?: boolean;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--text-primary)",
  margin: 0,
};

export const FieldChips = memo(function FieldChips({
  label,
  options,
  value,
  onToggle,
}: FieldChipsProps) {
  const handleToggle = useCallback(
    (optionValue: string) => {
      onToggle(optionValue);
    },
    [onToggle]
  );

  const handleKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle(optionValue);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <span style={labelStyle}>{label}</span>}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={label}
      >
        {options.map((o) => {
          const active = value.includes(o.value);
          const disabled = o.disabled ?? false;
          return (
            <button
              key={o.value}
              type="button"
              role="checkbox"
              aria-checked={active}
              aria-disabled={disabled}
              disabled={disabled}
              onClick={() => !disabled && handleToggle(o.value)}
              onKeyDown={(e) => !disabled && handleKeyDown(e, o.value)}
              className={`press-scale ${disabled ? "" : ""}`}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.2,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition:
                  "background 160ms ease, color 160ms ease, border-color 160ms ease",
                backgroundColor: active
                  ? "var(--accent-primary)"
                  : "var(--surface-elevated)",
                color: active ? "#FFFFFF" : "var(--text-secondary)",
                border: active
                  ? "1px solid var(--accent-primary)"
                  : "1px solid var(--border-color)",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
