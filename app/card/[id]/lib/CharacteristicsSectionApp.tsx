"use client";

import {
  BedDouble,
  Maximize,
  Building2,
  ArrowUpToLine,
  Home,
  BrickWall,
  DoorClosed,
  CircleParking,
  Fence,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ICard } from "@/app/types/models";
import {
  translateHouseType,
  translateBuildingMaterial,
  translateCategory,
  translateElevator,
  translateParking,
} from "@/app/card/[id]/lib";

/**
 * Mirrors CharacteristicsSection / KeyMetricsGrid / CharacteristicRowWithIcon
 * from DetailCharacteristics.kt.
 *
 * KeyMetricsGrid: 2x2. Row 1 = [rooms, area m²], Row 2 = [floor, ceiling m].
 * Compose uses property.floors_total for the "этаж" card and rounds
 * ceiling_height to 1 decimal. Missing value → "-" (single hyphen).
 *
 * "О доме" list: rows added conditionally (only when the field is present),
 * order = house_type, building_material, elevator, parking, balcony, category.
 *
 * Verbatim strings (strings.xml):
 *   about_building="О доме", rooms_label="комнаты", area_sqm="м²",
 *   floor_short="этаж", ceiling_height_m="м потолки",
 *   house_type="Тип дома", wall_material="Материал стен",
 *   elevator="Лифт", parking="Парковка",
 *   balcony_loggia="Балкон / лоджия", category="Категория",
 *   value_yes="Есть", value_no="Нет".
 */

// GlassCard surface: --surface + white gradient overlay + 1px white border.
const GLASS_STYLE: React.CSSProperties = {
  background: "var(--surface)",
  backgroundImage:
    "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.016) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function KeyMetricCard({
  Icon,
  value,
  label,
}: {
  Icon: LucideIcon;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        ...GLASS_STYLE,
        flex: 1,
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px",
      }}
    >
      <Icon size={28} color="var(--accent-primary)" aria-hidden="true" />
      {/* Spacer 8px (Spacing.sm) */}
      <span
        style={{
          marginTop: "8px",
          fontSize: "22px",
          fontWeight: 700,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </span>
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
    </div>
  );
}

interface CharRow {
  key: string;
  Icon: LucideIcon;
  label: string;
  value: string;
}

function CharacteristicRowWithIcon({
  Icon,
  label,
  value,
}: Omit<CharRow, "key">) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "4px 0",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="var(--text-secondary)" aria-hidden="true" />
      </div>

      {/* Spacer 12px (Spacing.md) */}
      <span
        style={{
          marginLeft: "12px",
          flex: 1,
          fontSize: "14px",
          fontFamily: "var(--font-stetica-medium)",
          color: "var(--text-secondary)",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function CharacteristicsSectionApp({ card }: { card: ICard }) {
  // KeyMetricsGrid — Compose: rooms, area.toInt(), floors_total.toInt(),
  // ceiling rounded to 1 decimal. "-" placeholder when absent.
  const roomsValue =
    card.rooms != null && card.rooms > 0 ? String(card.rooms) : "-";

  const areaNum = Number(card.area);
  const areaValue =
    Number.isFinite(areaNum) && areaNum > 0 ? String(Math.trunc(areaNum)) : "-";

  const floorNum = Number(card.floors_total);
  const floorValue =
    Number.isFinite(floorNum) && floorNum > 0
      ? String(Math.trunc(floorNum))
      : "-";

  const ceilingNum = Number(card.ceiling_height);
  const ceilingValue =
    Number.isFinite(ceilingNum) && ceilingNum > 0
      ? String(Math.trunc(ceilingNum * 10) / 10)
      : "-";

  // "О доме" list — conditional, same order as Compose buildList.
  const rows: CharRow[] = [];

  if (card.house_type && card.house_type.trim().length > 0) {
    rows.push({
      key: "house_type",
      Icon: Home,
      label: "Тип дома",
      value: translateHouseType(card.house_type),
    });
  }
  if (card.building_material && card.building_material.trim().length > 0) {
    rows.push({
      key: "building_material",
      Icon: BrickWall,
      label: "Материал стен",
      value: translateBuildingMaterial(card.building_material),
    });
  }
  if (card.elevator && card.elevator.trim().length > 0) {
    rows.push({
      key: "elevator",
      Icon: DoorClosed,
      label: "Лифт",
      value: translateElevator(card.elevator),
    });
  }
  if (card.parking && card.parking.trim().length > 0) {
    rows.push({
      key: "parking",
      Icon: CircleParking,
      label: "Парковка",
      value: translateParking(card.parking),
    });
  }
  if (typeof card.balcony === "boolean") {
    rows.push({
      key: "balcony",
      Icon: Fence,
      label: "Балкон / лоджия",
      value: card.balcony ? "Есть" : "Нет",
    });
  }
  if (card.category && card.category.trim().length > 0) {
    rows.push({
      key: "category",
      Icon: Home,
      label: "Категория",
      value: translateCategory(card.category),
    });
  }

  return (
    <div style={{ padding: "12px 16px" }}>
      {/* KeyMetricsGrid 2x2 — Column gap 8 (Spacing.sm) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <KeyMetricCard Icon={BedDouble} value={roomsValue} label="комнаты" />
          <KeyMetricCard Icon={Maximize} value={areaValue} label="м²" />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <KeyMetricCard Icon={Building2} value={floorValue} label="этаж" />
          <KeyMetricCard
            Icon={ArrowUpToLine}
            value={ceilingValue}
            label="м потолки"
          />
        </div>
      </div>

      {/* Spacer 16px (Spacing.lg) */}
      <div
        style={{
          marginTop: "16px",
          fontSize: "16px",
          fontWeight: 600,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        О доме
      </div>

      {/* Spacer 12px (Spacing.md) */}
      <div style={{ marginTop: "12px" }}>
        {rows.map((row, index) => (
          <div key={row.key}>
            <CharacteristicRowWithIcon
              Icon={row.Icon}
              label={row.label}
              value={row.value}
            />
            {index < rows.length - 1 ? (
              <div
                style={{
                  height: "1px",
                  background:
                    "color-mix(in srgb, var(--divider) 20%, transparent)",
                  margin: "8px 0",
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
