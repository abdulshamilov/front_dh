export function FieldCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded accent-[var(--accent-primary)]"
        style={{
          accentColor: "var(--accent-primary)",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-primary)",
        }}
      >
        {label}
      </span>
    </label>
  );
}
