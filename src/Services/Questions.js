import { apiClient } from "../lib/apiClient";
import { addVersionToUrl } from "./AddVersionToURL";

export const getQuestions = async () => {
  const response = await apiClient.get(addVersionToUrl("/questions"));
  return Array.isArray(response.data?.data) ? response.data.data : [];
};

export const storeQuestion = async (question) => {
  const response = await apiClient.post(addVersionToUrl("/questions"), question);
  return response.data?.data ?? response.data;
};

export const deleteQuestion = async (id) => {
  const response = await apiClient.delete(addVersionToUrl(`/questions/${id}`));
  return response.data;
};
