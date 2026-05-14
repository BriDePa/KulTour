import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
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

// ─── Response interceptor: handle errors ───────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response: axiosResponse, request, message } = error;

    // Error de red (backend no responde)
    if (request && !axiosResponse) {
      console.error("[NETWORK ERROR] Backend no responde:", {
        url: error.config?.url,
        message: message,
        hint: "Verifica que el backend esté corriendo en el puerto correcto"
      });
      
      // No rechazar, dejar que el componente maneje el error
      // Pero agregar info útil al error
      (error as any).isNetworkError = true;
      (error as any).friendlyMessage = "No se pudo conectar con el servidor. Verifica tu conexión.";
    }

    // Error 401 - No autenticado
    if (axiosResponse?.status === 401) {
      localStorage.removeItem("kultour_token");
      if (!window.location.pathname.includes("/")) {
        window.location.href = "/";
      }
    }

    // Error 404 - Recurso no encontrado
    if (axiosResponse?.status === 404) {
      console.error("[API 404]", error.config?.url);
    }

    // Error 500 - Error del servidor
    if (axiosResponse?.status === 500) {
      console.error("[SERVER ERROR]", axiosResponse.data);
    }

    return Promise.reject(error);
  }
);

export default api;
