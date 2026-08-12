import { getApiErrorMessage } from "../../lib/apiClient";

const hasValidationErrorKey = (errorBag, candidates) =>
  candidates.some((candidate) => Object.prototype.hasOwnProperty.call(errorBag, candidate));

export const getCertificationApiErrorMessage = (
  error,
  fallbackMessage = "No se pudo completar la operación de certificaciones."
) => {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;
  const validationErrors = error?.response?.data?.errors;
  const normalizedMessage = typeof backendMessage === "string" ? backendMessage.toLowerCase() : "";

  if (status === 401 || normalizedMessage.includes("unauthenticated")) {
    return "Debe iniciar sesión nuevamente para continuar.";
  }

  if (
    status === 403 ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("forbidden") ||
    normalizedMessage.includes("permission")
  ) {
    return "No tiene permisos para realizar esta acción.";
  }

  if (status === 409 || normalizedMessage.includes("before validating") || normalizedMessage.includes("antes de validar")) {
    return "Debe validar el caso antes de generar el documento.";
  }

  if (status === 422) {
    const errorBag =
      validationErrors && typeof validationErrors === "object" && !Array.isArray(validationErrors)
        ? validationErrors
        : {};

    if (
      hasValidationErrorKey(errorBag, ["primera_instancia", "segunda_instancia", "files"]) ||
      normalizedMessage.includes("pdf") ||
      normalizedMessage.includes("adjunta") ||
      normalizedMessage.includes("archivo")
    ) {
      return "Debe adjuntar al menos un archivo PDF válido.";
    }

    if (Object.keys(errorBag).length > 0 || normalizedMessage.includes("required") || normalizedMessage.includes("obligatorio")) {
      return "Faltan campos obligatorios para continuar.";
    }
  }

  return getApiErrorMessage(error, fallbackMessage);
};
