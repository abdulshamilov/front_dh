export interface ICardImage {
  id: number;
  image: string;
}

export interface IDeveloper {
  id: number;
  name: string;
  logo: string;
  phone?: string;
  is_subscribed?: boolean;
}

export interface IDeveloperDetail extends IDeveloper {
  cards: ICard[];
  is_subscribed: boolean;
}

export interface IDocument {
  id: number;
  title: string;
  file: string;
  uploaded_at: string;
}

export interface IVideo {
  id: number;
  video: string;
}

export interface IReviewImage {
  id: number;
  image: string;
}

export interface IDeveloperResponse {
  id: number;
  developer_name: string;
  response_text: string;
  created_at: string;
}

export interface IQuestionUser {
  id: number;
  name: string;
  phone_number: string;
  profile_photo?: string;
}

export interface IQuestion {
  id: number;
  card: number;
  user: number | IQuestionUser;
  question: string;
  answer?: string;
  created_at: string;
}

export interface IReview {
  id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  images: IReviewImage[];
  created_at: string;
  helpful_count: number;
  not_helpful_count: number;
  user_vote?: 'helpful' | 'not_helpful' | null;
  developer_response?: IDeveloperResponse;
}

export interface ICard {
  id: number;
  title: string;
  address: string;
  description: string;
  price: string;
  price_metr: number;
  rooms: number;
  city: number;
  house_type: string;
  area: string;
  /** Wall construction material (e.g. brick, monolith). May be null in
   *  the current API while values are accidentally stored in `house_type`.
   *  See TECH_DEBT.md → "Backend data inconsistency: house_type vs
   *  building_material". */
  building_material?: string;
  category: string;
  floors_total: number;
  elevator: string;
  parking: string;
  balcony: boolean;
  ceiling_height: string;
  // NOTE: the API may return null here when the object has no
  // geocoded coordinates (e.g. only an address — see card 46).
  // The declared type stays `number` to avoid breaking the
  // in-progress /app/map components, but consumers MUST runtime-guard
  // (e.g. `card.latitude != null && Number.isFinite(...)`) before use.
  latitude: number;
  longitude: number;
  rating: string;
  rating_count: number;
  owner: string;
  developer: IDeveloper;
  images: ICardImage[];
  videos: IVideo[];
  documents?: IDocument[];
  questions?: IQuestion[];
  reviews?: IReview[];
  recommendations?: ICard[];
  list_curations?: ICard[];
  renovation?: string;
  created_at: string;
  is_favorite?: boolean;
  is_hidden?: boolean;
  old_price?: number;
  floor?: number;
  total_floors?: number;
  installment?: boolean;
  is_verified?: boolean;
  /** URL of the floor-plan image. When present, the "Планировка" tab is shown
   *  on the detail page; when absent, the tab is hidden entirely. */
  floor_plan_image?: string;
}