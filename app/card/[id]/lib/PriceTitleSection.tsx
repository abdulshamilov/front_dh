"use client";

import { MapPin } from "lucide-react";
import type { ICard } from "@/app/types/models";
import {
  formatPrice,
  buildStructuredTitle,
  translateCity,
} from "@/app/card/[id]/lib";
import { parsePriceToNumber } from "@/app/shared/utils/price";
import { QuickInfoChips } from "./QuickInfoChips";

/**
 * Mirrors PriceAndTitleSection + PropertyBadges from DetailPriceSection.kt.
 *
 * Column: price (24/700 pink) → ₽/м² (12/400) → title (16/600, 2 lines) →
 * address (pin + 12/400) → QuickInfoChips → "✓ Проверено" badge.
 * On this screen Compose hardcodes hasInstallment = false, so only the
 * verified badge can appear (isVerified = developer != null).
 */

interface PriceTitleSectionProps {
  card: ICard;
  onRatingClick?: () => void;
}

export function PriceTitleSection({
  card,
  onRatingClick,
}: PriceTitleSectionProps) {
  const priceNumber = parsePriceToNumber(card.price);
  const priceText =
    priceNumber > 0 ? `${formatPrice(card.price)} ₽` : "Цена по запросу";

  const pricePerMeter =
    typeof card.price_metr === "number" && card.price_metr > 0
      ? card.price_metr
      : 0;

  const structuredTitle = buildStructuredTitle(card);
  const titleText =
    structuredTitle && structuredTitle.trim().length > 0
      ? structuredTitle
      : card.title || "Квартира";

  const cityName = card.city ? translateCity(card.city) : "";
  const hasAddress =
    typeof card.address === "string" && card.address.trim().length > 0;
  const fullAddress = hasAddress
    ? cityName && cityName.length > 0
      ? `${cityName}, ${card.address}`
      : card.address
    : "";

  const isVerified = card.developer != null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "12px 16px",
        background: "transparent",
      }}
    >
      {/* Price — large and prominent */}
      <span
        style={{
          fontSize: "24px",
          fontWeight: 700,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--price-color)",
        }}
      >
        {priceText}
      </span>

      {/* Price per meter */}
      {pricePerMeter > 0 ? (
        <span
          style={{
            fontSize: "12px",
            fontWeight: 400,
            fontFamily: "var(--font-stetica-medium)",
            color: "var(--text-secondary)",
          }}
        >
          {`${new Intl.NumberFormat("ru-RU").format(pricePerMeter)} ₽/м²`}
        </span>
      ) : null}

      {/* Title */}
      <span
        style={{
          marginTop: "12px",
          fontSize: "16px",
          fontWeight: 600,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
          lineHeight: "24px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {titleText}
      </span>

      {/* Address */}
      {fullAddress.length > 0 ? (
        <div
          style={{
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <MapPin
            size={14}
            color="var(--text-tertiary)"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: "12px",
              fontWeight: 400,
              fontFamily: "var(--font-stetica-medium)",
              color: "var(--text-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fullAddress}
          </span>
        </div>
      ) : null}

      {/* Quick Info Chips */}
      <div style={{ marginTop: "12px" }}>
        <QuickInfoChips card={card} onRatingClick={onRatingClick} />
      </div>

      {/* Badges — only verified (hasInstallment is false on this screen) */}
      {isVerified ? (
        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              borderRadius: "9px",
              background: "var(--badge-green)",
              padding: "6px 12px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-primary)",
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                fontFamily: "var(--font-stetica-bold)",
                color: "var(--text-primary)",
              }}
            >
              Проверено
            </span>
          </span>
        </div>
      ) : null}
    </div>
  );
}
