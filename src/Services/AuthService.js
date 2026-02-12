import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getCsrfCookie = async () => {
  try {
    const rootUrl = API_BASE_URL.replace(/\/api\/?$/, ""); 
    const url = `${rootUrl}/sanctum/csrf-cookie`;

    return await authClient.get(url);
  } catch (error) {
    console.error("Error obteniendo CSRF Cookie:", error);
    throw error;
  }
};

export const loginAPI = async (credentials) => {
  try {
    const response = await authClient.post("/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error en loginAPI:", error);
    throw error;
  }
};

export const logoutAPI = async () => {
  return await authClient.post("/logout");
};