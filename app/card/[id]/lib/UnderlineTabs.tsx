"use client";

export type TabKey = "description" | "specifications" | "documents" | "map" | "pricing";

const TABS: { key: TabKey; label: string; highlight?: boolean }[] = [
  { key: "description",    label: "Описание" },
  { key: "specifications", label: "Характеристики" },
  { key: "pricing",        label: "Рассрочка" },
  { key: "documents",      label: "Документы" },
  { key: "map",            label: "Карта" },
];

export function UnderlineTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <div style={{ padding: "12px 16px 8px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
      {TABS.map((tab) => {
        const on = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              border: on
                ? "1.5px solid rgba(0,117,255,0.7)"
                : "1.5px solid rgba(255,255,255,0.15)",
              background: on
                ? "linear-gradient(135deg, #0075FF 0%, #0056CC 100%)"
                : "rgba(255,255,255,0.07)",
              color: on ? "#FFFFFF" : "rgba(255,255,255,0.65)",
              fontSize: 13,
              fontFamily: "var(--font-stetica-bold)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.15s",
              boxShadow: on ? "0 4px 16px rgba(0,117,255,0.35)" : "none",
              letterSpacing: "0.01em",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
