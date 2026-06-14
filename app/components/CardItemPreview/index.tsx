"use client";

import Image from "next/image";
import Link from "next/link";
import { ICard } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { toggleFavorite, updateCardFavorite } from "@/app/shared/redux/slices/cards";
import { SHORT_PHONE_TEL } from "@/app/shared/utils/contacts";
import { ReactElement, memo, useMemo, useCallback, useState, useRef } from "react";

const FAVORITE_COLOR = "#F1117E";

type StatusTag = "NEW" | "HOT" | "SALE";

function resolveTag(card: ICard): StatusTag | null {
  // Priority: SALE > HOT > NEW
  const hasDiscount =
    !!card.old_price && !!card.price_metr && card.old_price > card.price_metr;
  if (hasDiscount) return "SALE";
  const rating = Number(card.rating) || 0;
  if (rating >= 4.7 && (card.rating_count ?? 0) >= 3) return "HOT";
  const ms = Date.parse(card.created_at || "");
  if (!isNaN(ms) && ms > 0) {
    const ageMs = Date.now() - ms;
    if (ageMs >= 0 && ageMs < 7 * 24 * 60 * 60 * 1000) return "NEW";
  }
  return null;
}

function StatusBadge({ tag }: { tag: StatusTag }) {
  const label =
    tag === "SALE" ? "СКИДКА" : tag === "HOT" ? "ТОП" : "НОВОЕ";
  const color =
    tag === "SALE"
      ? "#FF4444"
      : tag === "HOT"
      ? "#FFF600"
      : "#1EED61";
  return (
    <span
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        zIndex: 10,
      }}
    >
      {label}
    </span>
  );
}

interface CardItemPreviewProps {
  card: ICard;
  showCallButton?: boolean;
}

export const CellComponent: React.FC<CardItemPreviewProps> = ({ card }) => {
  return <CardItemPreview card={card} />;
};

export const CardItemPreview = memo(function CardItemPreview({ card, showCallButton }: CardItemPreviewProps): ReactElement {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state) => state.auth);
  const [imgError, setImgError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);

  const tag = useMemo(() => resolveTag(card), [card]);

  const formattedPrice = useMemo(
    () => new Intl.NumberFormat("ru-RU").format(card.price_metr),
    [card.price_metr]
  );

  // Filter valid images (non-empty strings)
  const validImages = useMemo(
    () =>
      (card.images ?? []).filter(
        (img) => img.image && img.image.trim() !== ""
      ),
    [card.images]
  );

  const hasMultipleImages = validImages.length > 1;

  const mainImage = useMemo(
    () => (validImages.length > 0 ? validImages[0].image : "/placeholder.jpg"),
    [validImages]
  );


  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      alert("Войдите в систему, чтобы добавить в избранное");
      return;
    }
    dispatch(
      toggleFavorite({ id: card.id, is_favorite: card.is_favorite || false })
    );
  }, [dispatch, isAuth, card.id, card.is_favorite]);

  const handleImageError = useCallback(() => {
    setImgError(true);
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    setActiveIndex(index);
  }, []);

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      const delta = now - lastTapRef.current;

      if (delta > 0 && delta < 300) {
        // Double tap detected — prevent link navigation
        e.preventDefault();
        e.stopPropagation();
        if (!card.is_favorite && isAuth) {
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
    <Link href={`/card/${card.id}`} className="block group">
      <div
        className="font-[family-name:var(--font-stetica-bold)] w-full overflow-hidden rounded-[16px] press-scale-card"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-glass)",
        }}
      >
        {/* Image section — 5:6 aspect ratio like mobile */}
        <div
          className="relative w-full"
          style={{ aspectRatio: "5/6" }}
          onClick={handleDoubleTap}
        >
          {hasMultipleImages ? (
            /* Carousel for multiple images */
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="tabs-scroll flex w-full h-full"
              style={{
                overflowX: "auto",
                scrollSnapType: "x mandatory",
              }}
            >
              {validImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="relative flex-shrink-0 w-full h-full"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 490px"
                    className="object-cover"
                    src={imgError && idx === 0 ? "/placeholder.jpg" : img.image}
                    alt={`${card.title} — ${idx + 1}`}
                    priority={false}
                    loading={idx === 0 ? "eager" : "lazy"}
                    onError={idx === 0 ? handleImageError : undefined}
                    quality={75}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Single image fallback */
            <Image
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 490px"
              className="object-cover"
              src={imgError ? "/placeholder.jpg" : mainImage}
              alt={card.title}
              priority={false}
              loading="lazy"
              onError={handleImageError}
              quality={75}
            />
          )}
          {/* Status badge — top-left */}
          {tag && <StatusBadge tag={tag} />}

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

          {/* Favorite button — transparent, no glassmorphism (matches mobile) */}
          <button
            className="absolute top-3 right-3 w-[44px] h-[44px] flex items-center justify-center transition-all duration-200 z-10"
            style={{
              background: "transparent",
            }}
            onClick={handleFavoriteClick}
            aria-label={
              card.is_favorite
                ? "Удалить из избранного"
                : "Добавить в избранное"
            }
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 30 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
            >
              <path
                d="M15 4.1201L14.2465 4.84248C14.3441 4.94332 14.4612 5.02353 14.5906 5.07831C14.7201 5.1331 14.8593 5.16133 15 5.16133C15.1407 5.16133 15.2799 5.1331 15.4094 5.07831C15.5388 5.02353 15.6559 4.94332 15.7535 4.84248L15 4.1201ZM11.4084 21.9324C9.29302 20.2723 6.98093 18.6511 5.14605 16.5951C3.34884 14.578 2.09302 12.2261 2.09302 9.17262H0C0 12.8762 1.54884 15.7019 3.58186 17.9788C5.57721 20.2154 8.12232 22.0074 10.1121 23.5689L11.4084 21.9324ZM2.09302 9.17262C2.09302 6.18584 3.78837 3.67972 6.10326 2.62532C8.35256 1.60148 11.3749 1.87237 14.2465 4.84248L15.7535 3.3991C12.3488 -0.125297 8.39163 -0.707372 5.23256 0.73045C2.14326 2.13771 0 5.40511 0 9.17262H2.09302ZM10.1121 23.5689C10.8279 24.1301 11.5953 24.7275 12.3726 25.1804C13.1498 25.6333 14.0372 26 15 26V23.9162C14.5674 23.9162 14.0595 23.7495 13.4288 23.3814C12.7967 23.0146 12.1423 22.5089 11.4084 21.9324L10.1121 23.5689ZM19.8879 23.5689C21.8777 22.0061 24.4228 20.2168 26.4181 17.9788C28.4512 15.7005 30 12.8762 30 9.17262H27.907C27.907 12.2261 26.6512 14.578 24.854 16.5951C23.0191 18.6511 20.707 20.2723 18.5916 21.9324L19.8879 23.5689ZM30 9.17262C30 5.40511 27.8581 2.13771 24.7674 0.73045C21.6084 -0.707372 17.654 -0.125297 14.2465 3.39771L15.7535 4.84248C18.6251 1.87376 21.6474 1.60148 23.8967 2.62532C26.2116 3.67972 27.907 6.18445 27.907 9.17262H30ZM18.5916 21.9324C17.8577 22.5089 17.2033 23.0146 16.5712 23.3814C15.9391 23.7481 15.4326 23.9162 15 23.9162V26C15.9628 26 16.8502 25.6319 17.6274 25.1804C18.406 24.7275 19.1721 24.1301 19.8879 23.5689L18.5916 21.9324Z"
                fill={card.is_favorite ? "var(--favorite)" : "white"}
                style={{ transition: "fill 0.3s ease" }}
              />
            </svg>
          </button>
          {/* Dot indicators — only shown for multiple images */}
          {hasMultipleImages && (
            <div
              className="absolute flex items-center justify-center gap-[4px] pointer-events-none z-10"
              style={{
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(7,7,7,0.3)",
                borderRadius: "9999px",
                padding: "4px 8px",
              }}
            >
              {validImages.map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    width: idx === activeIndex ? "14px" : "5px",
                    height: "5px",
                    borderRadius: idx === activeIndex ? "9999px" : "50%",
                    backgroundColor:
                      idx === activeIndex
                        ? "white"
                        : "rgba(255,255,255,0.4)",
                    transition: "width 0.2s ease",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content section */}
        <div
          className="px-3 py-3"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          {/* Price — pink like mobile app */}
          <p
            className="text-lg font-[family-name:var(--font-stetica-bold)]"
            style={{ color: "var(--price-color)" }}
          >
            {formattedPrice} ₽{" "}
            <span
              className="text-xs font-[family-name:var(--font-stetica-regular)]"
              style={{ color: "var(--text-secondary)" }}
            >
              / м²
            </span>
            {card.old_price && card.old_price > card.price_metr && (
              <span style={{
                color: "var(--text-disabled)",
                textDecoration: "line-through",
                fontSize: "11px",
                marginLeft: "6px",
              }}>
                {new Intl.NumberFormat("ru-RU").format(card.old_price)} ₽
              </span>
            )}
          </p>

          {/* Title */}
          <h3
            className="font-[family-name:var(--font-stetica-regular)] text-[13px] leading-[18px] line-clamp-2 mt-1"
            style={{ color: "var(--text-primary)" }}
          >
            {card.title}
          </h3>

          {/* Rating + Location row */}
          <div className="flex items-center gap-2 mt-2">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <svg className="w-[14px] h-[14px]" viewBox="0 0 21 20" fill="none">
                <path
                  d="M10.4609 0L12.9306 7.60081H20.9226L14.4569 12.2984L16.9266 19.8992L10.4609 15.2016L3.9953 19.8992L6.46495 12.2984L-0.000683784 7.60081H7.99128L10.4609 0Z"
                  fill="var(--rating)"
                />
              </svg>
              <span
                className="text-[14px] font-[family-name:var(--font-stetica-medium)]"
                style={{ color: "var(--text-primary)" }}
              >
                {card.rating}
              </span>
            </div>

            {/* Separator */}
            <span style={{ color: "var(--text-tertiary)" }}>•</span>

            {/* Location */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <svg
                className="w-[14px] h-[14px] flex-shrink-0"
                viewBox="0 0 24 24"
                fill="var(--location)"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span
                className="text-[13px] line-clamp-1 font-[family-name:var(--font-stetica-medium)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {card.address}
              </span>
            </div>
          </div>

          {/* Call button for favorites — button instead of <a> to avoid nested links */}
          {showCallButton && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = SHORT_PHONE_TEL;
              }}
              className="block w-full mt-2 text-center text-white text-sm font-[family-name:var(--font-stetica-medium)] transition-opacity hover:opacity-90"
              style={{
                height: "36px",
                lineHeight: "36px",
                backgroundColor: "var(--brand-blue-button)",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Позвонить
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.is_favorite === nextProps.card.is_favorite &&
    prevProps.card.title === nextProps.card.title &&
    prevProps.card.price_metr === nextProps.card.price_metr &&
    prevProps.card.rating === nextProps.card.rating &&
    prevProps.card.address === nextProps.card.address &&
    prevProps.card.images?.length === nextProps.card.images?.length &&
    prevProps.card.images?.[0]?.image === nextProps.card.images?.[0]?.image &&
    prevProps.card.old_price === nextProps.card.old_price &&
    prevProps.showCallButton === nextProps.showCallButton
  );
});
