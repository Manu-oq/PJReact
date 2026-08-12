import { describe, expect, it } from "vitest";
import { getCertificationApiErrorMessage } from "../errors";

describe("certificaciones errors", () => {
  it("traduce sesión expirada", () => {
    const message = getCertificationApiErrorMessage({
      response: { status: 401, data: { message: "Unauthenticated." } },
    });

    expect(message).toBe("Debe iniciar sesión nuevamente para continuar.");
  });

  it("traduce permisos insuficientes", () => {
    const message = getCertificationApiErrorMessage({
      response: { status: 403, data: { message: "This action is unauthorized." } },
    });

    expect(message).toBe("No tiene permisos para realizar esta acción.");
  });

  it("traduce falta de pdf obligatorio", () => {
    const message = getCertificationApiErrorMessage({
      response: {
        status: 422,
        data: { message: "Debe adjuntar al menos un PDF.", errors: { primera_instancia: ["required"] } },
      },
    });

    expect(message).toBe("Debe adjuntar al menos un archivo PDF válido.");
  });

  it("traduce faltantes de campos obligatorios", () => {
    const message = getCertificationApiErrorMessage({
      response: {
        status: 422,
        data: { message: "Validation failed.", errors: { rit: ["required"] } },
      },
    });

    expect(message).toBe("Faltan campos obligatorios para continuar.");
  });

  it("traduce intento de generar antes de validar", () => {
    const message = getCertificationApiErrorMessage({
      response: {
        status: 409,
        data: { message: "Cannot generate document before validating the case." },
      },
    });

    expect(message).toBe("Debe validar el caso antes de generar el documento.");
  });
});
