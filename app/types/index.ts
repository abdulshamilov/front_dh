export interface IRegisterForm {
  name: string;
  phone_number: string;
  otp?: string;
  ref_code?: string;
}

export interface ILoginForm {
  phone_number: string;
  otp?: string;
}

export interface ICardFilters {
  // Текстовый поиск
  search?: string;
  
  // Фильтры по выбору
  complex_type?: "residential" | "apart";
  house_type?: "brick" | "panel" | "monolith" | "brick_monolith" | "solid_monolith";
  city?: 1 | 2 | 3 | 4;
  developer?: number;
  category?: "flat" | "new_building" | "secondary";
  finishing?: "none" | "with_finish";
  elevator?: "none" | "passenger" | "cargo" | "cargo_passenger" | "passenger_and_cargo";
  parking?: "none" | "underground" | "ground" | "two_level";
  
  // Булевые фильтры
  balcony?: boolean;
  loggia?: boolean;
  
  // Числовые диапазоны
  price_min?: number;
  price_max?: number;
  rooms_min?: number;
  rooms_max?: number;
  area_min?: number;
  area_max?: number;
  floors_min?: number;
  floors_max?: number;
  price_per_sqm_min?: number;
  price_per_sqm_max?: number;
  ceiling_height_min?: number;
  ceiling_height_max?: number;
}

export interface PromoCardItem {
  card: {
    id: number;
    title: string;
    address: string;
    price: string;
    price_metr: number;
    rooms: number;
    area: string;
    city: number;
    rating: string;
    developer: {
      id: number;
      name: string;
      logo: string | null;
      is_subscribed: boolean;
    };
    is_favorite: boolean;
    latitude: number | null;
    longitude: number | null;
  };
  discount_percent: string;
  benefit_amount: string;
  valid_until: string | null;
}

export interface PromotionDTO {
  id: number;
  title?: string | null;
  description?: string | null;
  banner_image?: string | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  is_active?: boolean;
  promotion_type?: string | null;
  background_color?: string | null;
  items?: PromoCardItem[];
}
