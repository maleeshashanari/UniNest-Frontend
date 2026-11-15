import axios from "axios";
import { clearSession } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token expired (48h), log out automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthCall = url.includes("/login") || url.includes("/register");
    if (err.response?.status === 401 && localStorage.getItem("token") && !isAuthCall) {
      clearSession();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;