import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useEffect, useState } from "react";
import {
  getQuestions,
  storeQuestion,
  deleteQuestion,
} from "../../Services/Questions";

export const AccordionQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "" });
  const [showInputs, setShowInputs] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');

  const hasRoles = (role) => roles.includes(role);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getQuestions();

        const data = response.data;
        setQuestions(Array.isArray(data) ? data : []);
      } catch (error) {
        setQuestions([]);
      }
    };
    fetchQuestions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question || !newQuestion.answer) {
      setErrorMessage("Por favor, completa ambos campos.");
      return;
    }
    try {
      const response = await storeQuestion(newQuestion);

      const savedQuestion = response?.data;

      if (savedQuestion && savedQuestion.id) {
        setQuestions([...questions, savedQuestion]);
        setErrorMessage(""); 
      } else {
        setErrorMessage("La respuesta del backend no tiene el formato esperado.");
      }

      setNewQuestion({ question: "", answer: "" });
      setShowInputs(false);
    } catch (error) {
      setErrorMessage("Error al guardar la pregunta.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (error) {
       setErrorMessage("Error al eliminar la pregunta.");
    }
  };

  return (
    <div>
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage("")}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            margin: "10px",
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {questions.map((item, index) => (
        <Accordion
          key={index}
          sx={{
            background: "#113F6A",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
            aria-controls={`panel${index}-content`}
            sx={{
              background: "#081f34",
              padding: 1.5,
            }}
          >
            <Typography
              sx={{
                fontSize: { sm: "16px", md: "22px", lg: "24px" },
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {item.question}
            </Typography>
            {hasRoles("juez") && (
              <IconButton
                onClick={() => handleDeleteQuestion(item.id)}
                sx={{ marginLeft: "auto", color: "red" }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              sx={{
                fontSize: { sm: "14px", md: "16px", lg: "20px" },
                color: "#eee",
              }}
            >
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      {hasRoles("juez") && (
        <div style={{ display: "flex", justifyContent: "center", margin: "1em 0" }}>
          <IconButton onClick={() => setShowInputs(!showInputs)} color="primary">
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </div>
      )}

      {hasRoles("juez") && showInputs && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "1em",
          }}
        >
          <TextField
            label="Pregunta"
            name="question"
            value={newQuestion.question}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginBottom: "1em" }}
          />
          <TextField
            label="Respuesta"
            name="answer"
            value={newQuestion.answer}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddQuestion}
            sx={{ marginTop: "1em" }}
          >
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
};
