"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

interface CardImageCarouselProps {
  images: string[];
  alt: string;
  /** Что делать на double-tap (Instagram-style сердце) */
  onDoubleTap?: (e: React.MouseEvent) => void;
  /** Резервный плейсхолдер если нет фото */
  fallback?: React.ReactNode;
}

/**
 * Свайпаемая галерея фото внутри карточки квартиры.
 *
 * Поведение:
 *   • Touch-свайп пальцем → следующее/предыдущее фото
 *   • На desktop: стрелки на hover, клик по полоскам-индикаторам
 *   • Полоски-progress сверху (Stories-style) — только если фото > 1
 *   • Lazy: грузит текущее + следующее, остальные подгружаются по мере свайпа
 *   • Стоп на последнем (нет loop)
 *   • Клик без свайпа → пропагирует в Link (переход на детальную)
 *   • Свайп предотвращает переход через preventDefault на Link drag
 */
export function CardImageCarousel({
  images,
  alt,
  onDoubleTap,
  fallback,
}: CardImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [maxLoaded, setMaxLoaded] = useState(1); // сколько соседних подгружено

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
  const swipeBlockedNavRef = useRef(false);

  const validImages = useMemo(
    () => images.filter((src) => src && src.trim() !== ""),
    [images]
  );
  const total = validImages.length;
  const hasMultiple = total > 1;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setIndex(clamped);
      setMaxLoaded((m) => Math.max(m, clamped + 2));
    },
    [total]
  );

  const next = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    goTo(index + 1);
  }, [goTo, index]);

  const prev = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    goTo(index - 1);
  }, [goTo, index]);

  // ── Touch / swipe logic ──
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!hasMultiple) return;
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    isSwipingRef.current = false;
    swipeBlockedNavRef.current = false;
  }, [hasMultiple]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!hasMultiple) return;
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    if (startX === null || startY === null) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // Считаем горизонтальный свайп если движение по X в 1.5+ раза больше Y
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      isSwipingRef.current = true;
    }
  }, [hasMultiple]);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!hasMultiple) return;
      const startX = touchStartXRef.current;
      if (startX === null) {
        return;
      }
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const threshold = 40;
      if (isSwipingRef.current && Math.abs(dx) >= threshold) {
        // Блокируем переход по ссылке: свайп выполнен
        e.preventDefault();
        e.stopPropagation();
        swipeBlockedNavRef.current = true;
        if (dx < 0) goTo(index + 1);
        else goTo(index - 1);
      }
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      isSwipingRef.current = false;
    },
    [hasMultiple, goTo, index]
  );

  // Если зафиксировали свайп — на следующем click останавливаем переход
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (swipeBlockedNavRef.current) {
      e.preventDefault();
      e.stopPropagation();
      swipeBlockedNavRef.current = false;
    }
  }, []);

  // Пустое состояние
  if (total === 0) {
    return <>{fallback}</>;
  }

  return (
    <div
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
      onClick={onDoubleTap}
      className="property-card-carousel group"
    >
      {/* Полоса фото с translateX */}
      <div
        style={{
          display: "flex",
          width: `${total * 100}%`,
          height: "100%",
          transform: `translateX(-${(index * 100) / total}%)`,
          transition: "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {validImages.map((src, i) => {
          const shouldLoad = i <= maxLoaded || i === index || i === index + 1 || i === index - 1;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                flex: `0 0 ${100 / total}%`,
                height: "100%",
              }}
            >
              {shouldLoad && (
                <Image
                  src={src}
                  alt={i === 0 ? alt : `${alt} — фото ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  quality={80}
                  unoptimized={needsUnoptimized(src)}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Полоски-progress (Stories-style) — только если фото > 1 */}
      {hasMultiple && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 8,
            display: "flex",
            gap: 4,
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          {validImages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo(i);
              }}
              aria-label={`Фото ${i + 1} из ${total}`}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                border: "none",
                padding: 0,
                background:
                  i === index
                    ? "rgba(255, 255, 255, 0.95)"
                    : i < index
                      ? "rgba(255, 255, 255, 0.55)"
                      : "rgba(255, 255, 255, 0.28)",
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "background 200ms ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Стрелки на desktop (на hover) */}
      {hasMultiple && index > 0 && (
        <button
          type="button"
          aria-label="Предыдущее фото"
          onClick={prev}
          className="hidden lg:flex carousel-arrow carousel-arrow-prev"
          style={arrowStyle("left")}
        >
          <ChevronLeft size={18} strokeWidth={2.4} />
        </button>
      )}
      {hasMultiple && index < total - 1 && (
        <button
          type="button"
          aria-label="Следующее фото"
          onClick={next}
          className="hidden lg:flex carousel-arrow carousel-arrow-next"
          style={arrowStyle("right")}
        >
          <ChevronRight size={18} strokeWidth={2.4} />
        </button>
      )}

      <style jsx>{`
        .property-card-carousel .carousel-arrow {
          opacity: 0;
          transition: opacity 160ms ease;
        }
        .property-card-carousel:hover .carousel-arrow {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: 8,
    transform: "translateY(-50%)",
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    color: "#FFFFFF",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
    zIndex: 6,
  };
}

// Next.js image optimizer 500's on URL-encoded non-ASCII filenames (Cyrillic).
function needsUnoptimized(src: string): boolean {
  try {
    const pathOnly = new URL(src).pathname;
    return /%[0-9A-Fa-f]{2}/.test(pathOnly);
  } catch {
    return /%[0-9A-Fa-f]{2}/.test(src);
  }
}
