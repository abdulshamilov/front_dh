import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = "https://api.dreamhouse05.com/api";

const config = axios.create({
  baseURL: API_BASE_URL,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

config.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

config.interceptors.response.use(
  (response) => {
    // Handle empty responses that might cause JSON parse errors
    if (response.data === "" || response.data === null) {
      response.data = {};
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (originalRequest.url?.includes("/token/refresh/")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return config(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        isRefreshing = false;
        processQueue(error, null);
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Используем прямой axios.post, чтобы избежать перехвата interceptor'ом
        const response = await axios.post<{ access: string }>(
          `${API_BASE_URL}/token/refresh/`,
          { refresh: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { access } = response.data;

        if (access && typeof access === "string") {
          localStorage.setItem("access_token", access);
          config.defaults.headers.common["Authorization"] = `Bearer ${access}`;
          originalRequest.headers.Authorization = `Bearer ${access}`;
          processQueue(null, access);
          isRefreshing = false;
          return config(originalRequest);
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          isRefreshing = false;
          processQueue(error, null);
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        const axiosRefreshError = refreshError as AxiosError<{
          detail?: string;
          message?: string;
        }>;
        
        // Логируем ошибку для отладки
        console.error("Token refresh failed:", axiosRefreshError.response?.data || axiosRefreshError.message);
        
        processQueue(axiosRefreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(axiosRefreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default config;
