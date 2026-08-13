import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createCertificationCase,
  downloadCertificationDocument,
  generateCertificationDocument,
  getCertificationCase,
  getCertificationCases,
  getCertificationExtraction,
  getCertificationTypes,
  uploadCertificationCaseFile,
  updateCertificationExtraction,
  validateCertificationCase,
} from "../../../Services/CertificacionesService";
import { getCertificationApiErrorMessage } from "../errors";

const extractCasesData = (payload) => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      links: null,
      meta: null,
    };
  }

  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    links: payload?.links ?? null,
    meta: payload?.meta ?? null,
  };
};

const mapValidationErrors = (errorBag) => {
  if (!errorBag || typeof errorBag !== "object" || Array.isArray(errorBag)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errorBag).map(([key, value]) => {
      if (Array.isArray(value)) {
        return [key, value.filter(Boolean).join(", ")];
      }

      return [key, value == null ? "" : String(value)];
    })
  );
};

const triggerBlobDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
};

const sanitizeFilenamePart = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "");

  return normalized;
};

const decodeDownloadFilename = (headerValue) => {
  if (!headerValue || typeof headerValue !== "string") {
    return "";
  }

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).trim();
    } catch {
      return utf8Match[1].trim();
    }
  }

  const plainMatch = headerValue.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1]?.trim() ?? "";
};

const buildDocumentName = (certificationCase, headerValue) => {
  const headerFileName = decodeDownloadFilename(headerValue);
  if (headerFileName) {
    return headerFileName;
  }

  const titleFileName = sanitizeFilenamePart(certificationCase?.title ?? "");
  if (titleFileName) {
    return `${titleFileName}.docx`;
  }

  const typeCode = certificationCase?.type?.code ?? "";
  const prefix =
    {
      certificacion_queja: "certificado_queja",
      certificacion_tc: "certificado_tc",
      resumen: "resumen",
    }[typeCode] ?? "certificacion";

  const roleFileName = sanitizeFilenamePart(
    certificationCase?.resolved_fields?.rol_corte ?? certificationCase?.resolved_fields?.rol_origen ?? ""
  );
  if (roleFileName) {
    return `${prefix}_${roleFileName}.docx`;
  }

  if (!certificationCase?.id) {
    return "certificacion.docx";
  }

  return `certificacion-${certificationCase.id}.docx`;
};

const pendingValidationStatuses = new Set(["created", "uploaded"]);

const isCasePendingValidation = (status) => pendingValidationStatuses.has(status);

export const useCertificaciones = ({ autoSelectFirstCase = true } = {}) => {
  const hasLoadedRef = useRef(false);
  const [types, setTypes] = useState([]);
  const [cases, setCases] = useState([]);
  const [casesMeta, setCasesMeta] = useState(null);
  const [casesLinks, setCasesLinks] = useState(null);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedExtraction, setSelectedExtraction] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingCases, setLoadingCases] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [savingOverrides, setSavingOverrides] = useState(false);
  const [validatingCase, setValidatingCase] = useState(false);
  const [generatingDocument, setGeneratingDocument] = useState(false);
  const [downloadingDocument, setDownloadingDocument] = useState(false);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const closeFeedback = useCallback(() => {
    setFeedback({ type: "success", message: "" });
  }, []);

  const loadCaseDetail = useCallback(async (caseId, { silent = false } = {}) => {
    if (!caseId) {
      setSelectedCase(null);
      setSelectedExtraction(null);
      setSelectedCaseId(null);
      return null;
    }

    if (!silent) {
      setLoadingDetail(true);
    }

    try {
      const [caseData, extractionData] = await Promise.all([
        getCertificationCase(caseId),
        getCertificationExtraction(caseId),
      ]);

      setSelectedCaseId(caseId);
      setSelectedCase(caseData);
      setSelectedExtraction(extractionData);
      return { caseData, extractionData };
    } catch (error) {
      setFeedback({
        type: "error",
        message: getCertificationApiErrorMessage(error, "No se pudo cargar el detalle del caso seleccionado."),
      });
      throw error;
    } finally {
      if (!silent) {
        setLoadingDetail(false);
      }
    }
  }, []);

  const loadCases = useCallback(
    async ({ preferredCaseId = null, silent = false } = {}) => {
      if (!silent) {
        setLoadingCases(true);
      }

      try {
        const response = await getCertificationCases();
        const nextCollection = extractCasesData(response);
        const nextCases = nextCollection.data;

        setCases(nextCases);
        setCasesMeta(nextCollection.meta);
        setCasesLinks(nextCollection.links);

        const currentSelectedId = preferredCaseId ?? selectedCaseId;
        const fallbackSelectedId = autoSelectFirstCase ? nextCases[0]?.id ?? null : null;
        const resolvedSelectedId = nextCases.some((item) => item.id === currentSelectedId)
          ? currentSelectedId
          : fallbackSelectedId;

        if (!resolvedSelectedId) {
          setSelectedCaseId(null);
          setSelectedCase(null);
          setSelectedExtraction(null);
          return nextCases;
        }

        if (resolvedSelectedId !== selectedCaseId || !selectedCase) {
          await loadCaseDetail(resolvedSelectedId, { silent });
        }

        return nextCases;
      } catch (error) {
        const message = getCertificationApiErrorMessage(error, "No se pudieron cargar los casos de certificación.");

        if (!silent) {
          setPageError(message);
        } else {
          setFeedback({ type: "error", message });
        }

        throw error;
      } finally {
        if (!silent) {
          setLoadingCases(false);
        }
      }
    },
    [autoSelectFirstCase, loadCaseDetail, selectedCase, selectedCaseId]
  );

  const loadInitialData = useCallback(async () => {
    setLoadingInitial(true);
    setPageError("");

    try {
      const [typesResponse] = await Promise.all([getCertificationTypes(), loadCases({ silent: true })]);
      setTypes(Array.isArray(typesResponse) ? typesResponse : []);
    } catch (error) {
      setPageError(getCertificationApiErrorMessage(error, "No se pudo cargar el módulo de certificaciones."));
    } finally {
      setLoadingInitial(false);
      setLoadingCases(false);
    }
  }, [loadCases]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!selectedCaseId || !selectedCase || !isCasePendingValidation(selectedCase.status)) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await loadCaseDetail(selectedCaseId, { silent: true });
        await loadCases({ preferredCaseId: selectedCaseId, silent: true });
      } catch {
        // Mantiene el último estado visible hasta el siguiente reintento automático.
      }
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCaseDetail, loadCases, selectedCase, selectedCaseId]);

  const handleSelectCase = useCallback(
    async (caseId) => {
      setSelectedCaseId(caseId);
      await loadCaseDetail(caseId);
    },
    [loadCaseDetail]
  );

  const handleCreateCase = useCallback(
    async (payload) => {
      try {
        setCreatingCase(true);
        const createdCase = await createCertificationCase(payload);
        await loadCases({ preferredCaseId: createdCase.id, silent: true });
        setFeedback({ type: "success", message: "Caso creado correctamente." });
        return createdCase;
      } catch (error) {
        setFeedback({
          type: "error",
          message: getCertificationApiErrorMessage(error, "No se pudo crear el caso."),
        });
        throw error;
      } finally {
        setCreatingCase(false);
      }
    },
    [loadCases]
  );

  const handleUploadCaseFile = useCallback(async (documentType, file) => {
    try {
      return await uploadCertificationCaseFile(documentType, file);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getCertificationApiErrorMessage(error, "No se pudo subir el archivo seleccionado."),
      });
      throw error;
    }
  }, []);

  const handleSaveOverrides = useCallback(
    async (manualOverrides) => {
      if (!selectedCaseId) {
        return;
      }

      try {
        setSavingOverrides(true);
        await updateCertificationExtraction(selectedCaseId, manualOverrides);
        await loadCaseDetail(selectedCaseId, { silent: true });
        await loadCases({ preferredCaseId: selectedCaseId, silent: true });
        setFeedback({ type: "success", message: "Correcciones guardadas correctamente." });
      } catch (error) {
        setFeedback({
          type: "error",
          message: getCertificationApiErrorMessage(error, "No se pudieron guardar las correcciones."),
        });
      } finally {
        setSavingOverrides(false);
      }
    },
    [loadCaseDetail, loadCases, selectedCaseId]
  );

  const handleValidateCase = useCallback(async () => {
    if (!selectedCaseId) {
      return;
    }

    try {
      if (isCasePendingValidation(selectedCase?.status)) {
        const detail = await loadCaseDetail(selectedCaseId, { silent: true });
        await loadCases({ preferredCaseId: selectedCaseId, silent: true });

        if (isCasePendingValidation(detail?.caseData?.status)) {
          setFeedback({
            type: "error",
            message: "El caso todavía se está procesando. Espere unos segundos antes de validar.",
          });
          return;
        }
      }

      setValidatingCase(true);
      const validatedCase = await validateCertificationCase(selectedCaseId);
      setSelectedCase(validatedCase);
      await loadCaseDetail(selectedCaseId, { silent: true });
      await loadCases({ preferredCaseId: selectedCaseId, silent: true });
      setFeedback({ type: "success", message: "Caso validado correctamente." });
    } catch (error) {
      const validationErrorSource =
        error?.response?.data?.validation_errors || error?.response?.data?.errors;
      const nextValidationErrors = mapValidationErrors(validationErrorSource);

      if (Object.keys(nextValidationErrors).length > 0) {
        setSelectedCase((previous) => (
          previous
            ? {
                ...previous,
                validation_errors: nextValidationErrors,
              }
            : previous
        ));
      }

      try {
        await loadCaseDetail(selectedCaseId, { silent: true });
      } catch {
        // Mantiene el estado actual si el refresco posterior también falla.
      }

      setFeedback({
        type: "error",
        message: getCertificationApiErrorMessage(error, "No se pudo validar el caso."),
      });
    } finally {
      setValidatingCase(false);
    }
  }, [loadCaseDetail, loadCases, selectedCase?.status, selectedCaseId]);

  const handleGenerateDocument = useCallback(async () => {
    if (!selectedCaseId) {
      return;
    }

    try {
      setGeneratingDocument(true);
      const generatedCase = await generateCertificationDocument(selectedCaseId);
      setSelectedCase(generatedCase);
      await loadCaseDetail(selectedCaseId, { silent: true });
      await loadCases({ preferredCaseId: selectedCaseId, silent: true });
      setFeedback({ type: "success", message: "Documento generado correctamente." });
    } catch (error) {
      const conflictMessage = error?.response?.status === 409 ? error?.response?.data?.message : null;

      setFeedback({
        type: "error",
        message: conflictMessage || getCertificationApiErrorMessage(error, "No se pudo generar el documento."),
      });
    } finally {
      setGeneratingDocument(false);
    }
  }, [loadCaseDetail, loadCases, selectedCaseId]);

  const handleDownloadDocument = useCallback(async () => {
    if (!selectedCaseId) {
      return;
    }

    try {
      setDownloadingDocument(true);
      const { blob, fileName } = await downloadCertificationDocument(selectedCaseId);
      triggerBlobDownload(blob, buildDocumentName(selectedCase, fileName));
      setFeedback({ type: "success", message: "Documento descargado correctamente." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: getCertificationApiErrorMessage(error, "No se pudo descargar el documento generado."),
      });
    } finally {
      setDownloadingDocument(false);
    }
  }, [selectedCase, selectedCaseId]);

  return useMemo(
    () => ({
      types,
      cases,
      casesMeta,
      casesLinks,
      selectedCaseId,
      selectedCase,
      selectedExtraction,
      loadingInitial,
      loadingCases,
      loadingDetail,
      creatingCase,
      savingOverrides,
      validatingCase,
      generatingDocument,
      downloadingDocument,
      casePendingValidation: isCasePendingValidation(selectedCase?.status),
      pageError,
      feedback,
      closeFeedback,
      reloadPage: loadInitialData,
      refreshCases: loadCases,
      selectCase: handleSelectCase,
      createCase: handleCreateCase,
      uploadCaseFile: handleUploadCaseFile,
      saveOverrides: handleSaveOverrides,
      validateCase: handleValidateCase,
      generateDocument: handleGenerateDocument,
      downloadDocument: handleDownloadDocument,
    }),
    [
      cases,
      casesLinks,
      casesMeta,
      closeFeedback,
      creatingCase,
      downloadingDocument,
      feedback,
      generatingDocument,
      handleCreateCase,
      handleDownloadDocument,
      handleGenerateDocument,
      handleUploadCaseFile,
      handleSaveOverrides,
      handleSelectCase,
      handleValidateCase,
      loadCases,
      loadInitialData,
      loadingCases,
      loadingDetail,
      loadingInitial,
      pageError,
      savingOverrides,
      selectedCase,
      selectedCaseId,
      selectedExtraction,
      types,
      validatingCase,
    ]
  );
};
