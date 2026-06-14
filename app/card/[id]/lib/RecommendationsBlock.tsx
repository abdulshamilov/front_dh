import type { ICard } from "@/app/types/models";
import { memo } from "react";
import { CardItemPreview } from "@/app/components/CardItemPreview";

export const RecommendationsBlock = memo(function RecommendationsBlock({ items }: { items: ICard[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-[family-name:var(--font-stetica-bold)] mb-6" style={{ color: "var(--text-primary)" }}>Подборка для вас</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <CardItemPreview key={item.id} card={item} />
        ))}
      </div>
    </div>
  );
});
