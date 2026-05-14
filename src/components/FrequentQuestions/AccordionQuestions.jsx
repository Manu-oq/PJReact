import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
  Snackbar,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useUser } from "../context/UserContext";
import { EmptyState, PageErrorState, PageLoader } from "../feedback/PageState";
import { useQuestions } from "../../features/faq/hooks/useQuestions";

export const AccordionQuestions = () => {
  const { isAuthenticated } = useUser();
  const {
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
  } = useQuestions();

  if (loading) {
    return <PageLoader message="Cargando preguntas frecuentes..." />;
  }

  if (pageError) {
    return <PageErrorState message={pageError} onRetry={loadQuestions} />;
  }

  return (
    <Box>
      <Snackbar open={Boolean(feedback.message)} autoHideDuration={4000} onClose={closeFeedback} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      {questions.length === 0 ? <EmptyState message="No hay preguntas frecuentes registradas por el momento." /> : null}

      {questions.map((item) => (
        <Accordion
          key={item.id}
          sx={{
            backgroundColor: "background.paper",
            mb: 2,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#fff" }} />}
            aria-controls={`panel-${item.id}-content`}
            sx={{
              background: "linear-gradient(135deg, #081f34 0%, #113f6a 100%)",
              px: { xs: 2, md: 2.5 },
              py: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: { sm: "1rem", md: "1.2rem", lg: "1.3rem" },
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {item.question}
            </Typography>
            {isAuthenticated ? (
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  removeQuestion(item.id);
                }}
                sx={{ marginLeft: "auto", color: "#ffb4ab" }}
                aria-label={`Eliminar pregunta ${item.question}`}
              >
                <DeleteIcon />
              </IconButton>
            ) : null}
          </AccordionSummary>
          <AccordionDetails sx={{ px: { xs: 2, md: 2.5 }, py: 2.5, backgroundColor: "rgba(255,255,255,0.92)" }}>
            <Typography
              sx={{
                fontSize: { sm: "0.95rem", md: "1rem", lg: "1.05rem" },
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      {isAuthenticated ? (
        <Box sx={{ display: "flex", justifyContent: "center", margin: "1.5em 0 1em" }}>
          <IconButton onClick={() => setShowInputs((previous) => !previous)} color="primary" aria-label="Agregar pregunta frecuente">
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Box>
      ) : null}

      {isAuthenticated && showInputs ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "1.5em",
            gap: 2,
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(8,31,52,0.08)",
          }}
        >
          <TextField label="Pregunta" name="question" value={newQuestion.question} onChange={updateNewQuestionField} fullWidth />
          <TextField label="Respuesta" name="answer" value={newQuestion.answer} onChange={updateNewQuestionField} fullWidth multiline rows={3} />
          <Button variant="contained" color="primary" onClick={saveQuestion}>
            Guardar
          </Button>
        </Box>
      ) : null}
    </Box>
  );
};
