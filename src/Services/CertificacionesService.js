import { apiClient } from "../lib/apiClient";
import { addVersionToUrl } from "./AddVersionToURL";
import {
  CERTIFICATION_UPLOAD_FIELDS,
  isCertificationUploadField,
} from "../features/certificaciones/contracts";
import {
  normalizeCertificationCase,
  normalizeCertificationCaseList,
  normalizeCertificationExtraction,
  normalizeCertificationType,
} from "../features/certificaciones/normalizers";

const CERTIFICATIONS_BASE_PATH = "/certificaciones";
const isBlobValue = (value) => typeof Blob !== "undefined" && value instanceof Blob;
const isFileValue = (value) => typeof File !== "undefined" && value instanceof File;

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

export const buildCertificationCaseFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === CERTIFICATION_UPLOAD_FIELDS.PRIMERA_INSTANCIA || key === CERTIFICATION_UPLOAD_FIELDS.SEGUNDA_INSTANCIA) {
      appendFormDataValue(formData, key, value);
      return;
    }

    if (isCertificationUploadField(key)) {
      appendFormDataValue(formData, key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => appendFormDataValue(formData, `${key}[]`, item));
      return;
    }

    if (typeof value === "object" && !isBlobValue(value) && !isFileValue(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    appendFormDataValue(formData, key, value);
  });

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

export const createCertificationCase = async (payload = {}) => {
  const response = await apiClient.post(
    addVersionToUrl(`${CERTIFICATIONS_BASE_PATH}/casos`),
    buildCertificationCaseFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

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

  return normalizeCertificationExtraction(response.data);
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

  return response.data;
};
