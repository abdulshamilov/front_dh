"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, GitCompareArrows } from "lucide-react";
import { ICard } from "@/app/types/models";
import { Button } from "@/app/components/shared/Button";

interface CompareTrayProps {
  cards: ICard[];
  onRemove: (cardId: number) => void;
  onClear: () => void;
}

const MAX_COMPARE = 3;

/**
 * Floating tray that surfaces the cards a user has selected for comparison.
 * Visible only when 1+ cards are added. Tapping "Сравнить" navigates to
 * /compare?ids=...
 *
 * Note: /compare page may not yet exist — the route is intentional, the
 * navigation seeds future development. If the page 404s, the toast in
 * MapPage explains "Coming soon".
 */
export function CompareTray({ cards, onRemove, onClear }: CompareTrayProps) {
  const router = useRouter();
  if (cards.length === 0) return null;

  const handleCompare = () => {
    if (cards.length < 2) return;
    const ids = cards.map((c) => c.id).join(",");
    router.push(`/compare?ids=${ids}`);
  };

  return (
    <div
      role="region"
      aria-label="Сравнение объектов"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        // Above the always-visible strip (strip ≈92px), so they never collide.
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)",
        zIndex: 26,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          maxWidth: 560,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 8,
          background: "rgba(7,7,7,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(0,117,255,0.45)",
          borderRadius: 16,
          boxShadow: "0 12px 36px rgba(0,117,255,0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            flex: 1,
            minWidth: 0,
          }}
        >
          {cards.slice(0, MAX_COMPARE).map((c) => {
            const img =
              c.images?.find((i) => i.image && i.image.trim() !== "")
                ?.image || "/placeholder.jpg";
            return (
              <div
                key={c.id}
                style={{
                  position: "relative",
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "var(--surface-elevated)",
                  border: "1px solid rgba(0,117,255,0.5)",
                }}
              >
                <Image
                  src={img}
                  alt={c.title}
                  fill
                  sizes="44px"
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={() => onRemove(c.id)}
                  aria-label={`Убрать из сравнения: ${c.title}`}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0F1115",
                    border: "1px solid var(--border-glass)",
                    borderRadius: 999,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <X size={10} strokeWidth={2.6} />
                </button>
              </div>
            );
          })}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCompare}
          disabled={cards.length < 2}
          iconLeft={<GitCompareArrows size={14} strokeWidth={2.4} />}
        >
          Сравнить ({cards.length})
        </Button>

        <button
          type="button"
          onClick={onClear}
          aria-label="Очистить сравнение"
          style={{
            width: 32,
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "1px solid var(--border-glass)",
            borderRadius: 999,
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <X size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

export default CompareTray;
