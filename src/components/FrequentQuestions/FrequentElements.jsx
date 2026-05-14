import { Box, Container, Paper, Typography } from "@mui/material";

import { AccordionQuestions } from "./AccordionQuestions";

export const FrequentElements = () => {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 5 },
            mb: 3,
            borderRadius: 4,
            background: "linear-gradient(180deg, rgba(8,31,52,0.98) 0%, rgba(17,63,106,0.95) 100%)",
            color: "#fff",
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}
          >
            Centro de ayuda
          </Typography>
          <Typography
            variant="h2"
            className="title-question"
            sx={{
              mt: 1,
              mb: 1.5,
              fontSize: { xs: "2rem", md: "2.8rem" },
              color: "#fff",
            }}
          >
            Preguntas frecuentes
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 760, color: "rgba(255,255,255,0.84)", lineHeight: 1.8 }}>
            Revise respuestas rápidas sobre el funcionamiento de la plataforma, trámites y uso de los módulos disponibles.
          </Typography>
        </Paper>

        <Box>
          <AccordionQuestions />
        </Box>
      </Container>
    </>
  );
};
