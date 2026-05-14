import { fireEvent, render, screen } from "@testing-library/react";
import { AccordionQuestions } from "../AccordionQuestions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseUser = vi.fn();
const mockUseQuestions = vi.fn();

vi.mock("../../context/UserContext", () => ({
  useUser: () => mockUseUser(),
}));

vi.mock("../../../features/faq/hooks/useQuestions", () => ({
  useQuestions: () => mockUseQuestions(),
}));

const baseQuestionsState = {
  questions: [{ id: 1, question: "Pregunta 1", answer: "Respuesta 1" }],
  newQuestion: { question: "", answer: "" },
  showInputs: false,
  loading: false,
  pageError: "",
  feedback: { type: "success", message: "" },
  setShowInputs: vi.fn(),
  loadQuestions: vi.fn(),
  closeFeedback: vi.fn(),
  updateNewQuestionField: vi.fn(),
  saveQuestion: vi.fn(),
  removeQuestion: vi.fn(),
};

describe("AccordionQuestions", () => {
  beforeEach(() => {
    mockUseQuestions.mockReturnValue(baseQuestionsState);
  });

  it("muestra acciones de edición para usuarios autenticados", () => {
    mockUseUser.mockReturnValue({ isAuthenticated: true });

    render(<AccordionQuestions />);

    expect(screen.getByLabelText(/agregar pregunta frecuente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/eliminar pregunta pregunta 1/i)).toBeInTheDocument();
  });

  it("oculta acciones de edición para usuarios no autenticados", () => {
    mockUseUser.mockReturnValue({ isAuthenticated: false });

    render(<AccordionQuestions />);

    expect(screen.queryByLabelText(/agregar pregunta frecuente/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/eliminar pregunta pregunta 1/i)).not.toBeInTheDocument();
  });

  it("invoca la eliminación desde la interfaz autenticada", () => {
    const removeQuestion = vi.fn();
    mockUseUser.mockReturnValue({ isAuthenticated: true });
    mockUseQuestions.mockReturnValue({
      ...baseQuestionsState,
      removeQuestion,
    });

    render(<AccordionQuestions />);
    fireEvent.click(screen.getByLabelText(/eliminar pregunta pregunta 1/i));

    expect(removeQuestion).toHaveBeenCalledWith(1);
  });
});
