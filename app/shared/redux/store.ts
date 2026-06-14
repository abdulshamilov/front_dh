import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import cardsReducer from "./slices/cards";
import developersReducer from "./slices/developers";
import { apiSlice } from "./api/auth";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cards: cardsReducer,
    developers: developersReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;