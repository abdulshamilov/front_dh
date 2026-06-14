import { ICard, IDeveloperDetail } from "./models";

export interface ISearchHistoryItem {
  id: number;
  query: string;
  created_at?: string;
}

export interface IUser {
    id: number;
    name: string;
    phone_number: string;
    avatar?: string;
    profile_photo?: string;
}

export interface IAuthSliceState {
    isAuth: boolean;
    user: IUser | null;
    loading: boolean;
    error: string | null;
    initialized: boolean;
}

export interface ICardsSliceState {
    cards: ICard[];
    currentCard: ICard | null;
    searchResults: ICard[];
    recentViews: ICard[];
    searchHistory: ISearchHistoryItem[];
    searchHistoryLoading: boolean;
    similarCards: ICard[];
    similarCardsLoading: boolean;
    personalRecommendations: ICard[];
    personalRecommendationsLoading: boolean;
    loading: boolean;
    searchLoading: boolean;
    recentViewsLoading: boolean;
    error: string | null;
    isFavoritesPage: boolean;
    hasMore: boolean;
    page: number;
    totalCount: number;
    globalTotalCount: number;
    favoritesCount: number;
}

export interface IDevelopersSliceState {
    developers: IDeveloperDetail[];
    currentDeveloper: IDeveloperDetail | null;
    subscriptions: IDeveloperDetail[];
    loading: boolean;
    error: string | null;
}