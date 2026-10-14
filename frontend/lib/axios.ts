import axios from "axios";


export const api = axios.create({
  baseURL: "/api",
});

let refreshRequest: Promise<unknown> | null = null;

async function refreshToken() {
  if (!refreshRequest) {
    refreshRequest = api.post("/auth/refresh");
  }
  try {
    await refreshRequest;
  } finally {
    refreshRequest = null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isLoginOrRefresh = originalRequest.url === "/auth/login" || originalRequest.url === "/auth/refresh";

    if (error.response?.status === 401 && !originalRequest._retry && !isLoginOrRefresh) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return api(originalRequest);
      } catch {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);
