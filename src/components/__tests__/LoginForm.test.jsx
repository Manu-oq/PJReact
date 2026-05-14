import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginForm from "../LoginForm";
import { describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockGetCsrfCookie = vi.fn();
const mockLoginAPI = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../Services/AuthService", () => ({
  getCsrfCookie: (...args) => mockGetCsrfCookie(...args),
  loginAPI: (...args) => mockLoginAPI(...args),
}));

vi.mock("../../components/context/UserContext", () => ({
  useUser: () => ({ login: mockLogin }),
}));

describe("LoginForm", () => {
  it("envía email y password al autenticarse", async () => {
    mockGetCsrfCookie.mockResolvedValue({});
    mockLoginAPI.mockResolvedValue({
      token: "token-demo",
      user: {
        name: "Usuario Demo",
        email: "demo@correo.cl",
        roles: ["juez"],
        permissions: ["votar_libertad_condicional"],
      },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "demo@correo.cl" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockGetCsrfCookie).toHaveBeenCalled();
      expect(mockLoginAPI).toHaveBeenCalledWith({ email: "demo@correo.cl", password: "123456" });
      expect(mockLogin).toHaveBeenCalledWith(
        "token-demo",
        expect.objectContaining({ email: "demo@correo.cl" })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("muestra validación cuando falta el correo", async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/el correo electrónico es requerido/i)).toBeInTheDocument();
  });
});
