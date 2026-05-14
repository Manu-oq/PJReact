import axios from "axios";
import { getStoredSession } from "../utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const { token } = getStoredSession();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const translateApiMessage = (message) => {
  if (!message) return null;

  const normalized = message.toLowerCase();

  if (normalized.includes("this action is unauthorized") || normalized.includes("forbidden") || normalized.includes("permission")) {
    return "No tiene permisos para realizar esta acción.";
  }

  if (normalized.includes("fundamentos") && (normalized.includes("at least") || normalized.includes("required"))) {
    return "Debe seleccionar al menos un fundamento para confirmar el voto.";
  }

  if (normalized.includes("unauthenticated")) {
    return "Debe iniciar sesión nuevamente para continuar.";
  }

  return null;
};

export const getApiErrorMessage = (error, fallbackMessage = "Ocurrió un error inesperado.") => {
  const backendMessage = error?.response?.data?.message;
  const translatedMessage = translateApiMessage(backendMessage);

  if (translatedMessage) {
    return translatedMessage;
  }

  if (backendMessage) {
    return backendMessage;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const getRootApiUrl = () => API_BASE_URL.replace(/\/api\/?$/, "");
