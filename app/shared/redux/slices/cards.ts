import axiosInstance from "@/app/shared/config/axios";
import { API_BASE_URL } from "@/app/shared/config/axios";
import { ICardsSliceState, ISearchHistoryItem } from "@/app/types/redux";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ICard } from "@/app/types/models";
import { ICardFilters } from "@/app/types";
import { logout } from "@/app/shared/redux/slices/auth";

interface FetchCardsResponse {
  results?: ICard[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export const fetchCards = createAsyncThunk<
  FetchCardsResponse & { append?: boolean },
  ICardFilters & { page?: number; append?: boolean; q?: string }
>("cards/fetchCards", async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    const { page = 1, append, q, ...restFilters } = filters || {};

    params.append("page", String(page));
    params.append("limit", "8");
    
    if (q && q.trim().length > 0) {
      params.append("q", q.trim());
    }

    if (restFilters) {
      Object.entries(restFilters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/cards/${queryString ? `?${queryString}` : ""}`;
    const { data } = await axiosInstance.get<FetchCardsResponse | ICard[]>(url);
    if (Array.isArray(data)) {
      return {
        results: data,
        count: data.length,
        next: null,
        previous: null,
        append: append || false,
      };
    }

    return { ...data, append: append || false };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return rejectWithValue(
      axiosError.message || "Не удалось загрузить карточки"
    );
  }
});

// Fetch total count of all cards globally (ignoring any filters like city).
// Used by the "AI подбор" banner so the number reflects the full catalog, not
// the currently filtered listing.
export const fetchGlobalTotalCount = createAsyncThunk<number, void>(
  "cards/fetchGlobalTotalCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<FetchCardsResponse | ICard[]>(
        `${API_BASE_URL}/cards/?limit=1&page=1`
      );
      if (Array.isArray(data)) return data.length;
      return data.count ?? 0;
    } catch (error: unknown) {
      const axiosError = error as { message?: string };
      return rejectWithValue(axiosError.message || "Не удалось получить общее количество");
    }
  }
);

export const fetchCardById = createAsyncThunk<ICard, number>(
  "cards/fetchCardById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<ICard>(
        `${API_BASE_URL}/cards/${id}/`
      );
      if (!data || typeof data !== 'object') {
        return rejectWithValue("Получены некорректные данные карточки");
      }
      return data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      if (axiosError.message?.includes('JSON')) {
        return rejectWithValue("Ошибка обработки данных с сервера");
      }
      return rejectWithValue(
        axiosError.message || "Не удалось загрузить карточку"
      );
    }
  }
);

export const searchCards = createAsyncThunk<
  ICard[],
  string | { query: string; filters?: ICardFilters }
>("cards/searchCards", async (arg, { rejectWithValue }) => {
  try {
    const query = typeof arg === "string" ? arg : arg.query;
    const filters = typeof arg === "object" ? arg.filters : undefined;
    
    if (!query || query.trim().length === 0) {
      return [];
    }
    
    const params = new URLSearchParams();
    params.append("q", query.trim());
    
    // Добавляем фильтры если они есть
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          params.append(key, String(value));
        }
      });
    }
    
    const { data } = await axiosInstance.get<FetchCardsResponse | ICard[]>(
      `${API_BASE_URL}/cards/search/?${params.toString()}`
    );
    
    // Обрабатываем ответ с пагинацией или массивом
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data && typeof data === 'object' && 'results' in data) {
      return Array.isArray(data.results) ? data.results : [];
    }
    
    return [];
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return rejectWithValue(axiosError.message || "Ошибка поиска");
  }
});

interface FavoriteCardItem {
  id: number;
  card: ICard;
}

interface FavoriteCardsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FavoriteCardItem[];
}

export const fetchFavoriteCards = createAsyncThunk<
  ICard[],
  number | undefined
>(
  "cards/fetchFavoriteCards",
  async (page = 1, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("Необходима авторизация");
      }

      const params = new URLSearchParams();
      params.append("page", String(page));

      const { data } = await axiosInstance.get<FavoriteCardsResponse>(
        `${API_BASE_URL}/cards/favorites/me/?${params.toString()}`
      );

      // Извлекаем card из каждого элемента results
      if (data && typeof data === "object" && "results" in data) {
        if (Array.isArray(data.results)) {
          return data.results.map((item) => item.card);
        }
      }

      return [];
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: { detail?: string; message?: string };
          status?: number;
        };
        message?: string;
      };

      let errorMessage = "Не удалось загрузить избранные карточки";

      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch total count of user's favorites globally, regardless of which page
// is open. Used by the BottomBar badge so the number reflects the full
// favorites list, not just favorites among currently visible catalog cards.
export const fetchFavoritesCount = createAsyncThunk<number, void>(
  "cards/fetchFavoritesCount",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("Необходима авторизация");
      }

      const { data } = await axiosInstance.get<FavoriteCardsResponse>(
        `${API_BASE_URL}/cards/favorites/me/?page=1`
      );
      return data.count ?? 0;
    } catch (error: unknown) {
      const axiosError = error as { message?: string };
      return rejectWithValue(
        axiosError.message || "Не удалось получить количество избранного"
      );
    }
  }
);

export const fetchRecentViews = createAsyncThunk<
  ICard[],
  { page?: number; limit?: number } | undefined
>(
  "cards/fetchRecentViews",
  async (params = { page: 1, limit: 8 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("Необходима авторизация");
      }

      const searchParams = new URLSearchParams();
      if (params.page !== undefined) {
        searchParams.append("page", String(params.page));
      }
      if (params.limit !== undefined) {
        searchParams.append("limit", String(params.limit));
      }

      const { data } = await axiosInstance.get<FetchCardsResponse>(
        `${API_BASE_URL}/cards/recent-views/?${searchParams.toString()}`
      );

      if (data && typeof data === "object" && "results" in data) {
        return Array.isArray(data.results) ? data.results : [];
      }

      return [];
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: { detail?: string; message?: string };
          status?: number;
        };
        message?: string;
      };

      let errorMessage = "Не удалось загрузить недавно просмотренные";

      if (axiosError.response?.data?.detail) {
        errorMessage = axiosError.response.data.detail;
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleFavorite = createAsyncThunk<
  { id: number; is_favorite: boolean },
  { id: number; is_favorite: boolean }
>("cards/toggleFavorite", async ({ id, is_favorite }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return rejectWithValue("Необходима авторизация");
    }

    if (is_favorite) {
      await axiosInstance.delete(`${API_BASE_URL}/cards/${id}/favorite/`);
      return { id, is_favorite: false };
    } else {
      await axiosInstance.post(`${API_BASE_URL}/cards/${id}/favorite/`, {});
      return { id, is_favorite: true };
    }
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return rejectWithValue(axiosError.message || "Ошибка изменения избранного");
  }
});

interface SimilarCardsResponse {
  results?: ICard[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export const fetchSimilarCards = createAsyncThunk<ICard[], number>(
  "cards/fetchSimilarCards",
  async (cardId, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<SimilarCardsResponse | ICard[]>(
        `${API_BASE_URL}/cards/${cardId}/curations/`
      );

      if (Array.isArray(data)) {
        return data;
      }

      if (data && typeof data === "object" && "results" in data) {
        return Array.isArray(data.results) ? data.results : [];
      }

      return [];
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      return rejectWithValue(
        axiosError.message || "Ошибка загрузки похожих"
      );
    }
  }
);

export const fetchPersonalRecommendations = createAsyncThunk<ICard[], void>(
  "cards/fetchPersonalRecommendations",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get<SimilarCardsResponse | ICard[]>(
        `${API_BASE_URL}/cards/recommendations/for-me/`
      );

      if (Array.isArray(data)) {
        return data;
      }

      if (data && typeof data === "object" && "results" in data) {
        return Array.isArray(data.results) ? data.results : [];
      }

      return [];
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      return rejectWithValue(axiosError.message || "Ошибка");
    }
  }
);

interface SearchHistoryResponse {
  results?: ISearchHistoryItem[];
}

export const fetchSearchHistory = createAsyncThunk<ISearchHistoryItem[]>(
  "cards/fetchSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return [];
      const { data } = await axiosInstance.get<SearchHistoryResponse | ISearchHistoryItem[]>(
        `${API_BASE_URL}/cards/search-history/`
      );
      if (Array.isArray(data)) return data;
      return (data as SearchHistoryResponse).results ?? [];
    } catch (error: unknown) {
      const axiosError = error as { message?: string };
      return rejectWithValue(axiosError.message || "Ошибка загрузки истории");
    }
  }
);

export const clearSearchHistory = createAsyncThunk<void>(
  "cards/clearSearchHistory",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/cards/search-history/`);
    } catch (error: unknown) {
      const axiosError = error as { message?: string };
      return rejectWithValue(axiosError.message || "Ошибка очистки истории");
    }
  }
);

export const likeReview = createAsyncThunk<
  { reviewId: number; helpful_count: number },
  number
>("cards/likeReview", async (reviewId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return rejectWithValue("Необходима авторизация");
    }

    const { data } = await axiosInstance.put<{ helpful_count: number }>(
      `${API_BASE_URL}/cards/reviews/${reviewId}/like/`
    );
    
    return { reviewId, helpful_count: data.helpful_count || 0 };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return rejectWithValue(axiosError.message || "Ошибка при лайке отзыва");
  }
});

const initialState: ICardsSliceState = {
  cards: [],
  currentCard: null,
  searchResults: [],
  recentViews: [],
  searchHistory: [],
  searchHistoryLoading: false,
  similarCards: [],
  similarCardsLoading: false,
  personalRecommendations: [],
  personalRecommendationsLoading: false,
  loading: true,
  searchLoading: false,
  recentViewsLoading: false,
  error: null,
  isFavoritesPage: false,
  hasMore: true,
  page: 1,
  totalCount: 0,
  globalTotalCount: 0,
  favoritesCount: 0,
};

const cards = createSlice({
  name: "cards",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
    },
    resetPagination(state) {
      state.cards = [];
      state.page = 1;
      state.hasMore = true;
      state.totalCount = 0;
      state.error = null;
      state.isFavoritesPage = false;
    },
    updateCardFavorite(
      state,
      action: { payload: { id: number; is_favorite: boolean } }
    ) {
      const cardInList = state.cards.find(
        (card) => card.id === action.payload.id
      );
      if (cardInList) {
        cardInList.is_favorite = action.payload.is_favorite;
      }
      if (state.currentCard && state.currentCard.id === action.payload.id) {
        state.currentCard.is_favorite = action.payload.is_favorite;
      }
      const cardInSearch = state.searchResults.find(
        (card) => card.id === action.payload.id
      );
      if (cardInSearch) {
        cardInSearch.is_favorite = action.payload.is_favorite;
      }
      const cardInSimilar = state.similarCards.find(
        (card) => card.id === action.payload.id
      );
      if (cardInSimilar) {
        cardInSimilar.is_favorite = action.payload.is_favorite;
      }
      const cardInPersonal = state.personalRecommendations.find(
        (card) => card.id === action.payload.id
      );
      if (cardInPersonal) {
        cardInPersonal.is_favorite = action.payload.is_favorite;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.loading = false;
        const {
          results = [],
          count = 0,
          next = null,
          append = false,
        } = action.payload;

        if (append) {
          state.cards = [...state.cards, ...results];
        } else {
          state.cards = results;
        }

        state.totalCount = count;
        state.hasMore = next !== null;
        state.page = append ? state.page + 1 : 1;
        state.error = null;
        state.isFavoritesPage = false;
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Ошибка загрузки карточек";
      })
      .addCase(fetchGlobalTotalCount.fulfilled, (state, action) => {
        state.globalTotalCount = action.payload;
      })
      .addCase(fetchFavoritesCount.fulfilled, (state, action) => {
        state.favoritesCount = action.payload;
      })
      // Reset the favorites badge on logout — otherwise it keeps
      // showing the previous user's count until a full reload.
      .addCase(logout, (state) => {
        state.favoritesCount = 0;
      })
      .addCase(fetchCardById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCard = action.payload;
        state.error = null;
      })
      .addCase(fetchCardById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Ошибка загрузки карточки";
      })
      .addCase(searchCards.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchCards.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(searchCards.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchResults = [];
        state.error = (action.payload as string) || "Ошибка поиска";
      })
      .addCase(fetchFavoriteCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
        state.error = null;
        state.isFavoritesPage = true;
      })
      .addCase(fetchFavoriteCards.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ||
          "Не удалось загрузить избранные карточки";
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { id, is_favorite } = action.payload;

        // Keep the BottomBar badge in sync immediately on like/unlike,
        // without waiting for a page reload / refetch.
        if (is_favorite) {
          state.favoritesCount += 1;
        } else {
          state.favoritesCount = Math.max(0, state.favoritesCount - 1);
        }

        if (!is_favorite && state.isFavoritesPage) {
          state.cards = state.cards.filter((card) => card.id !== id);
        } else {
          const cardInList = state.cards.find((card) => card.id === id);
          if (cardInList) {
            cardInList.is_favorite = is_favorite;
          }
        }

        if (state.currentCard && state.currentCard.id === id) {
          state.currentCard.is_favorite = is_favorite;
        }

        const cardInSearch = state.searchResults.find((card) => card.id === id);
        if (cardInSearch) {
          cardInSearch.is_favorite = is_favorite;
        }

        const cardInRecentViews = state.recentViews.find((card) => card.id === id);
        if (cardInRecentViews) {
          cardInRecentViews.is_favorite = is_favorite;
        }

        const cardInSimilar = state.similarCards.find((card) => card.id === id);
        if (cardInSimilar) {
          cardInSimilar.is_favorite = is_favorite;
        }

        const cardInPersonal = state.personalRecommendations.find(
          (card) => card.id === id
        );
        if (cardInPersonal) {
          cardInPersonal.is_favorite = is_favorite;
        }
      })
      .addCase(fetchRecentViews.pending, (state) => {
        state.recentViewsLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentViews.fulfilled, (state, action) => {
        state.recentViewsLoading = false;
        state.recentViews = action.payload;
        state.error = null;
      })
      .addCase(fetchRecentViews.rejected, (state, action) => {
        state.recentViewsLoading = false;
        state.error = (action.payload as string) || "Не удалось загрузить недавно просмотренные";
      })
      .addCase(fetchSimilarCards.pending, (state) => {
        state.similarCardsLoading = true;
      })
      .addCase(fetchSimilarCards.fulfilled, (state, action) => {
        state.similarCards = action.payload;
        state.similarCardsLoading = false;
      })
      .addCase(fetchSimilarCards.rejected, (state) => {
        state.similarCardsLoading = false;
        state.similarCards = [];
      })
      .addCase(fetchPersonalRecommendations.pending, (state) => {
        state.personalRecommendationsLoading = true;
      })
      .addCase(fetchPersonalRecommendations.fulfilled, (state, action) => {
        state.personalRecommendations = action.payload;
        state.personalRecommendationsLoading = false;
      })
      .addCase(fetchPersonalRecommendations.rejected, (state) => {
        state.personalRecommendationsLoading = false;
        state.personalRecommendations = [];
      })
      .addCase(likeReview.pending, () => {
        // Можно добавить состояние загрузки для конкретного отзыва
      })
      .addCase(likeReview.fulfilled, (state, action) => {
        const { reviewId, helpful_count } = action.payload;
        if (state.currentCard && state.currentCard.reviews) {
          const review = state.currentCard.reviews.find((r) => r.id === reviewId);
          if (review) {
            review.helpful_count = helpful_count;
            review.user_vote = 'helpful';
          }
        }
      })
      .addCase(likeReview.rejected, () => {
        // Ошибка уже обработана в компоненте
      })
      .addCase(fetchSearchHistory.pending, (state) => {
        state.searchHistoryLoading = true;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.searchHistoryLoading = false;
        state.searchHistory = action.payload;
      })
      .addCase(fetchSearchHistory.rejected, (state) => {
        state.searchHistoryLoading = false;
        state.searchHistory = [];
      })
      .addCase(clearSearchHistory.fulfilled, (state) => {
        state.searchHistory = [];
      });
  },
});

export const {
  clearError,
  clearSearchResults,
  resetPagination,
  updateCardFavorite,
} = cards.actions;
export default cards.reducer;
