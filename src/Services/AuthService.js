import { apiClient, getRootApiUrl } from "../lib/apiClient";

export const getCsrfCookie = async () => {
  const rootUrl = getRootApiUrl();
  const response = await apiClient.get(`${rootUrl}/sanctum/csrf-cookie`);
  return response.data;
};

export const loginAPI = async (credentials) => {
  const response = await apiClient.post("/login", credentials);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await apiClient.post("/logout");
  return response.data;
};
