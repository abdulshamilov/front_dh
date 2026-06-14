export function PlanningAccordion() {
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
        Планирование
      </div>
      <div className="px-6 pb-6">
        <p
          className="text-center py-4 text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Планирование не указано
        </p>
      </div>
    </div>
  );
}
