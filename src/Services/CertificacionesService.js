import { apiClient } from "../lib/apiClient";
import { addVersionToUrl } from "./AddVersionToURL";
import {
  normalizeCertificationCase,
  normalizeCertificationCaseList,
  normalizeCertificationExtraction,
  normalizeCertificationType,
  normalizeCertificationUpload,
} from "../features/certificaciones/normalizers";

const CERTIFICATIONS_BASE_PATH = "/certificaciones";
const CERTIFICATIONS_UPLOADS_PATH = `${CERTIFICATIONS_BASE_PATH}/uploads`;

const buildRequestParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const appendFormDataValue = (formData, key, value) => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => formData.append(`${key}[]`, item));
    return;
  }

  formData.append(key, value);
};

export const buildCertificationUploadFormData = (documentType, file) => {
  const formData = new FormData();

  appendFormDataValue(formData, "document_type", documentType);
  appendFormDataValue(formData, "file", file);

  return formData;
};

export const getCertificationTypes = async () => {
  const response = await apiClient.get(addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/tipos`));
  return Array.isArray(response.data) ? response.data.map(normalizeCertificationType) : [];
};

export const getCertificationCases = async (params = {}) => {
  const response = await apiClient.get(addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos`), {
    params: buildRequestParams(params),
  });

  return normalizeCertificationCaseList(response.data);
};

export const uploadCertificationCaseFile = async (documentType, file) => {
  const response = await apiClient.post(
    addVersionToUrl(CERTIFICATIONS_UPLOADS_PATH),
    buildCertificationUploadFormData(documentType, file),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return normalizeCertificationUpload(response.data);
};

export const createCertificationCase = async (payload = {}) => {
  const requestPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

  const response = await apiClient.post(addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos`), requestPayload);

  return normalizeCertificationCase(response.data);
};

export const getCertificationCase = async (caseId) => {
  const response = await apiClient.get(addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos/${caseId}`));
  return normalizeCertificationCase(response.data);
};

export const getCertificationExtraction = async (caseId) => {
  const response = await apiClient.get(
    addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos/${caseId}/extraccion`)
  );

  return normalizeCertificationExtraction(response.data);
};

export const updateCertificationExtraction = async (caseId, manualOverrides = {}) => {
  const response = await apiClient.put(
    addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos/${caseId}/extraccion`),
    { manual_overrides: manualOverrides }
  );

  return normalizeCertificationCase(response.data);
};

export const validateCertificationCase = async (caseId) => {
  const response = await apiClient.post(addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos/${caseId}/validar`));
  return normalizeCertificationCase(response.data);
};

export const generateCertificationDocument = async (caseId) => {
  const response = await apiClient.post(addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos/${caseId}/generar`));
  return normalizeCertificationCase(response.data);
};

export const downloadCertificationDocument = async (caseId) => {
  const response = await apiClient.get(
    addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos/${caseId}/documento`),
    {
      responseType: "blob",
    }
  );

  return {
    blob: response.data,
    fileName: response.headers?.["content-disposition"] ?? "",
  };
};
