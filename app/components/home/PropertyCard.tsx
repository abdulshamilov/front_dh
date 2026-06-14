"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import {
  toggleFavorite,
  updateCardFavorite,
} from "@/app/shared/redux/slices/cards";
import { ICard } from "@/app/types/models";
import { parsePriceToNumber } from "@/app/shared/utils/price";
import { buildWhatsappLink } from "@/app/shared/utils/contacts";
import { CardImageCarousel } from "./CardImageCarousel";

// Favorite pink (danger/favorite)
const FAVORITE_COLOR = "#F1117E";

function formatRub(n: number): string {
  if (!n) return "— ₽";
  return `${new Intl.NumberFormat("ru-RU").format(n)} ₽`;
}

type StatusTag = "NEW" | "HOT" | "SALE";

function resolveTag(card: ICard, price: number): StatusTag | null {
  // Priority: SALE > HOT > NEW
  // SALE: discount (old_price > current price_metr/price)
  const priceMetr = card.price_metr ?? 0;
  const hasDiscount =
    !!card.old_price &&
    ((priceMetr > 0 && card.old_price > priceMetr) ||
      (price > 0 && card.old_price > price));
  if (hasDiscount) return "SALE";
  const rating = Number(card.rating) || 0;
  if (rating >= 4.7 && (card.rating_count ?? 0) >= 3) return "HOT";
  const ms = Date.parse(card.created_at || "");
  if (!isNaN(ms) && ms > 0) {
    // NEW: created within last 7 days
    const ageMs = Date.now() - ms;
    if (ageMs >= 0 && ageMs < 7 * 24 * 60 * 60 * 1000) return "NEW";
  }
  return null;
}

function StatusPill({ tag }: { tag: StatusTag }) {
  const label =
    tag === "SALE" ? "СКИДКА" : tag === "HOT" ? "ТОП" : "НОВОЕ";
  const color =
    tag === "SALE"
      ? "var(--home-price)"
      : tag === "HOT"
      ? "var(--home-star)"
      : "var(--home-success)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 8,
        background: "rgba(10,10,12,0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
      }}
    >
      {label}
    </span>
  );
}

interface PropertyCardProps {
  card: ICard;
  variant?: "default" | "popular";
  /** Показывать ли WhatsApp-кнопку под адресом (для /favorite). По умолчанию false. */
  showWhatsapp?: boolean;
}

function PropertyCardImpl({ card, variant = "default", showWhatsapp = false }: PropertyCardProps) {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state) => state.auth);
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const price = useMemo(() => parsePriceToNumber(card.price), [card.price]);
  const tag = useMemo(() => resolveTag(card, price), [card, price]);

  const imageUrls = useMemo(() => {
    return (card.images ?? [])
      .map((i) => i.image)
      .filter((src): src is string => !!src && src.trim() !== "");
  }, [card.images]);
  const hasImage = imageUrls.length > 0;

  const areaNum = useMemo(() => {
    const a = Number(card.area);
    return isFinite(a) ? a : 0;
  }, [card.area]);

  const metaParts = useMemo(() => {
    const parts: string[] = [];
    if (card.rooms) parts.push(`${card.rooms}-комн`);
    if (areaNum) parts.push(`${areaNum} м²`);
    if (card.floor && card.total_floors) {
      parts.push(`${card.floor}/${card.total_floors}`);
    } else if (card.floor) {
      parts.push(`${card.floor} эт.`);
    }
    return parts;
  }, [card.rooms, areaNum, card.floor, card.total_floors]);

  const isFav = !!card.is_favorite;

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuth) {
        alert("Войдите в систему, чтобы добавить в избранное");
        return;
      }
      const current = !!card.is_favorite;
      // Optimistic flip
      dispatch(updateCardFavorite({ id: card.id, is_favorite: !current }));
      // Fire API, rollback on failure
      dispatch(toggleFavorite({ id: card.id, is_favorite: current })).then(
        (action) => {
          if (action.meta.requestStatus === "rejected") {
            dispatch(
              updateCardFavorite({ id: card.id, is_favorite: current })
            );
          }
        }
      );
    },
    [card, dispatch, isAuth]
  );

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      const delta = now - lastTapRef.current;

      if (delta > 0 && delta < 300) {
        // Double tap detected — prevent link navigation
        e.preventDefault();
        e.stopPropagation();
        if (!card.is_favorite && isAuth) {
          // Instagram-style: only add to favorites on double-tap
          dispatch(updateCardFavorite({ id: card.id, is_favorite: true }));
          dispatch(
            toggleFavorite({ id: card.id, is_favorite: false })
          ).then((action) => {
            if (action.meta.requestStatus === "rejected") {
              dispatch(
                updateCardFavorite({ id: card.id, is_favorite: false })
              );
            }
          });
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 1000);
        } else if (!card.is_favorite && !isAuth) {
          // Still show visual feedback, but don't persist
          setShowHeart(true);
          setTimeout(() => setShowHeart(false), 1000);
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    },
    [card, isAuth, dispatch]
  );

  return (
    <Link
      href={`/card/${card.id}`}
      className="product-card press-scale-card"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--home-surface)",
        border: "none",
        borderRadius: 14,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        transition: "transform 220ms ease",
      }}
      data-variant={variant}
    >
      {/* Photo с свайпаемой галереей */}
      <div
        className="product-card-photo"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "5 / 6",
          overflow: "hidden",
          background: "var(--home-surface-tinted)",
        }}
      >
        {hasImage ? (
          <CardImageCarousel
            images={imageUrls}
            alt={card.title}
            onDoubleTap={handleDoubleTap}
          />
        ) : (
          <div
            onClick={handleDoubleTap}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #1D2024 0%, #2F3135 100%)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--home-accent-soft)",
                border: "1px solid var(--home-accent)",
              }}
            />
          </div>
        )}

        {/* Double-tap heart burst */}
        {showHeart && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            style={{
              animation: "heartBurst 1s ease-out forwards",
            }}
          >
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill={FAVORITE_COLOR}
              aria-hidden="true"
            >
              <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
            </svg>
          </div>
        )}

        {/* Favorite button — top-right */}
        <button
          type="button"
          onClick={handleFavorite}
          aria-label={isFav ? "Удалить из избранного" : "Добавить в избранное"}
          className="active:scale-90 transition-transform"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,10,12,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Heart
            size={20}
            strokeWidth={2}
            style={{
              color: isFav ? FAVORITE_COLOR : "#FFFFFF",
              fill: isFav ? FAVORITE_COLOR : "none",
              transition: "color 160ms ease, fill 160ms ease",
            }}
          />
        </button>

        {/* Status pill — bottom-left */}
        {tag && (
          <div style={{ position: "absolute", bottom: 12, left: 12 }}>
            <StatusPill tag={tag} />
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className="product-card-content"
        style={{
          padding: "12px 14px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flex: 1,
        }}
      >
        {/* Price — pink, mobile-first prominent */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span
            className="product-card-price"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--home-price)",
              letterSpacing: "-0.01em",
            }}
          >
            {formatRub(price)}
          </span>
          {card.old_price && card.old_price > price ? (
            <span
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--home-text-tertiary)",
                textDecoration: "line-through",
              }}
            >
              {formatRub(card.old_price)}
            </span>
          ) : null}
        </div>

        {/* Title */}
        <h3
          className="product-card-title"
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.3,
            color: "var(--home-text-primary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {card.title}
        </h3>

        {/* Meta: rooms • area • floor */}
        {metaParts.length > 0 && (
          <div
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--home-text-secondary)",
              display: "flex",
              gap: 4,
              alignItems: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {metaParts.join(" · ")}
          </div>
        )}

        {/* Address */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 400,
            color: "var(--home-text-tertiary)",
          }}
        >
          <MapPin
            size={11}
            style={{
              color: "var(--home-accent-link)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {card.address}
          </span>
        </div>

        {/* WhatsApp CTA — показывается только если showWhatsapp=true */}
        {showWhatsapp && (
          <button
            type="button"
            onClick={(e) => {
              // Карточка обёрнута в <Link> — блокируем переход на детальную
              e.preventDefault();
              e.stopPropagation();
              const cardUrl =
                typeof window !== "undefined"
                  ? `${window.location.origin}/card/${card.id}`
                  : undefined;
              const url = buildWhatsappLink(card.title || card.address || "", cardUrl);
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            aria-label={`Написать в WhatsApp по объекту ${card.title}`}
            className="press-scale"
            style={{
              marginTop: 8,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 10,
              border: "none",
              background: "#25D366",
              color: "#FFFFFF",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 160ms ease",
            }}
          >
            {/* Inline WhatsApp glyph (SVG path) */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .product-card-content {
            padding: 16px !important;
            gap: 8px !important;
          }
          .product-card-price {
            font-size: 18px !important;
          }
          .product-card-title {
            font-size: 16px !important;
          }
        }
      `}</style>
    </Link>
  );
}

export const PropertyCard = memo(PropertyCardImpl, (prev, next) => {
  return (
    prev.variant === next.variant &&
    prev.card.id === next.card.id &&
    prev.card.is_favorite === next.card.is_favorite &&
    prev.card.title === next.card.title &&
    prev.card.price === next.card.price &&
    prev.card.old_price === next.card.old_price &&
    prev.card.address === next.card.address &&
    prev.card.rating === next.card.rating &&
    prev.card.rating_count === next.card.rating_count &&
    prev.variant === next.variant &&
    prev.showWhatsapp === next.showWhatsapp
  );
});

export default PropertyCard;
