import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import { clearStoredSession, persistSession } from "../utils/authStorage";
import { AUTH_PERMISSIONS } from "../features/auth/constants/authorization";

vi.mock("../features/comision/hooks/useComisionAccess", () => ({
  useComisionAccess: () => ({
    puedeVerModulo: false,
  }),
}));

vi.mock("../pages/Home", () => ({
  default: () => <div>home page</div>,
}));

vi.mock("../pages/LoginPage", () => ({
  default: () => <div>login page</div>,
}));

vi.mock("../pages/FrequentQuestions", () => ({
  FrequentQuestions: () => <div>faq page</div>,
}));

vi.mock("../pages/GeneralInformation", () => ({
  GeneralInformation: () => <div>general page</div>,
}));

vi.mock("../pages/Opening_of_files_and_oath_of_lawyers", () => ({
  default: () => <div>apertura page</div>,
}));

vi.mock("../pages/Comision/ComisionLibertadPage", () => ({
  default: () => <div>comision page</div>,
}));

vi.mock("../pages/Comision/VotacionPage", () => ({
  default: () => <div>votacion page</div>,
}));

vi.mock("../pages/Comision/AdminVotacionPage", () => ({
  default: () => <div>admin votacion page</div>,
}));

vi.mock("../pages/Comision/HistoricoCiclosPage", () => ({
  default: () => <div>historico ciclos page</div>,
}));

vi.mock("../pages/Comision/HistoricoPostulantesPage", () => ({
  default: () => <div>historico postulantes page</div>,
}));

vi.mock("../pages/CertificacionesPage", () => ({
  default: () => <div>certificaciones page</div>,
}));

vi.mock("../components/partials/footer/Footer", () => ({
  Footer: () => <div>footer</div>,
}));

const renderApp = (initialEntries = ["/"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );

const createSession = ({ authenticated = true, permissions = [] } = {}) => ({
  token: authenticated ? "token-demo" : null,
  name: authenticated ? "Usuario Demo" : "",
  email: authenticated ? "demo@correo.cl" : "",
  roles: [],
  permissions,
});

describe("App certificaciones integration", () => {
  beforeEach(() => {
    clearStoredSession();
  });

  afterEach(() => {
    clearStoredSession();
  });

  it("muestra el link de certificaciones solo para usuarios con permiso", async () => {
    persistSession(createSession({ permissions: [AUTH_PERMISSIONS.GESTIONAR_CERTIFICACIONES] }));

    renderApp();

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(screen.getAllByText("Certificaciones").length).toBeGreaterThan(0);
  });

  it("no muestra el link de certificaciones sin sesión o sin permiso", async () => {
    const firstRender = renderApp();

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("Certificaciones")).not.toBeInTheDocument();
    firstRender.unmount();

    clearStoredSession();
    persistSession(createSession({ permissions: [] }));

    renderApp();

    expect(await screen.findAllByText("home page")).not.toHaveLength(0);
    expect(screen.queryByText("Certificaciones")).not.toBeInTheDocument();
  });

  it("permite abrir el módulo desde la navegación y lo muestra en el drawer mobile", async () => {
    persistSession(createSession({ permissions: [AUTH_PERMISSIONS.GESTIONAR_CERTIFICACIONES] }));

    renderApp();

    expect(await screen.findByText("home page")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("link", { name: "Certificaciones" })[0]);

    expect(await screen.findByText("certificaciones page")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Abrir menú/i));

    await waitFor(() => {
      expect(screen.getAllByText("Certificaciones").length).toBeGreaterThan(1);
    });
  });

  it("mantiene la ruta /certificaciones protegida por permiso", async () => {
    persistSession(createSession({ permissions: [] }));

    const firstRender = renderApp(["/certificaciones"]);

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("certificaciones page")).not.toBeInTheDocument();
    firstRender.unmount();

    clearStoredSession();
    persistSession(createSession({ permissions: [AUTH_PERMISSIONS.GESTIONAR_CERTIFICACIONES] }));

    renderApp(["/certificaciones"]);

    expect(await screen.findAllByText("certificaciones page")).not.toHaveLength(0);
  });
});
