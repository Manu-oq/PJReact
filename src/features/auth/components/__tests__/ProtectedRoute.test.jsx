import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute";
import { describe, expect, it, vi } from "vitest";

const mockUseUser = vi.fn();

vi.mock("../../../../components/context/UserContext", () => ({
  useUser: () => mockUseUser(),
}));

describe("ProtectedRoute", () => {
  it("renderiza el contenido cuando el usuario cumple con los roles requeridos", () => {
    mockUseUser.mockReturnValue({
      hasAnyRole: () => true,
      hasAnyPermission: () => true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["juez"]}>
          <div>contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("contenido protegido")).toBeInTheDocument();
  });

  it("redirige cuando el usuario no cumple con los roles requeridos", () => {
    mockUseUser.mockReturnValue({
      hasAnyRole: () => false,
      hasAnyPermission: () => true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["juez"]}>
          <div>contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });
});
