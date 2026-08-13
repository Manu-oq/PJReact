import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const serviceMocks = vi.hoisted(() => ({
  getCertificationTypes: vi.fn(),
  getCertificationCases: vi.fn(),
  createCertificationCase: vi.fn(),
  uploadCertificationCaseFile: vi.fn(),
  getCertificationCase: vi.fn(),
  getCertificationExtraction: vi.fn(),
  updateCertificationExtraction: vi.fn(),
  validateCertificationCase: vi.fn(),
  generateCertificationDocument: vi.fn(),
  downloadCertificationDocument: vi.fn(),
}));

vi.mock("../../Services/CertificacionesService", () => serviceMocks);

import CertificacionesCasesPage from "../CertificacionesCasesPage";

const buildType = (overrides = {}) => ({
  id: 1,
  code: "resumen",
  name: "Resumen",
  description: "Resumen de antecedentes",
  required_documents: ["primera_instancia"],
  required_fields: ["rit"],
  field_labels: { rit: "RIT", nombre: "Nombre" },
  ...overrides,
});

const buildCase = (overrides = {}) => ({
  id: 1,
  status: "needs_review",
  progress: 40,
  title: "Caso inicial",
  type: { id: 1, code: "resumen", name: "Resumen" },
  files: [
    {
      id: 100,
      document_type: "primera_instancia",
      original_name: "primera.pdf",
      extraction_status: "processed",
      extraction_method: "ocr",
      metadata: null,
    },
  ],
  resolved_fields: { nombre: "Juan Pérez" },
  missing_fields: { rit: "Falta RIT" },
  field_labels: { rit: "RIT", nombre: "Nombre" },
  required_fields: ["rit"],
  document_preview: "Línea 1\nLínea 2",
  warnings: ["Advertencia de prueba"],
  validation_errors: { fecha: "Fecha inválida" },
  processed_at: "2026-08-12T10:00:00Z",
  validated_at: null,
  generated_at: null,
  has_document: false,
  ...overrides,
});

const buildExtraction = (overrides = {}) => ({
  case_id: 1,
  status: "needs_review",
  detected_fields: {},
  manual_overrides: {},
  resolved_fields: { nombre: "Juan Pérez" },
  missing_fields: { rit: "Falta RIT" },
  field_labels: { rit: "RIT", nombre: "Nombre" },
  evidence: {
    nombre: {
      document_type: "primera_instancia",
      method: "ocr",
      snippet: "Juan Pérez",
      confidence: 0.97,
    },
  },
  document_preview: "Línea 1\nLínea 2",
  warnings: ["Advertencia de prueba"],
  validation_errors: { fecha: "Fecha inválida" },
  files: [
    {
      id: 100,
      document_type: "primera_instancia",
      original_name: "primera.pdf",
      extraction_status: "processed",
      extraction_method: "ocr",
      metadata: null,
    },
  ],
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <CertificacionesCasesPage />
    </MemoryRouter>
  );

describe("CertificacionesCasesPage", () => {
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: vi.fn(() => "blob:certificacion"),
      configurable: true,
      writable: true,
    });

    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });

    document.createElement = vi.fn((tagName, options) => {
      const element = originalCreateElement(tagName, options);

      if (tagName === "a") {
        element.click = vi.fn();
      }

      return element;
    });
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  it("carga los casos recientes y selecciona el primero automáticamente", async () => {
    serviceMocks.getCertificationTypes.mockResolvedValue([buildType()]);
    serviceMocks.getCertificationCases.mockResolvedValue([buildCase()]);
    serviceMocks.getCertificationCase.mockResolvedValue(buildCase());
    serviceMocks.getCertificationExtraction.mockResolvedValue(buildExtraction());

    renderPage();

    expect(await screen.findByRole("heading", { level: 4, name: /Casos recientes/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Caso #1/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Advertencia de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/Falta RIT/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha inválida/i)).toBeInTheDocument();
    expect(screen.getByText(/Línea 1/i)).toBeInTheDocument();

    expect(serviceMocks.getCertificationCase).toHaveBeenCalledWith(1);
    expect(serviceMocks.getCertificationExtraction).toHaveBeenCalledWith(1);
  });

  it("permite validar, generar y descargar el documento del caso seleccionado", async () => {
    const initialCase = buildCase({ validation_errors: {}, warnings: [], missing_fields: {} });
    const validatedCase = {
      ...initialCase,
      status: "validated",
      validated_at: "2026-08-12T10:30:00Z",
    };
    const generatedCase = {
      ...validatedCase,
      status: "generated",
      has_document: true,
      generated_at: "2026-08-12T10:45:00Z",
    };
    const generatedExtraction = buildExtraction({
      status: "generated",
      warnings: [],
      missing_fields: {},
      validation_errors: {},
    });
    const documentBlob = new Blob(["docx"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    serviceMocks.getCertificationTypes.mockResolvedValue([buildType()]);
    serviceMocks.getCertificationCases
      .mockResolvedValueOnce([initialCase])
      .mockResolvedValueOnce([validatedCase])
      .mockResolvedValueOnce([generatedCase]);
    serviceMocks.getCertificationCase
      .mockResolvedValueOnce(initialCase)
      .mockResolvedValueOnce(validatedCase)
      .mockResolvedValueOnce(generatedCase);
    serviceMocks.getCertificationExtraction
      .mockResolvedValueOnce(buildExtraction({ warnings: [], missing_fields: {}, validation_errors: {} }))
      .mockResolvedValueOnce(buildExtraction({ warnings: [], missing_fields: {}, validation_errors: {} }))
      .mockResolvedValueOnce(generatedExtraction);
    serviceMocks.validateCertificationCase.mockResolvedValue(validatedCase);
    serviceMocks.generateCertificationDocument.mockResolvedValue(generatedCase);
    serviceMocks.downloadCertificationDocument.mockResolvedValue(documentBlob);

    renderPage();

    expect((await screen.findAllByText(/Caso #1/i)).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /^Validar$/i }));

    await waitFor(() => {
      expect(serviceMocks.validateCertificationCase).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByText(/Caso validado correctamente/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Generar Word/i }));

    await waitFor(() => {
      expect(serviceMocks.generateCertificationDocument).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByText(/Documento generado correctamente/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Descargar Word/i })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: /Descargar Word/i }));

    await waitFor(() => {
      expect(serviceMocks.downloadCertificationDocument).toHaveBeenCalledWith(1);
      expect(globalThis.URL.createObjectURL).toHaveBeenCalledWith(documentBlob);
    });

    expect(await screen.findByText(/Documento descargado correctamente/i)).toBeInTheDocument();
  });
});
