export const CERTIFICATION_TYPE_CODES = Object.freeze({
  CERTIFICACION_QUEJA: "certificacion_queja",
  CERTIFICACION_TC: "certificacion_tc",
  RESUMEN: "resumen",
});

export const CERTIFICATION_UPLOAD_FIELDS = Object.freeze({
  PRIMERA_INSTANCIA: "primera_instancia",
  SEGUNDA_INSTANCIA: "segunda_instancia",
});

export const CERTIFICATION_CASE_STATUSES = Object.freeze({
  CREATED: "created",
  UPLOADED: "uploaded",
  EXTRACTED: "extracted",
  VALIDATED: "validated",
  GENERATED: "generated",
  FAILED: "failed",
});

/**
 * @typedef {Object.<string, string>} CertificationValidationErrors
 */

/**
 * @typedef {Object.<string, string>} CertificationMissingFields
 */

/**
 * @typedef {Object.<string, string>} CertificationFieldLabels
 */

/**
 * @typedef {Object} CertificationType
 * @property {number|null} id
 * @property {string} code
 * @property {string} name
 * @property {string} description
 * @property {string[]} required_documents
 * @property {string[]} required_fields
 * @property {CertificationFieldLabels} field_labels
 */

/**
 * @typedef {Object} CertificationCaseTypeRef
 * @property {number|null} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} CertificationCaseFile
 * @property {number|null} id
 * @property {string} document_type
 * @property {string} original_name
 * @property {string} extraction_status
 * @property {string|null} extraction_method
 * @property {Record<string, unknown>|null} [metadata]
 */

/**
 * @typedef {Object} CertificationCase
 * @property {number|null} id
 * @property {string} status
 * @property {number|null} progress
 * @property {string|null} title
 * @property {CertificationCaseTypeRef} type
 * @property {CertificationCaseFile[]} files
 * @property {Object.<string, string|null>} resolved_fields
 * @property {CertificationMissingFields} missing_fields
 * @property {CertificationFieldLabels} field_labels
 * @property {string[]} required_fields
 * @property {string} document_preview
 * @property {string[]} warnings
 * @property {CertificationValidationErrors} validation_errors
 * @property {string|null} processed_at
 * @property {string|null} validated_at
 * @property {string|null} generated_at
 * @property {boolean} has_document
 */

/**
 * @typedef {Object} CertificationEvidenceItem
 * @property {string} document_type
 * @property {string} method
 * @property {string} snippet
 * @property {number|null} confidence
 */

/**
 * @typedef {Object} CertificationExtraction
 * @property {number|null} case_id
 * @property {string} status
 * @property {Object.<string, string|null>} detected_fields
 * @property {Object.<string, string|null>} manual_overrides
 * @property {Object.<string, string|null>} resolved_fields
 * @property {CertificationMissingFields} missing_fields
 * @property {CertificationFieldLabels} field_labels
 * @property {Object.<string, CertificationEvidenceItem>} evidence
 * @property {string} document_preview
 * @property {string[]} warnings
 * @property {CertificationValidationErrors} validation_errors
 * @property {CertificationCaseFile[]} files
 */

export const isCertificationTypeCode = (value) =>
  Object.values(CERTIFICATION_TYPE_CODES).includes(value);

export const isCertificationUploadField = (value) =>
  Object.values(CERTIFICATION_UPLOAD_FIELDS).includes(value);

