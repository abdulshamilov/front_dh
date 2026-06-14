export function DescriptionAccordion({ description }: { description?: string }) {
  if (!description || description.trim() === "") {
    return null;
  }
  const paragraphs = description.split(/\n+/).filter(Boolean);
  return (
    <div
      className="mb-4 overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-glass)",
      }}
    >
      <div className="px-6 py-4 font-[family-name:var(--font-stetica-bold)] text-lg" style={{ color: "var(--text-primary)" }}>
        Описание
      </div>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base leading-relaxed space-y-3" style={{ color: "var(--text-secondary)", wordBreak: "break-word" }}>
        {paragraphs.length > 0
          ? paragraphs.map((p, i) => <p key={i}>{p}</p>)
          : <p>Описание не указано</p>}
      </div>
    </div>
  );
}
