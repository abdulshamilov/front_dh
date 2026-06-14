import axiosInstance from "@/app/shared/config/axios";
import { API_BASE_URL } from "@/app/shared/config/axios";
import { IAuthSliceState, IUser } from "@/app/types/redux";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isAxiosErrorResponse } from "@/app/shared/types/errors";
import {
  ILoginRequest,
  ILoginResponse,
  IRegisterRequest,
  IRegisterResponse,
  IRequestSmsCodeRequest,
  IRequestSmsCodeResponse,
  IVerifySmsCodeRequest,
  IVerifySmsCodeResponse,
  IRegisterSmsRequest,
  IRegisterSmsResponse,
  IConfirmRegisterRequest,
  IConfirmRegisterResponse,
} from "@/app/types/requests";
const getErrorMessage = (
  reason: string,
  type: "register" | "login" | "sms_request" | "sms_verify" | "register_sms" | "confirm_register"
): string => {
  const errorMessages: Record<string, Record<string, string>> = {
    register: {
      ALREADY_REGISTERED: "Пользователь с таким email уже зарегистрирован",
      INVALID_EMAIL: "Некорректный email адрес",
      WEAK_PASSWORD: "Пароль слишком слабый",
      INVALID_DATA: "Некорректные данные для регистрации",
      SERVER_ERROR: "Ошибка сервера. Попробуйте позже",
      REGISTER_FAILED: "Ошибка регистрации",
    },
    login: {
      INVALID_CREDENTIALS: "Не удалось войти. Телефон или пароль неверны",
      USER_NOT_FOUND: "Пользователь не найден",
      ACCOUNT_BLOCKED: "Аккаунт заблокирован",
      INVALID_EMAIL: "Некорректный email адрес",
      SERVER_ERROR: "Ошибка сервера. Попробуйте позже",
      LOGIN_FAILED: "Ошибка авторизации",
    },
    sms_request: {
      SMS_REQUEST_FAILED: "Не удалось отправить SMS-код",
      INVALID_PHONE: "Некорректный номер телефона",
      TOO_MANY_REQUESTS: "Слишком много запросов. Попробуйте позже",
      SERVER_ERROR: "Ошибка сервера. Попробуйте позже",
    },
    sms_verify: {
      INVALID_OTP: "Неверный код подтверждения",
      OTP_EXPIRED: "Код истёк. Запросите новый",
      USER_NOT_FOUND: "Пользователь не найден",
      SERVER_ERROR: "Ошибка сервера. Попробуйте позже",
    },
    register_sms: {
      REGISTER_FAILED: "Ошибка регистрации",
      ALREADY_REGISTERED: "Пользователь с таким номером уже зарегистрирован",
      INVALID_PHONE: "Некорректный номер телефона",
      INVALID_DATA: "Некорректные данные для регистрации",
      TOO_MANY_REQUESTS: "Слишком много запросов. Попробуйте позже",
      SERVER_ERROR: "Ошибка сервера. Попробуйте позже",
    },
    confirm_register: {
      REGISTER_FAILED: "Ошибка регистрации",
      INVALID_OTP: "Неверный код подтверждения",
      OTP_EXPIRED: "Код истёк. Запросите новый",
      ALREADY_REGISTERED: "Пользователь с таким номером уже зарегистрирован",
      SERVER_ERROR: "Ошибка сервера. Попробуйте позже",
    },
  };
  if (errorMessages[type]?.[reason]) {
    return errorMessages[type][reason];
  }
  return reason || "Произошла ошибка";
};
export const requestSmsCode = createAsyncThunk<IRequestSmsCodeResponse, IRequestSmsCodeRequest>(
  "auth/requestSmsCode",
  async (data, { rejectWithValue }) => {
    try {
      const { data: response } = await axiosInstance.post(
        `${API_BASE_URL}/users/sms/request/`,
        data
      );
      return response;
    } catch (error: unknown) {
      const defaultError: IRequestSmsCodeResponse = {
        ok: false,
        CODE: "SMS_REQUEST_FAILED",
        reason: "SMS_REQUEST_FAILED",
      };

      if (isAxiosErrorResponse(error) && error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "object" && "ok" in errorData) {
          return rejectWithValue(errorData as IRequestSmsCodeResponse);
        }
      }

      return rejectWithValue(defaultError);
    }
  }
);
export const verifySmsCode = createAsyncThunk<IVerifySmsCodeResponse, IVerifySmsCodeRequest>(
  "auth/verifySmsCode",
  async (data, { rejectWithValue }) => {
    try {
      const { data: response } = await axiosInstance.post(
        `${API_BASE_URL}/users/sms/verify/`,
        data
      );
      if (response.access && response.refresh) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
      }
      return response;
    } catch (error: unknown) {
      const defaultError: IVerifySmsCodeResponse = {
        ok: false,
        CODE: "SERVER_ERROR",
        reason: "SERVER_ERROR",
      };

      if (isAxiosErrorResponse(error)) {
        const status = error.response?.status;
        if (status === 400 || status === 401) {
          return rejectWithValue({
            ok: false,
            CODE: "INVALID_OTP",
            reason: "INVALID_OTP",
          });
        }

        const errorData = error.response?.data;
        if (typeof errorData === "object" && errorData !== null && "ok" in errorData) {
          return rejectWithValue(errorData as IVerifySmsCodeResponse);
        }
      }

      return rejectWithValue(defaultError);
    }
  }
);
// SMS Register thunks
export const registerSms = createAsyncThunk<IRegisterSmsResponse, IRegisterSmsRequest>(
  "auth/registerSms",
  async (data, { rejectWithValue }) => {
    try {
      const { data: response } = await axiosInstance.post(
        `${API_BASE_URL}/users/register/`,
        data
      );
      return response;
    } catch (error: unknown) {
      const defaultError: IRegisterSmsResponse = {
        ok: false,
        CODE: "REGISTER_FAILED",
        reason: "REGISTER_FAILED",
      };

      if (isAxiosErrorResponse(error)) {
        const errorData = error.response?.data;

        if (typeof errorData === "object" && errorData !== null) {
          // Обработка ошибки существующего пользователя
          if ("phone_number" in errorData) {
            const phoneError = errorData as { phone_number?: string[] };
            if (
              Array.isArray(phoneError.phone_number) &&
              phoneError.phone_number.length > 0
            ) {
              const errorMessage = phoneError.phone_number[0];
              if (
                errorMessage.includes("already exists") ||
                errorMessage.includes("уже существует")
              ) {
                return rejectWithValue({
                  ok: false,
                  CODE: "ALREADY_REGISTERED",
                  reason: "ALREADY_REGISTERED",
                });
              }
            }
          }

          // Если есть поле ok, значит это стандартный ответ API
          if ("ok" in errorData) {
            return rejectWithValue(errorData as IRegisterSmsResponse);
          }
        }
      }

      return rejectWithValue(defaultError);
    }
  }
);
export const confirmRegister = createAsyncThunk<IConfirmRegisterResponse, IConfirmRegisterRequest>(
  "auth/confirmRegister",
  async (data, { rejectWithValue }) => {
    try {
      const { data: response } = await axiosInstance.post(
        `${API_BASE_URL}/users/register/confirm/`,
        data
      );
      if (response.access && response.refresh) {
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
      }
      return response;
    } catch (error: unknown) {
      const defaultError: IConfirmRegisterResponse = {
        ok: false,
        CODE: "REGISTER_FAILED",
        reason: "REGISTER_FAILED",
      };

      if (isAxiosErrorResponse(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        // Проверка статуса
        if (status === 400 || status === 401) {
          return rejectWithValue({
            ok: false,
            CODE: "INVALID_OTP",
            reason: "INVALID_OTP",
          });
        }

        if (typeof errorData === "object" && errorData !== null) {
          // Обработка ошибки существующего пользователя
          if ("phone_number" in errorData) {
            const phoneError = errorData as { phone_number?: string[] };
            if (
              Array.isArray(phoneError.phone_number) &&
              phoneError.phone_number.length > 0
            ) {
              const errorMessage = phoneError.phone_number[0];
              if (
                errorMessage.includes("already exists") ||
                errorMessage.includes("уже существует")
              ) {
                return rejectWithValue({
                  ok: false,
                  CODE: "ALREADY_REGISTERED",
                  reason: "ALREADY_REGISTERED",
                });
              }
            }
          }

          // Обработка ошибки OTP
          if ("otp" in errorData) {
            const otpError = errorData as { otp?: string[] };
            if (Array.isArray(otpError.otp) && otpError.otp.length > 0) {
              return rejectWithValue({
                ok: false,
                CODE: "INVALID_OTP",
                reason: "INVALID_OTP",
              });
            }
          }

          // Если есть поле ok, значит это стандартный ответ API
          if ("ok" in errorData) {
            return rejectWithValue(errorData as IConfirmRegisterResponse);
          }
        }
      }

      return rejectWithValue(defaultError);
    }
  }
);
export const register = createAsyncThunk<IRegisterResponse, IRegisterRequest>(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${API_BASE_URL}/users/register/`,
        userData
      );
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      }
      return data;
    } catch (error: unknown) {
      const defaultError: IRegisterResponse = {
        ok: false,
        CODE: "REGISTER_FAILED",
        reason: "Ошибка регистрации",
      };

      if (isAxiosErrorResponse(error)) {
        const errorData = error.response?.data;
        if (typeof errorData === "object" && errorData !== null && "ok" in errorData) {
          return rejectWithValue(errorData as IRegisterResponse);
        }
      }

      return rejectWithValue(defaultError);
    }
  }
);
export const login = createAsyncThunk<ILoginResponse, ILoginRequest>(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post(
        `${API_BASE_URL}/token/`,
        userData
      );
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
      }
      return data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: ILoginResponse;
          status?: number;
        }
      };
     
      if (axiosError.response?.status === 400 || axiosError.response?.status === 401) {
        return rejectWithValue({
          ok: false,
          CODE: "INVALID_CREDENTIALS",
          reason: "INVALID_CREDENTIALS",
        });
      }
     
      return rejectWithValue(
        axiosError.response?.data || {
          ok: false,
          CODE: "LOGIN_FAILED",
          reason: "Ошибка авторизации",
        }
      );
    }
  }
);
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return rejectWithValue("No token");
      }
      const { data } = await axiosInstance.get(`${API_BASE_URL}/users/me/`);
      if (data.ok && data.user) {
        return data.user;
      } else if (data.id) {
        return data;
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return rejectWithValue(data.reason || "Failed to fetch user");
    } catch (error: unknown) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      if (isAxiosErrorResponse(error)) {
        const errorData = error.response?.data;
        const errorMessage = error.message;

        if (typeof errorData === "string") {
          return rejectWithValue(errorData);
        }

        if (typeof errorData === "object" && errorData !== null && "reason" in errorData) {
          return rejectWithValue((errorData as { reason: string }).reason);
        }

        return rejectWithValue(errorMessage || "Failed to fetch user");
      }

      return rejectWithValue("Failed to fetch user");
    }
  }
);
export const authMe = createAsyncThunk(
  "auth/authMe",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return rejectWithValue("No token");
      }
      await dispatch(fetchUser());
      return { isAuth: true };
    } catch (error: unknown) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      if (isAxiosErrorResponse(error)) {
        const errorData = error.response?.data;
        if (errorData !== undefined) {
          return rejectWithValue(errorData);
        }
      }

      return rejectWithValue("Authentication failed");
    }
  }
);
const initialState: IAuthSliceState = {
  isAuth: false,
  user: null,
  loading: false,
  error: null,
  initialized: false,
};
const auth = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    logout(state) {
      state.isAuth = false;
      state.user = null;
      state.error = null;
      state.initialized = true;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    clearError(state) {
      state.error = null;
    },
    setInitialized(state) {
      state.initialized = true;
    },
    setUser(state, action: { payload: IUser }) {
      state.user = action.payload;
      state.isAuth = true;
      state.initialized = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerSms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSms.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.ok) {
          state.error = getErrorMessage(action.payload.reason, "register_sms");
        } else {
          state.error = null;
        }
      })
      .addCase(registerSms.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as IRegisterSmsResponse | string;
        if (typeof payload === "string") {
          state.error = getErrorMessage(payload, "register_sms");
        } else if (payload && typeof payload === "object" && "reason" in payload) {
          state.error = getErrorMessage(payload.reason, "register_sms");
        } else {
          state.error = getErrorMessage("REGISTER_FAILED", "register_sms");
        }
      })
      .addCase(confirmRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmRegister.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.access && action.payload.refresh) {
          state.isAuth = true;
          state.initialized = true;
          state.error = null;
        } else {
          state.error = getErrorMessage(action.payload.reason || "CONFIRM_REGISTER_FAILED", "confirm_register");
        }
      })
      .addCase(confirmRegister.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as IConfirmRegisterResponse | string;
        if (typeof payload === "string") {
          state.error = getErrorMessage(payload, "confirm_register");
        } else if (payload && typeof payload === "object" && "reason" in payload) {
          state.error = getErrorMessage(payload.reason, "confirm_register");
        } else {
          state.error = getErrorMessage("CONFIRM_REGISTER_FAILED", "confirm_register");
        }
      })
      // Legacy register/login (для обратной совместимости)
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.ok) {
          if (action.payload.access && action.payload.refresh) {
            state.isAuth = true;
            state.initialized = true;
          }
          state.error = null;
        } else {
          state.error = getErrorMessage(action.payload.reason, "register");
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as IRegisterResponse | string;
        if (typeof payload === "string") {
          state.error = getErrorMessage(payload, "register");
        } else if (
          payload &&
          typeof payload === "object" &&
          "reason" in payload
        ) {
          state.error = getErrorMessage(payload.reason, "register");
        } else {
          state.error = getErrorMessage("REGISTER_FAILED", "register");
        }
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.access && action.payload.refresh) {
          state.isAuth = true;
          state.initialized = true;
          state.error = null;
        } else {
          state.error =
            action.payload.reason || getErrorMessage("LOGIN_FAILED", "login");
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as ILoginResponse | string;
        if (typeof payload === "string") {
          state.error = getErrorMessage(payload, "login");
        } else if (
          payload &&
          typeof payload === "object" &&
          "reason" in payload
        ) {
          state.error = getErrorMessage(payload.reason, "login");
        } else {
          state.error = getErrorMessage("LOGIN_FAILED", "login");
        }
      })
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuth = true;
        state.initialized = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuth = false;
        state.initialized = true;
      })
      .addCase(authMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(authMe.fulfilled, (state) => {
        state.loading = false;
        state.isAuth = true;
      })
      .addCase(authMe.rejected, (state) => {
        state.loading = false;
        state.isAuth = false;
        state.user = null;
      });
  },
});
export const { logout, clearError, setInitialized, setUser } = auth.actions;
export default auth.reducer;