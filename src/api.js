import axios from "axios";

export const SESSION_EXPIRED_EVENT = "auth:session-expired";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let refreshRequest;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRequest =
      requestUrl.includes("/users/login") ||
      requestUrl.includes("/users/register") ||
      requestUrl.includes("/users/refresh-token");
    const isLogoutRequest = requestUrl.includes("/users/logout");

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retried ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    try {
      if (!refreshRequest) {
        refreshRequest = api
          .post("/users/refresh-token")
          .finally(() => {
            refreshRequest = null;
          });
      }
      await refreshRequest;
    } catch (refreshError) {
      if (!isLogoutRequest) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      return Promise.reject(refreshError);
    }

    try {
      return await api(originalRequest);
    } catch (retryError) {
      if (retryError.response?.status === 401 && !isLogoutRequest) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      return Promise.reject(retryError);
    }
  },
);

export default api;
