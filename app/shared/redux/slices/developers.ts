import axios from "@/app/shared/config/axios";
import { API_BASE_URL } from "@/app/shared/config/axios";
import { IDevelopersSliceState } from "@/app/types/redux";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IDeveloperDetail } from "@/app/types/models";

const EXCLUDED_DEVELOPERS = ["каммаев"];

function isExcluded(name: string): boolean {
  const lower = name.toLowerCase();
  return EXCLUDED_DEVELOPERS.some((ex) => lower.includes(ex));
}

export const fetchDevelopers = createAsyncThunk<IDeveloperDetail[]>(
  "developers/fetchDevelopers",
  async (_, { rejectWithValue }) => {
    try {
      const all: IDeveloperDetail[] = [];
      let url: string | null = `${API_BASE_URL}/developers/`;

      while (url) {
        const { data } = await axios.get<
          IDeveloperDetail[] | { results?: IDeveloperDetail[]; next?: string | null }
        >(url);

        if (Array.isArray(data)) {
          all.push(...data);
          url = null;
        } else {
          all.push(...(data.results ?? []));
          url = data.next ?? null;
        }
      }

      return all.filter((d) => {
        if (isExcluded(d.name)) return false;
        // Hide ЖК if it has cards and every one of them is hidden
        if (d.cards.length > 0 && d.cards.every((c) => c.is_hidden === true)) return false;
        return true;
      });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      return rejectWithValue(
        axiosError.message || "Не удалось загрузить застройщиков"
      );
    }
  }
);

export const fetchDeveloperById = createAsyncThunk<IDeveloperDetail, number>(
  "developers/fetchDeveloperById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<IDeveloperDetail>(
        `${API_BASE_URL}/developers/${id}/`
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      return rejectWithValue(
        axiosError.message || "Не удалось загрузить застройщика"
      );
    }
  }
);

export const fetchDeveloperCards = createAsyncThunk<IDeveloperDetail, number>(
  "developers/fetchDeveloperCards",
  async (developerId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get<IDeveloperDetail>(
        `${API_BASE_URL}/developers/${developerId}/cards/`
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      return rejectWithValue(
        axiosError.message || "Не удалось загрузить карточки застройщика"
      );
    }
  }
);

export const subscribeToDeveloper = createAsyncThunk<
  { developerId: number },
  number
>("developers/subscribe", async (developerId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return rejectWithValue("Необходима авторизация");
    }

    await axios.post(
      `${API_BASE_URL}/developers/${developerId}/subscribe/`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { developerId };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return rejectWithValue(
      axiosError.message || "Ошибка при подписке на застройщика"
    );
  }
});

export const unsubscribeFromDeveloper = createAsyncThunk<
  { developerId: number },
  number
>("developers/unsubscribe", async (developerId, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return rejectWithValue("Необходима авторизация");
    }

    await axios.delete(
      `${API_BASE_URL}/developers/${developerId}/subscribe/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { developerId };
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: unknown };
      message?: string;
    };
    return rejectWithValue(
      axiosError.message || "Ошибка при отписке от застройщика"
    );
  }
});

export const fetchMySubscriptions = createAsyncThunk<IDeveloperDetail[]>(
  "developers/fetchMySubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("Необходима авторизация");
      }

      const { data } = await axios.get<IDeveloperDetail[]>(
        `${API_BASE_URL}/developers/me/subscriptions/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown };
        message?: string;
      };
      return rejectWithValue(
        axiosError.message || "Не удалось загрузить подписки"
      );
    }
  }
);

const initialState: IDevelopersSliceState = {
  developers: [],
  currentDeveloper: null,
  subscriptions: [],
  loading: true,
  error: null,
};

const developers = createSlice({
  name: "developers",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentDeveloper(state) {
      state.currentDeveloper = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDevelopers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevelopers.fulfilled, (state, action) => {
        state.loading = false;
        state.developers = action.payload;
        state.error = null;
      })
      .addCase(fetchDevelopers.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Ошибка загрузки застройщиков";
      })

      .addCase(fetchDeveloperById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeveloper = action.payload;
        state.error = null;
      })
      .addCase(fetchDeveloperById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Ошибка загрузки застройщика";
      })

      .addCase(fetchDeveloperCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeveloperCards.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDeveloper = action.payload;
        state.error = null;
      })
      .addCase(fetchDeveloperCards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Ошибка загрузки карточек";
      })

      .addCase(subscribeToDeveloper.fulfilled, (state, action) => {
        const { developerId } = action.payload;

        const developer = state.developers.find((d) => d.id === developerId);
        if (developer) {
          developer.is_subscribed = true;
        }

        if (
          state.currentDeveloper &&
          state.currentDeveloper.id === developerId
        ) {
          state.currentDeveloper.is_subscribed = true;
        }
      })

      .addCase(unsubscribeFromDeveloper.fulfilled, (state, action) => {
        const { developerId } = action.payload;

        const developer = state.developers.find((d) => d.id === developerId);
        if (developer) {
          developer.is_subscribed = false;
        }

        if (
          state.currentDeveloper &&
          state.currentDeveloper.id === developerId
        ) {
          state.currentDeveloper.is_subscribed = false;
        }

        state.subscriptions = state.subscriptions.filter(
          (d) => d.id !== developerId
        );
      })

      .addCase(fetchMySubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchMySubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Ошибка загрузки подписок";
      });
  },
});

export const { clearError, clearCurrentDeveloper } = developers.actions;
export default developers.reducer;
