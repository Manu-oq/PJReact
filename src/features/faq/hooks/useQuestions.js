import { useCallback, useEffect, useState } from "react";
import { deleteQuestion, getQuestions, storeQuestion } from "../../../Services/Questions";
import { getApiErrorMessage } from "../../../lib/apiClient";

export const useQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "" });
  const [showInputs, setShowInputs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");
      const data = await getQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "No se pudieron cargar las preguntas frecuentes."));
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const closeFeedback = () => setFeedback({ type: "success", message: "" });

  const updateNewQuestionField = (event) => {
    const { name, value } = event.target;
    setNewQuestion((previous) => ({ ...previous, [name]: value }));
  };

  const saveQuestion = async () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) {
      setFeedback({ type: "error", message: "Por favor, completa ambos campos." });
      return false;
    }

    try {
      const savedQuestion = await storeQuestion(newQuestion);

      if (!savedQuestion?.id) {
        setFeedback({ type: "error", message: "La respuesta del backend no tiene el formato esperado." });
        return false;
      }

      setQuestions((previous) => [...previous, savedQuestion]);
      setNewQuestion({ question: "", answer: "" });
      setShowInputs(false);
      setFeedback({ type: "success", message: "Pregunta guardada correctamente." });
      return true;
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error al guardar la pregunta.") });
      return false;
    }
  };

  const removeQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions((previous) => previous.filter((question) => question.id !== id));
      setFeedback({ type: "success", message: "Pregunta eliminada correctamente." });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error al eliminar la pregunta.") });
    }
  };

  return {
    questions,
    newQuestion,
    showInputs,
    loading,
    pageError,
    feedback,
    setShowInputs,
    loadQuestions,
    closeFeedback,
    updateNewQuestionField,
    saveQuestion,
    removeQuestion,
  };
};
