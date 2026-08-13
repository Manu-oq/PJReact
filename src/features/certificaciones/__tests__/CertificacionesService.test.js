import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockApiClient, mockAddVersionToUrl } = vi.hoisted(() => ({
  mockApiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
  mockAddVersionToUrl: vi.fn((url) => `versioned:${url}`),
}));

vi.mock("../../../lib/apiClient", () => ({
  apiClient: mockApiClient,
}));

vi.mock("../../../Services/AddVersionToURL", () => ({
  addVersionToUrl: (...args) => mockAddVersionToUrl(...args),
}));

import {
  buildCertificationUploadFormData,
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

describe("CertificacionesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normaliza tipos y usa el endpoint esperado", async () => {
    mockApiClient.get.mockResolvedValue({
      data: [
        {
          id: "1",
          code: "certificacion_queja",
          name: "Certificación Queja",
          description: "Descripción",
          required_documents: ["primera_instancia"],
          required_fields: ["rit"],
          field_labels: { rit: "RIT" },
        },
      ],
    });

    const result = await getCertificationTypes();

    expect(mockAddVersionToUrl).toHaveBeenCalledWith("/certificaciones/tipos");
    expect(mockApiClient.get).toHaveBeenCalledWith("versioned:/certificaciones/tipos");
    expect(result).toEqual([
      {
        id: 1,
        code: "certificacion_queja",
        name: "Certificación Queja",
        description: "Descripción",
        required_documents: ["primera_instancia"],
        required_fields: ["rit"],
        field_labels: { rit: "RIT" },
      },
    ]);
  });

  it("preserva paginación en listados de casos y limpia params vacíos", async () => {
    mockApiClient.get.mockResolvedValue({
      data: {
        data: [{ id: "3", status: "created", type: { id: "5", code: "resumen", name: "Resumen" } }],
        links: { first: "/page/1" },
        meta: { current_page: 2 },
      },
    });

    const result = await getCertificationCases({ page: 2, status: "created", search: "", type: null });

    expect(mockApiClient.get).toHaveBeenCalledWith("versioned:/certificaciones/casos", {
      params: { page: 2, status: "created" },
    });
    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: 3,
          status: "created",
        }),
      ],
      links: { first: "/page/1" },
      meta: { current_page: 2 },
    });
  });

  it("sube archivos individuales en multipart y normaliza la referencia de upload", async () => {
    const primeraInstancia = new File(["pdf-a"], "primera.pdf", { type: "application/pdf" });
    mockApiClient.post.mockResolvedValue({
      data: {
        upload_id: "upl_123",
        document_type: "primera_instancia",
        original_name: "primera.pdf",
        size_bytes: 1200,
        mime_type: "application/pdf",
      },
    });

    const result = await uploadCertificationCaseFile("primera_instancia", primeraInstancia);

    const [url, formData, config] = mockApiClient.post.mock.calls[0];

    expect(url).toBe("versioned:/certificaciones/uploads");
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("document_type")).toBe("primera_instancia");
    expect(formData.get("file")).toBe(primeraInstancia);
    expect(config).toEqual({
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    expect(result).toEqual({
      upload_id: "upl_123",
      document_type: "primera_instancia",
      original_name: "primera.pdf",
      size_bytes: 1200,
      mime_type: "application/pdf",
    });
  });

  it("expone helper de FormData reutilizable para uploads", () => {
    const file = new File(["pdf"], "resolucion.pdf", { type: "application/pdf" });
    const formData = buildCertificationUploadFormData("primera_instancia", file);

    expect(formData.get("document_type")).toBe("primera_instancia");
    expect(formData.get("file")).toBe(file);
  });

  it("crea casos con payload liviano basado en upload ids", async () => {
    mockApiClient.post.mockResolvedValue({
      data: {
        id: 15,
        status: "created",
        progress: 0,
        title: "Caso Demo",
        type: { id: 3, code: "resumen", name: "Resumen" },
        files: [],
        resolved_fields: {},
        missing_fields: {},
        field_labels: {},
        required_fields: [],
        document_preview: "",
        warnings: [],
        validation_errors: {},
        processed_at: null,
        validated_at: null,
        generated_at: null,
        has_document: false,
      },
    });

    await createCertificationCase({
      certification_type_id: 3,
      title: "Caso Demo",
      primera_instancia_upload_id: "upl_123",
      segunda_instancia_upload_id: "upl_456",
      ignored_null: null,
    });

    expect(mockApiClient.post).toHaveBeenCalledWith("versioned:/certificaciones/casos", {
      certification_type_id: 3,
      title: "Caso Demo",
      primera_instancia_upload_id: "upl_123",
      segunda_instancia_upload_id: "upl_456",
    });
  });

  it("usa los endpoints esperados para detalle, extracción, validación y generación", async () => {
    mockApiClient.get
      .mockResolvedValueOnce({ data: { id: "9", status: "validated", type: { id: "2", code: "resumen", name: "Resumen" } } })
      .mockResolvedValueOnce({ data: { case_id: "9", status: "extracted" } });
    mockApiClient.put.mockResolvedValue({
      data: {
        id: "9",
        status: "validated",
        type: { id: "2", code: "resumen", name: "Resumen" },
        manual_overrides: { rit: "123" },
      },
    });
    mockApiClient.post
      .mockResolvedValueOnce({ data: { id: "9", status: "validated", type: { id: "2", code: "resumen", name: "Resumen" } } })
      .mockResolvedValueOnce({ data: { id: "9", status: "generated", type: { id: "2", code: "resumen", name: "Resumen" } } });

    const caseResult = await getCertificationCase(9);
    const extractionResult = await getCertificationExtraction(9);
    const updatedCase = await updateCertificationExtraction(9, { rit: "123" });
    const validatedCase = await validateCertificationCase(9);
    const generatedCase = await generateCertificationDocument(9);

    expect(mockApiClient.get).toHaveBeenNthCalledWith(1, "versioned:/certificaciones/casos/9");
    expect(mockApiClient.get).toHaveBeenNthCalledWith(2, "versioned:/certificaciones/casos/9/extraccion");
    expect(mockApiClient.put).toHaveBeenCalledWith(
      "versioned:/certificaciones/casos/9/extraccion",
      { manual_overrides: { rit: "123" } }
    );
    expect(mockApiClient.post).toHaveBeenNthCalledWith(
      1,
      "versioned:/certificaciones/casos/9/validar"
    );
    expect(mockApiClient.post).toHaveBeenNthCalledWith(
      2,
      "versioned:/certificaciones/casos/9/generar"
    );
    expect(caseResult.status).toBe("validated");
    expect(extractionResult.case_id).toBe(9);
    expect(updatedCase.status).toBe("validated");
    expect(validatedCase.status).toBe("validated");
    expect(generatedCase.status).toBe("generated");
  });

  it("descarga documento como blob", async () => {
    const blob = new Blob(["documento"], {
      type: "application/pdf",
    });

    mockApiClient.get.mockResolvedValue({ data: blob });

    const result = await downloadCertificationDocument(21);

    expect(mockApiClient.get).toHaveBeenCalledWith("versioned:/certificaciones/casos/21/documento", {
      responseType: "blob",
    });
    expect(result).toBe(blob);
  });
});
