export interface CharacteristicItem {
  label: string;
  value: string | number | null | undefined;
}

export function CharacteristicsAccordion({
  left,
  right,
}: {
  left: CharacteristicItem[];
  right: CharacteristicItem[];
}) {
  return (
    <div
      className="mb-4 overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-glass)",
      }}
    >
      <div
        className="px-6 py-4 font-[family-name:var(--font-stetica-bold)] text-lg"
        style={{ color: "var(--text-primary)" }}
      >
        Основные характеристики
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 px-6 pb-6 pt-2">
        {left.map((item, i) => (
          <div
            key={`l-${i}`}
            className="flex justify-between items-center flex-row gap-1 py-2.5"
            style={{ borderBottom: "1px solid var(--divider)" }}
          >
            <div className="text-base font-[family-name:var(--font-stetica-medium)]" style={{ color: "var(--text-secondary)" }}>{item.label}</div>
            <div className="text-base font-[family-name:var(--font-stetica-medium)]" style={{ color: "var(--text-primary)" }}>{item.value ?? "Не указано"}</div>
          </div>
        ))}
        {right.map((item, i) => (
          <div
            key={`r-${i}`}
            className="flex justify-between items-center flex-row gap-1 py-2.5"
            style={{ borderBottom: "1px solid var(--divider)" }}
          >
            <div className="text-base font-[family-name:var(--font-stetica-medium)]" style={{ color: "var(--text-secondary)" }}>{item.label}</div>
            <div className="text-base font-[family-name:var(--font-stetica-medium)]" style={{ color: "var(--text-primary)" }}>{item.value ?? "Не указано"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
