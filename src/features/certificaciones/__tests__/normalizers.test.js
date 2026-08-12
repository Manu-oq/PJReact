import { describe, expect, it } from "vitest";
import {
  normalizeCertificationCase,
  normalizeCertificationCaseList,
  normalizeCertificationExtraction,
  normalizeCertificationType,
} from "../normalizers";

describe("certificaciones normalizers", () => {
  it("normaliza tipos garantizando arrays y objetos vacíos", () => {
    const result = normalizeCertificationType({
      id: "7",
      code: "resumen",
      name: "Resumen",
      description: null,
      required_documents: null,
      required_fields: ["rol", null],
      field_labels: null,
    });

    expect(result).toEqual({
      id: 7,
      code: "resumen",
      name: "Resumen",
      description: "",
      required_documents: [],
      required_fields: ["rol"],
      field_labels: {},
    });
  });

  it("normaliza casos sin inventar datos útiles y saneando nulos", () => {
    const result = normalizeCertificationCase({
      id: "12",
      status: "validated",
      progress: "80",
      title: undefined,
      type: { id: "2", code: "certificacion_tc", name: "TC" },
      files: [
        {
          id: "4",
          document_type: "primera_instancia",
          original_name: "caso.pdf",
          extraction_status: "done",
          extraction_method: null,
        },
      ],
      resolved_fields: { tribunal: "Temuco", rit: null },
      missing_fields: null,
      field_labels: { tribunal: "Tribunal" },
      required_fields: null,
      document_preview: null,
      warnings: ["Revisar firmas", null],
      validation_errors: null,
      processed_at: "2026-08-12T10:00:00Z",
      validated_at: null,
      generated_at: undefined,
      has_document: 1,
    });

    expect(result).toEqual({
      id: 12,
      status: "validated",
      progress: 80,
      title: null,
      type: { id: 2, code: "certificacion_tc", name: "TC" },
      files: [
        {
          id: 4,
          document_type: "primera_instancia",
          original_name: "caso.pdf",
          extraction_status: "done",
          extraction_method: null,
          metadata: null,
        },
      ],
      resolved_fields: { tribunal: "Temuco", rit: null },
      missing_fields: {},
      field_labels: { tribunal: "Tribunal" },
      required_fields: [],
      document_preview: "",
      warnings: ["Revisar firmas"],
      validation_errors: {},
      processed_at: "2026-08-12T10:00:00Z",
      validated_at: null,
      generated_at: null,
      has_document: true,
    });
  });

  it("normaliza extracción con evidencia y archivos", () => {
    const result = normalizeCertificationExtraction({
      case_id: "22",
      status: "extracted",
      detected_fields: null,
      manual_overrides: { nombre: "Juan" },
      resolved_fields: { nombre: "Juan", rit: null },
      missing_fields: { fecha: "Fecha obligatoria" },
      field_labels: null,
      evidence: {
        nombre: {
          document_type: "primera_instancia",
          method: "ocr",
          snippet: "Juan Pérez",
          confidence: "0.95",
        },
      },
      document_preview: null,
      warnings: null,
      validation_errors: null,
      files: [
        {
          id: "9",
          document_type: "segunda_instancia",
          original_name: "segunda.pdf",
          extraction_status: "pending",
          extraction_method: "manual",
          metadata: null,
        },
      ],
    });

    expect(result).toEqual({
      case_id: 22,
      status: "extracted",
      detected_fields: {},
      manual_overrides: { nombre: "Juan" },
      resolved_fields: { nombre: "Juan", rit: null },
      missing_fields: { fecha: "Fecha obligatoria" },
      field_labels: {},
      evidence: {
        nombre: {
          document_type: "primera_instancia",
          method: "ocr",
          snippet: "Juan Pérez",
          confidence: 0.95,
        },
      },
      document_preview: "",
      warnings: [],
      validation_errors: {},
      files: [
        {
          id: 9,
          document_type: "segunda_instancia",
          original_name: "segunda.pdf",
          extraction_status: "pending",
          extraction_method: "manual",
          metadata: null,
        },
      ],
    });
  });

  it("normaliza listados paginados preservando meta y links", () => {
    const result = normalizeCertificationCaseList({
      data: [{ id: "3", status: "created", type: null }],
      links: { first: "a" },
      meta: { current_page: 1 },
      extra: "preservado",
    });

    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: 3,
          status: "created",
        }),
      ],
      links: { first: "a" },
      meta: { current_page: 1 },
      extra: "preservado",
    });
  });
});
