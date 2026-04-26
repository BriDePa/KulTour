import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor: attach JWT ─────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kultour_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kultour_token");
      localStorage.removeItem("kultour_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
