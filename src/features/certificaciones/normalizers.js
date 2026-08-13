const ensureArray = (value) => (Array.isArray(value) ? value : []);

const ensureObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
};

const ensureNullableString = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? value : String(value);
};

const ensureString = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  return typeof value === "string" ? value : String(value);
};

const ensureNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const ensureBoolean = (value) => Boolean(value);

export const normalizeCertificationType = (payload = {}) => {
  const type = ensureObject(payload);

  return {
    id: ensureNullableNumber(type.id),
    code: ensureString(type.code),
    name: ensureString(type.name),
    description: ensureString(type.description),
    required_documents: ensureArray(type.required_documents)
      .map((item) => ensureString(item))
      .filter(Boolean),
    required_fields: ensureArray(type.required_fields)
      .map((item) => ensureString(item))
      .filter(Boolean),
    field_labels: Object.fromEntries(
      Object.entries(ensureObject(type.field_labels)).map(([key, value]) => [key, ensureString(value)])
    ),
  };
};

export const normalizeCertificationCaseTypeRef = (payload = {}) => {
  const type = ensureObject(payload);

  return {
    id: ensureNullableNumber(type.id),
    code: ensureString(type.code),
    name: ensureString(type.name),
  };
};

export const normalizeCertificationCaseFile = (payload = {}) => {
  const file = ensureObject(payload);
  const metadata = file.metadata;

  return {
    id: ensureNullableNumber(file.id),
    document_type: ensureString(file.document_type),
    original_name: ensureString(file.original_name),
    extraction_status: ensureString(file.extraction_status),
    extraction_method: ensureNullableString(file.extraction_method),
    metadata: metadata === null || metadata === undefined ? null : ensureObject(metadata),
  };
};

export const normalizeCertificationUpload = (payload = {}) => {
  const upload = ensureObject(payload);

  return {
    upload_id: ensureString(upload.upload_id || upload.id),
    document_type: ensureString(upload.document_type),
    original_name: ensureString(upload.original_name),
    size_bytes: ensureNullableNumber(upload.size_bytes),
    mime_type: ensureNullableString(upload.mime_type),
  };
};

const normalizeNullableStringRecord = (payload) =>
  Object.fromEntries(
    Object.entries(ensureObject(payload)).map(([key, value]) => [key, ensureNullableString(value)])
  );

const normalizeStringRecord = (payload) =>
  Object.fromEntries(Object.entries(ensureObject(payload)).map(([key, value]) => [key, ensureString(value)]));

export const normalizeCertificationCase = (payload = {}) => {
  const certificationCase = ensureObject(payload);

  return {
    id: ensureNullableNumber(certificationCase.id),
    status: ensureString(certificationCase.status),
    progress: ensureNullableNumber(certificationCase.progress),
    title: ensureNullableString(certificationCase.title),
    type: normalizeCertificationCaseTypeRef(certificationCase.type),
    files: ensureArray(certificationCase.files).map(normalizeCertificationCaseFile),
    resolved_fields: normalizeNullableStringRecord(certificationCase.resolved_fields),
    missing_fields: normalizeStringRecord(certificationCase.missing_fields),
    field_labels: normalizeStringRecord(certificationCase.field_labels),
    required_fields: ensureArray(certificationCase.required_fields)
      .map((item) => ensureString(item))
      .filter(Boolean),
    document_preview: ensureString(certificationCase.document_preview),
    warnings: ensureArray(certificationCase.warnings)
      .map((item) => ensureString(item))
      .filter(Boolean),
    validation_errors: normalizeStringRecord(certificationCase.validation_errors),
    processed_at: ensureNullableString(certificationCase.processed_at),
    validated_at: ensureNullableString(certificationCase.validated_at),
    generated_at: ensureNullableString(certificationCase.generated_at),
    has_document: ensureBoolean(certificationCase.has_document),
  };
};

export const normalizeCertificationEvidenceItem = (payload = {}) => {
  const evidence = ensureObject(payload);

  return {
    document_type: ensureString(evidence.document_type),
    method: ensureString(evidence.method),
    snippet: ensureString(evidence.snippet),
    confidence: ensureNullableNumber(evidence.confidence),
  };
};

export const normalizeCertificationExtraction = (payload = {}) => {
  const extraction = ensureObject(payload);

  return {
    case_id: ensureNullableNumber(extraction.case_id),
    status: ensureString(extraction.status),
    detected_fields: normalizeNullableStringRecord(extraction.detected_fields),
    manual_overrides: normalizeNullableStringRecord(extraction.manual_overrides),
    resolved_fields: normalizeNullableStringRecord(extraction.resolved_fields),
    missing_fields: normalizeStringRecord(extraction.missing_fields),
    field_labels: normalizeStringRecord(extraction.field_labels),
    evidence: Object.fromEntries(
      Object.entries(ensureObject(extraction.evidence)).map(([key, value]) => [key, normalizeCertificationEvidenceItem(value)])
    ),
    document_preview: ensureString(extraction.document_preview),
    warnings: ensureArray(extraction.warnings)
      .map((item) => ensureString(item))
      .filter(Boolean),
    validation_errors: normalizeStringRecord(extraction.validation_errors),
    files: ensureArray(extraction.files).map(normalizeCertificationCaseFile),
  };
};

export const normalizeCertificationCaseList = (payload = []) => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeCertificationCase);
  }

  const paginatedPayload = ensureObject(payload);

  return {
    ...paginatedPayload,
    data: ensureArray(paginatedPayload.data).map(normalizeCertificationCase),
    links: paginatedPayload.links === undefined ? undefined : paginatedPayload.links,
    meta: paginatedPayload.meta === undefined ? undefined : paginatedPayload.meta,
  };
};
