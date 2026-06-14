"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  X,
  MapPin,
  Maximize2,
  BedDouble,
  GitCompareArrows,
  ArrowUpRight,
} from "lucide-react";
import { Button, ButtonLink } from "@/app/components/shared/Button";
import { ICard } from "@/app/types/models";
import { parsePriceToNumber } from "@/app/shared/utils/price";

interface SelectedCardSheetProps {
  card: ICard | null;
  /** When set (length > 1) the sheet renders a LIST of every apartment of a
   *  complex (cluster tap) instead of a single card. The page passes EITHER
   *  `card` OR `cards`, never both. */
  cards?: ICard[];
  /** Tap on a list row → drill into that apartment's single-card preview. */
  onSelectFromList?: (card: ICard) => void;
  onClose: () => void;
  onSchedule: () => void;
  onToggleCompare?: (card: ICard) => void;
  isComparing?: boolean;
}

function pickImage(c: ICard): string {
  return (
    c.images?.find((i) => i.image && i.image.trim() !== "")?.image ||
    "/placeholder.jpg"
  );
}

/**
 * One row in the cluster list — compact: thumbnail + price + rooms·area.
 * Visual language matches the single-card sheet (same tokens, Stetica,
 * rounded surfaces). Whole row is the tap target (≥44px) with a press
 * scale so it reads as a button on touch.
 */
function ListRow({
  card,
  onSelect,
}: {
  card: ICard;
  onSelect: (card: ICard) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const priceNum = parsePriceToNumber(card.price);
  const areaNum = parseFloat(card.area || "0");
  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      aria-label={`${card.title} — открыть карточку`}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        width: "100%",
        minHeight: 44,
        padding: 8,
        background: "var(--surface-elevated)",
        border: "1px solid var(--border-glass)",
        borderRadius: 14,
        cursor: "pointer",
        textAlign: "left",
        transition: "transform 120ms ease, background 160ms ease",
      }}
      onPointerDown={(e) => {
        e.currentTarget.style.transform = "scale(0.98)";
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div
        style={{
          position: "relative",
          flexShrink: 0,
          width: 56,
          height: 56,
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        <Image
          src={imgError ? "/placeholder.jpg" : pickImage(card)}
          alt={card.title}
          fill
          sizes="56px"
          style={{ objectFit: "cover" }}
          onError={() => setImgError(true)}
        />
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
            fontSize: 16,
            color: "var(--price-color)",
            lineHeight: 1.1,
          }}
        >
          {priceNum > 0 ? `${formatPrice(priceNum)} ₽` : "Цена по запросу"}
        </div>
        <div
          style={{
            color: "var(--text-tertiary)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 12,
            lineHeight: 1.2,
          }}
        >
          {card.rooms > 0 ? `${card.rooms} комн` : "Студия"}
          {areaNum > 0 ? ` · ${areaNum} м²` : ""}
        </div>
      </div>
      <ArrowUpRight
        size={16}
        strokeWidth={2.2}
        color="var(--text-tertiary)"
        style={{ flexShrink: 0 }}
      />
    </button>
  );
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n);
}

/**
 * Bottom card preview that sits ABOVE the global BottomBar.
 * Uses position:fixed + bottom:var(--bottom-bar-height) so the BottomBar
 * never clips it. Shows/hides via translateY transform — no drag, no snap.
 */
export function SelectedCardSheet({
  card,
  cards,
  onSelectFromList,
  onClose,
  onSchedule,
  onToggleCompare,
  isComparing = false,
}: SelectedCardSheetProps) {
  // List mode wins only when an actual multi-item group was passed. The page
  // never passes both, but this keeps the precedence explicit and safe.
  const isListMode = !!cards && cards.length > 1;
  // Track image-load failure per card. Reset when the displayed card changes.
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    setImgError(false);
  }, [card?.id]);

  // Stable row-select handler so each ListRow gets a constant prop
  // reference instead of a fresh inline lambda every render.
  const handleRowSelect = useCallback(
    (picked: ICard) => {
      onSelectFromList?.(picked);
    },
    [onSelectFromList]
  );

  const open = card !== null || isListMode;

  // Close via ESC for keyboard/desktop users — for either mode.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const img =
    card?.images?.find((i) => i.image && i.image.trim() !== "")?.image ||
    "/placeholder.jpg";
  const priceNum = card ? parsePriceToNumber(card.price) : 0;
  const areaNum = card ? parseFloat(card.area || "0") : 0;

  // Yandex Maps deep link — identical logic to MapPreviewApp: valid
  // coords → build a route to the point; else search by address text.
  // Opens in the user's own browser (where Yandex usually works) and
  // matches the mobile app behaviour.
  const openYandexRoute = () => {
    if (!card) return;
    const lat = Number(card.latitude);
    const lng = Number(card.longitude);
    const hasCoords =
      card.latitude != null &&
      card.longitude != null &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      !(lat === 0 && lng === 0);
    const url = hasCoords
      ? `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`
      : card.address
        ? `https://yandex.ru/maps/?text=${encodeURIComponent(card.address)}`
        : null;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      // Pin preview is always-mounted for smooth slide-in/out animation.
      // It is NOT a modal — no focus trap, no scrim. Use `inert` to remove
      // it from the a11y/tab tree when closed instead of aria-hidden+role.
      aria-label="Информация об объекте"
      // React 19 accepts `inert` as a boolean prop natively.
      inert={!open}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        // Anchor to the very bottom edge — strip will sit ABOVE this sheet.
        bottom: "env(safe-area-inset-bottom, 0px)",
        zIndex: 40,
        transform: open ? "translateY(0)" : "translateY(120%)",
        transition: "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: open ? "auto" : "none",
        padding: "0 12px",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 640,
          margin: "0 auto",
          background: "var(--surface)",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid var(--border-glass)",
          borderLeft: "1px solid var(--border-glass)",
          borderRight: "1px solid var(--border-glass)",
          boxShadow: "0 -16px 48px rgba(0, 0, 0, 0.55)",
          padding: "16px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid var(--border-glass)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "background 160ms ease, color 160ms ease",
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>

        {isListMode && cards && (
          <>
            <div style={{ paddingRight: 36, marginBottom: 12 }}>
              <div
                style={{
                  fontFamily:
                    "var(--font-stetica-bold), system-ui, sans-serif",
                  fontSize: 18,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}
              >
                {cards.length}{" "}
                {cards.length % 10 === 1 && cards.length % 100 !== 11
                  ? "квартира"
                  : (cards.length % 10 >= 2 &&
                        cards.length % 10 <= 4 &&
                        (cards.length % 100 < 10 ||
                          cards.length % 100 >= 20))
                    ? "квартиры"
                    : "квартир"}{" "}
                в этом доме
              </div>
              {cards[0].address && (
                <div
                  style={{
                    marginTop: 4,
                    color: "var(--text-tertiary)",
                    fontFamily:
                      "var(--font-inter), system-ui, sans-serif",
                    fontSize: 13,
                    lineHeight: 1.3,
                  }}
                >
                  {cards[0].address}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: "min(52vh, 360px)",
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
                margin: "0 -4px",
                padding: "0 4px",
              }}
            >
              {cards.map((c) => (
                <ListRow
                  key={c.id}
                  card={c}
                  onSelect={handleRowSelect}
                />
              ))}
            </div>
          </>
        )}

        {!isListMode && card && (
          <>
            <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
              <div
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: 96,
                  height: 96,
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "var(--surface-elevated)",
                }}
              >
                <Image
                  src={imgError ? "/placeholder.jpg" : img}
                  alt={card.title}
                  fill
                  sizes="96px"
                  style={{ objectFit: "cover" }}
                  onError={() => setImgError(true)}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  paddingRight: 32,
                }}
              >
                <div
                  style={{
                    fontFamily:
                      "var(--font-stetica-bold), system-ui, sans-serif",
                    fontSize: 20,
                    color: "#F1117E",
                    lineHeight: 1.1,
                  }}
                >
                  {formatPrice(priceNum)} ₽
                </div>
                <div
                  style={{
                    fontFamily:
                      "var(--font-stetica-medium), system-ui, sans-serif",
                    fontSize: 14,
                    color: "var(--text-primary)",
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: 12,
                    lineHeight: 1.2,
                    marginTop: 2,
                  }}
                >
                  {areaNum > 0 && (
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <Maximize2 size={12} strokeWidth={2.2} />
                      {areaNum} м²
                    </span>
                  )}
                  {card.rooms > 0 && (
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <BedDouble size={12} strokeWidth={2.2} />
                      {card.rooms} комн.
                    </span>
                  )}
                </div>
                {card.address && (
                  <button
                    type="button"
                    onClick={openYandexRoute}
                    aria-label="Построить маршрут на Яндекс.Картах"
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      width: "100%",
                      marginTop: 4,
                      padding: "6px 8px",
                      background:
                        "color-mix(in srgb, var(--accent-primary) 12%, transparent)",
                      border: "1px solid var(--border-glass)",
                      borderRadius: 10,
                      color: "var(--accent-primary)",
                      fontFamily:
                        "var(--font-stetica-medium), system-ui, sans-serif",
                      fontSize: 12,
                      lineHeight: 1.2,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 160ms ease",
                    }}
                  >
                    <MapPin size={13} strokeWidth={2.2} />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {card.address}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        flexShrink: 0,
                        fontFamily:
                          "var(--font-stetica-bold), system-ui, sans-serif",
                      }}
                    >
                      Маршрут
                      <ArrowUpRight size={13} strokeWidth={2.4} />
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
              }}
            >
              <ButtonLink
                href={`/card/${card.id}`}
                variant="ghost"
                size="md"
                fullWidth
              >
                Перейти к объекту
              </ButtonLink>
              <Button
                variant="primary"
                size="md"
                onClick={onSchedule}
                fullWidth
              >
                Записаться на показ
              </Button>
            </div>

            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(card)}
                aria-pressed={isComparing}
                aria-label={
                  isComparing
                    ? "Убрать из сравнения"
                    : "Добавить в сравнение"
                }
                style={{
                  marginTop: 8,
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: isComparing
                    ? "rgba(0,117,255,0.18)"
                    : "transparent",
                  border: isComparing
                    ? "1px solid rgba(0,117,255,0.6)"
                    : "1px solid var(--border-glass)",
                  borderRadius: 12,
                  color: isComparing
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
                  fontFamily:
                    "var(--font-stetica-medium), system-ui, sans-serif",
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "background 160ms ease, border-color 160ms ease",
                }}
              >
                <GitCompareArrows size={14} strokeWidth={2.4} />
                {isComparing ? "В сравнении" : "Сравнить с другими"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SelectedCardSheet;
