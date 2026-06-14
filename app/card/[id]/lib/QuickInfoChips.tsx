"use client";

import { useState } from "react";
import { BedDouble, Maximize, Building2, Star } from "lucide-react";
import type { ICard } from "@/app/types/models";
import type { LucideIcon } from "lucide-react";

/**
 * Mirrors QuickInfoChips / QuickInfoChip from DetailPriceSection.kt.
 *
 * Horizontal scroll row of pill chips. Each chip = icon (16px) + value
 * (12/600 bold) + optional label (11/500 medium). Rating chip uses the
 * gold accent color and is pressable when onRatingClick is provided.
 */

interface QuickInfoChipsProps {
  card: ICard;
  onRatingClick?: () => void;
}

interface ChipModel {
  key: string;
  Icon: LucideIcon;
  value: string;
  label: string;
  accentColor: string;
  onClick?: () => void;
}

function QuickInfoChip({
  Icon,
  value,
  label,
  accentColor,
  onClick,
}: Omit<ChipModel, "key">) {
  const [pressed, setPressed] = useState(false);
  const isClickable = typeof onClick === "function";

  const release = () => {
    if (pressed) setPressed(false);
  };

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? onClick : undefined}
      onPointerDown={isClickable ? () => setPressed(true) : undefined}
      onPointerUp={isClickable ? release : undefined}
      onPointerLeave={isClickable ? release : undefined}
      onPointerCancel={isClickable ? release : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
        borderRadius: "12px",
        background: "var(--surface)",
        padding: "8px 12px",
        cursor: isClickable ? "pointer" : "default",
        userSelect: "none",
        transform: pressed ? "scale(0.95)" : "scale(1)",
        transition: "transform 120ms ease-out",
      }}
    >
      <Icon size={16} color={accentColor} aria-hidden="true" />
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </span>
      {label.length > 0 ? (
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            fontFamily: "var(--font-stetica-medium)",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function QuickInfoChips({ card, onRatingClick }: QuickInfoChipsProps) {
  const chips: ChipModel[] = [];

  // Rooms — strings.xml: rooms_short = "комн."
  if (card.rooms && card.rooms > 0) {
    chips.push({
      key: "rooms",
      Icon: BedDouble,
      value: String(card.rooms),
      label: "комн.",
      accentColor: "var(--accent-primary)",
    });
  }

  // Area — strings.xml: area_sqm = "м²"
  const area = Number(card.area);
  if (Number.isFinite(area) && area > 0) {
    chips.push({
      key: "area",
      Icon: Maximize,
      value: String(area),
      label: "м²",
      accentColor: "var(--accent-primary)",
    });
  }

  // Floor — strings.xml: floor_short = "этаж"
  if (card.floor && card.total_floors) {
    chips.push({
      key: "floor",
      Icon: Building2,
      value: `${card.floor}/${card.total_floors}`,
      label: "этаж",
      accentColor: "var(--accent-primary)",
    });
  }

  // Rating — gold accent, pressable
  const rating = Number(card.rating);
  if (Number.isFinite(rating) && rating > 0 && card.rating_count > 0) {
    chips.push({
      key: "rating",
      Icon: Star,
      value: rating.toFixed(1),
      label: `(${card.rating_count})`,
      accentColor: "var(--rating-chip)",
      onClick: onRatingClick,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {chips.map((chip) => (
        <QuickInfoChip
          key={chip.key}
          Icon={chip.Icon}
          value={chip.value}
          label={chip.label}
          accentColor={chip.accentColor}
          onClick={chip.onClick}
        />
      ))}
    </div>
  );
}
