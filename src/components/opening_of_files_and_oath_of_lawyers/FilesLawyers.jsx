import { Box, Button, Chip, Link as MuiLink, Paper, Typography } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import Grid from "@mui/material/Grid2";

export const FilesLawyers = () => {
  return (
    <Box sx={{ px: { xs: 1.5, sm: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
      <Grid container spacing={4} sx={{ justifyContent: "center", maxWidth: 1380, mx: "auto" }}>
        <Grid xs={12}>
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background: "linear-gradient(180deg, rgba(8,31,52,0.98) 0%, rgba(17,63,106,0.95) 100%)",
              color: "#fff",
            }}
          >
            <Chip label="Servicios institucionales" sx={{ mb: 2, color: "#fff", backgroundColor: "rgba(255,255,255,0.12)" }} />
            <Typography variant="h3" sx={{ mb: 1.5, color: "#fff" }}>
              Apertura de expediente y juramento de abogados
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 900, color: "rgba(255,255,255,0.84)", lineHeight: 1.85 }}>
              Requisitos, documentación y lineamientos para la redacción y presentación de antecedentes vinculados al proceso de juramento de abogados.
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} lg={6}>
          <Paper
            component="section"
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              height: "100%",
            }}
          >
            <Typography variant="h5" color="primary.main" sx={{ mb: 2.5 }}>
              Redacción del certificado de alegatos
            </Typography>

            <Typography variant="body1" sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              <strong>Requisitos de formato:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 2.5, pl: 3, color: "text.secondary", lineHeight: 1.8 }}>
              <li>Fuente: Calibri</li>
              <li>Tamaño de fuente: 11</li>
              <li>Interlineado: 1.5</li>
              <li>Texto justificado</li>
            </Box>

            <Typography variant="body1" sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              <strong>Ejemplo de contenido:</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 2.5, pl: 3, color: "text.secondary", lineHeight: 1.8 }}>
              <li><strong>Causa rol:</strong> 123-2023 civil</li>
              <li><strong>Relator:</strong> Alejandro Clunes (sin abreviaturas)</li>
              <li><strong>Caratulado:</strong> García / Jiménez (como figura en la página del PJUD)</li>
              <li><strong>Abogados:</strong> solo quienes comparecieron en audiencia</li>
              <li><strong>Materia:</strong> indicar la de primera instancia</li>
              <li><strong>Sala:</strong> Primera</li>
            </Box>

            <Button
              component="a"
              href="plantilla_postulante.doc"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<DownloadOutlinedIcon />}
              sx={{ mb: 2.5, width: { xs: "100%", sm: "auto" } }}
            >
              Descargar plantilla Word
            </Button>

            <Typography variant="body1" sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              Una vez escuchados todos los alegatos, envíe el o los documentos en un solo correo electrónico a <strong>ca_temuco@pjud.cl</strong>, indicando en el asunto <em>“Certificación de alegatos”</em>.
            </Typography>
          </Paper>
        </Grid>

        <Grid xs={12} lg={6}>
          <Paper
            component="article"
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              height: "100%",
            }}
          >
            <Typography variant="h5" color="primary.main" sx={{ mb: 2.5 }}>
              Presentación de documentos
            </Typography>

            <Typography variant="body1" sx={{ lineHeight: 1.85, color: "text.secondary" }}>
              <strong>Paso 1:</strong> Enviar los documentos escaneados al correo <strong>ca_temuco@pjud.cl</strong>.
            </Typography>

            <Box component="ul" sx={{ mt: 1, mb: 2.5, pl: 3, color: "text.secondary", lineHeight: 1.8 }}>
              <li>Certificado de Licenciado</li>
              <li>Certificado de Conducta u Honorabilidad</li>
              <li>Certificado de Notas</li>
              <li>Escrito de Apertura de Expediente (formato PJUD)</li>
              <li>Formulario de Discapacidad</li>
              <li>Formulario del Colegio de Abogados</li>
              <li>Certificado de Nacimiento</li>
              <li>Declaración Jurada de Testigos</li>
              <li>Certificado de Práctica Profesional Aprobada</li>
              <li>Copias simples de cédulas y foto tamaño carnet</li>
            </Box>

            <Typography variant="body1" sx={{ lineHeight: 1.85, color: "text.secondary", mb: 2 }}>
              En caso de dudas, consulte las instrucciones de la Corte Suprema disponibles en el siguiente enlace:
            </Typography>

            <MuiLink href="https://www.pjud.cl/docs/download/2617" target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 700 }}>
              Instrucciones Corte Suprema
            </MuiLink>

            <Typography variant="body1" sx={{ lineHeight: 1.85, color: "text.secondary", mt: 3 }}>
              <strong>Paso 2:</strong> Espere el correo de confirmación con la revisión de antecedentes.
              <br />
              <br />
              <strong>Paso 3:</strong> Preséntese en las dependencias de la Corte con los documentos originales en sobre cerrado, incluyendo nombre, teléfono y correo electrónico.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilesLawyers;
