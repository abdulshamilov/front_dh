export function Tabs({
  active,
  onChange,
  tabs,
}: {
  active: string;
  onChange: (tab: string) => void;
  tabs: { key: string; label: string }[];
}) {
  return (
    <div className="relative mb-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        style={{ scrollbarWidth: "none", padding: "4px 0" }}
      >
        {tabs.map((tab) => {
          const on = active === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(tab.key)}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: on ? "1.5px solid rgba(0,117,255,0.7)" : "1.5px solid rgba(255,255,255,0.15)",
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
    </div>
  );
}
