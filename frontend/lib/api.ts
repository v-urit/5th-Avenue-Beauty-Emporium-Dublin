import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { handleMockRequest, isDemoActive } from "./mock-adapter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const defaultAdapter = typeof axios.getAdapter === "function" ? axios.getAdapter(["xhr", "fetch", "http"]) : null;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  adapter: async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    // 1. If demo mode is active, directly satisfy from rich mock store
    if (isDemoActive()) {
      const mockRes = await handleMockRequest(config);
      if (mockRes) return mockRes;
    }

    // 2. Try standard network request against backend if available
    try {
      if (typeof defaultAdapter === "function") {
        return await defaultAdapter(config);
      }
    } catch (networkError) {
      // 3. If remote backend is offline or network fails, gracefully fallback to mock
      const fallbackMock = await handleMockRequest(config);
      if (fallbackMock) {
        console.info(`[Demo Fallback] Served local data for ${config.method?.toUpperCase()} ${config.url}`);
        return fallbackMock;
      }
      throw networkError;
    }

    // 4. Fallback if default adapter couldn't handle
    const fallback = await handleMockRequest(config);
    if (fallback) return fallback;

    throw new Error(`Unhandled request: ${config.url}`);
  },
});

// Request interceptor: attach access token if available
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and auto-refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and avoid infinite loop on /auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", newAccessToken);
          localStorage.setItem("refresh_token", newRefreshToken);
          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
