interface FieldTextRangeProps {
  label: string;
  fromValue?: number | string;
  toValue?: number | string;
  onFromChange: (v: number | "") => void;
  onToChange: (v: number | "") => void;
  placeholderFrom?: string;
  placeholderTo?: string;
  min?: number;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  borderRadius: 12,
  background: "var(--surface-elevated)",
  border: "1px solid var(--border-color)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  outline: "none",
};

export function FieldTextRange({
  label,
  fromValue,
  toValue,
  onFromChange,
  onToChange,
  placeholderFrom = "От",
  placeholderTo = "До",
  min,
}: FieldTextRangeProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          placeholder={placeholderFrom}
          value={fromValue || ""}
          min={min}
          onChange={(e) =>
            onFromChange(e.target.value ? Number(e.target.value) : "")
          }
          style={inputStyle}
        />
        <input
          type="number"
          placeholder={placeholderTo}
          value={toValue || ""}
          min={min}
          onChange={(e) =>
            onToChange(e.target.value ? Number(e.target.value) : "")
          }
          style={inputStyle}
        />
      </div>
    </div>
  );
}
