export const translateHouseType = (type: string): string => {
  const translations: Record<string, string> = {
    apartment: "Квартира",
    new_building: "Новостройка",
    secondary: "Вторичное жильё",
    private: "Частный дом",
    townhouse: "Таунхаус",
    studio: "Студия",
    penthouse: "Пентхаус",
    duplex: "Дуплекс",
    cottage: "Коттедж",
    brick_monolith: "Кирпично-монолитный",
    panel: "Панельный",
    monolith: "Монолитный",
    commercial: "Коммерческая",
    office: "Офис",
    land: "Земельный участок",
  };
  return translations[type] || type;
};

export const translateBuildingMaterial = (material: string): string => {
  const translations: Record<string, string> = {
    brick: "Кирпичный",
    panel: "Панельный",
    monolith: "Монолитный",
    brick_monolith: "Кирпично-монолитный",
    solid_monolith: "Цельно-монолитный",
  };
  return translations[material] || material;
};

export const translateCategory = (category: string): string => {
  const translations: Record<string, string> = {
    flat: "Квартира",
    new_building: "Новостройка",
    secondary: "Вторичное жильё",
  };
  return translations[category] || category;
};

export const translateCity = (cityId: number): string => {
  const translations: Record<number, string> = {
    1: "Махачкала",
    2: "Каспийск",
    3: "Дербент",
    4: "Избербаш",
  };
  return translations[cityId] || "Махачкала";
};

export const translateElevator = (elevator: string): string => {
  const translations: Record<string, string> = {
    none: "Нет",
    passenger: "Пассажирский",
    cargo: "Грузовой",
    cargo_passenger: "Грузопассажирский",
    passenger_and_cargo: "Пассажирский и грузовой",
  };
  return translations[elevator] || elevator;
};

export const translateParking = (parking: string): string => {
  const translations: Record<string, string> = {
    none: "Нет",
    underground: "Подземная",
    ground: "Наземная",
    two_level: "Двухуровневая",
  };
  return translations[parking] || parking;
};

export const translateFinishing = (finishing: string): string => {
  const translations: Record<string, string> = {
    none: "Без отделки",
    with_finish: "С отделкой",
  };
  return translations[finishing] || finishing;
};

export const formatPrice = (price: string | number): string => {
  return new Intl.NumberFormat("ru-RU").format(parseFloat(String(price)));
};

/**
 * Build a Cian/DomClick-style structured H1 title:
 *   "3-комн. · 73 м² · «Сити»"
 *
 * Rules:
 * - rooms > 0 → "N-комн."; rooms 0/undefined → "Студия".
 * - area > 0 → "X м²"; otherwise the segment is dropped.
 * - developer.name → wrapped in guillemets; otherwise the segment is dropped.
 *   The entity is called "developer" in code but represents a residential
 *   complex in the UI — see memory/feedback_complex_terminology.md.
 * - If the structured form ends up with fewer than 2 segments (i.e. only
 *   "Студия" with no area and no complex), fall back to the raw API title
 *   so the page never shows a one-word H1.
 */
import type { ICard } from "@/app/types/models";

export const buildStructuredTitle = (card: ICard): string => {
  const parts: string[] = [];

  if (card.rooms && card.rooms > 0) {
    parts.push(`${card.rooms}-комн.`);
  } else {
    parts.push("Студия");
  }

  const areaNum = Number(card.area);
  if (Number.isFinite(areaNum) && areaNum > 0) {
    parts.push(`${areaNum} м²`);
  }

  const complex = card.developer?.name?.trim();
  if (complex) {
    parts.push(`«${complex}»`);
  }

  if (parts.length < 2) {
    return card.title || parts[0] || "Объект";
  }
  return parts.join(" · ");
};
