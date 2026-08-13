import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

import CertificacionesPage from "../CertificacionesPage";

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
      <CertificacionesPage />
    </MemoryRouter>
  );

describe("CertificacionesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el wizard sin seleccionar casos previos ni mostrar subtítulo redundante", async () => {
    serviceMocks.getCertificationTypes.mockResolvedValue([buildType()]);
    serviceMocks.getCertificationCases.mockResolvedValue([buildCase()]);

    renderPage();

    expect(screen.getByText(/Cargando módulo de certificaciones/i)).toBeInTheDocument();

    expect(await screen.findByText(/Certificaciones y resúmenes/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5, name: /Nuevo caso/i })).toBeInTheDocument();
    expect(screen.queryByText(/Cree casos, revise extracción/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Casos recientes/i })).toBeInTheDocument();
    expect(screen.queryByText(/Línea 1/i)).not.toBeInTheDocument();
    expect(serviceMocks.getCertificationCase).not.toHaveBeenCalled();
    expect(serviceMocks.getCertificationExtraction).not.toHaveBeenCalled();
  });

  it("crea un caso y avanza automáticamente al paso de revisión", async () => {
    const caseOne = buildCase();
    const caseTwo = buildCase({
      id: 2,
      title: "Caso nuevo",
      progress: 0,
      status: "created",
      warnings: [],
      validation_errors: {},
      missing_fields: {},
      document_preview: "Preview nuevo",
    });
    const extractionTwo = buildExtraction({
      case_id: 2,
      status: "created",
      warnings: [],
      validation_errors: {},
      missing_fields: {},
      document_preview: "Preview nuevo",
    });

    serviceMocks.getCertificationTypes.mockResolvedValue([buildType()]);
    serviceMocks.getCertificationCases
      .mockResolvedValueOnce([caseOne])
      .mockResolvedValueOnce([caseTwo, caseOne]);
    serviceMocks.getCertificationCase.mockResolvedValue(caseTwo);
    serviceMocks.getCertificationExtraction.mockResolvedValue(extractionTwo);
    serviceMocks.uploadCertificationCaseFile
      .mockResolvedValueOnce({
        upload_id: "upl_primera",
        document_type: "primera_instancia",
        original_name: "primera.pdf",
        size_bytes: 5,
        mime_type: "application/pdf",
      })
      .mockResolvedValueOnce({
        upload_id: "upl_segunda",
        document_type: "segunda_instancia",
        original_name: "segunda.pdf",
        size_bytes: 5,
        mime_type: "application/pdf",
      });
    serviceMocks.createCertificationCase.mockResolvedValue(caseTwo);

    const { container } = renderPage();

    expect(await screen.findByText(/Certificaciones y resúmenes/i)).toBeInTheDocument();

    const createButton = screen.getByRole("button", { name: /Crear caso/i });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Tipo de documento/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/Título opcional/i), {
      target: { value: "Caso nuevo" },
    });

    const fileOne = new File(["pdf-a"], "primera.pdf", { type: "application/pdf" });
    const fileTwo = new File(["pdf-b"], "segunda.pdf", { type: "application/pdf" });

    fireEvent.change(container.querySelector('input[aria-label="eBook primera instancia PDF"]'), {
      target: { files: [fileOne] },
    });
    fireEvent.change(container.querySelector('input[aria-label="eBook segunda instancia PDF"]'), {
      target: { files: [fileTwo] },
    });

    await waitFor(() => {
      expect(serviceMocks.uploadCertificationCaseFile).toHaveBeenNthCalledWith(1, "primera_instancia", fileOne);
      expect(serviceMocks.uploadCertificationCaseFile).toHaveBeenNthCalledWith(2, "segunda_instancia", fileTwo);
    });

    expect(screen.getByRole("button", { name: /Crear caso/i })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Crear caso/i }));

    await waitFor(() => {
      expect(serviceMocks.createCertificationCase).toHaveBeenCalledWith({
        certification_type_id: 1,
        title: "Caso nuevo",
        primera_instancia_upload_id: "upl_primera",
        segunda_instancia_upload_id: "upl_segunda",
      });
    });

    expect(await screen.findByText(/Caso creado correctamente/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 5, name: /Revisión y corrección/i })).toBeInTheDocument();
    expect(screen.getByText(/Preview nuevo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Validar$/i })).toBeDisabled();
    expect(
      screen.getByText(/el caso todavía se está procesando\. la validación se habilitará cuando termine la extracción inicial/i)
    ).toBeInTheDocument();
  });

  it("bloquea archivos sobre 100 MB antes de intentar subirlos", async () => {
    serviceMocks.getCertificationTypes.mockResolvedValue([buildType()]);
    serviceMocks.getCertificationCases.mockResolvedValue([buildCase()]);

    const { container } = renderPage();

    expect(await screen.findByText(/Certificaciones y resúmenes/i)).toBeInTheDocument();

    const oversizedPdf = new File(["pdf"], "gigante.pdf", { type: "application/pdf" });
    Object.defineProperty(oversizedPdf, "size", { value: 101 * 1024 * 1024 });

    fireEvent.change(container.querySelector('input[aria-label="eBook primera instancia PDF"]'), {
      target: { files: [oversizedPdf] },
    });

    expect(await screen.findByText(/excede el máximo permitido de 100 MB/i)).toBeInTheDocument();
    expect(serviceMocks.uploadCertificationCaseFile).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Crear caso/i })).toBeDisabled();
  });
});
