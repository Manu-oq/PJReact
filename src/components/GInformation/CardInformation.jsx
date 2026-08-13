import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import "./CardInformation.css";

const CardInformation = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            textAlign: "justify",
          }}
        >
          <Typography variant="h3" color="primary.main" sx={{ mb: 2 }}>
            Información general
          </Typography>
          <Typography variant="body1" sx={{ fontSize: { xs: "1rem", md: "1.08rem" }, lineHeight: 1.9, color: "text.secondary" }}>
            El Poder Judicial en Temuco cumple un rol esencial en la administración de justicia de la Región de la Araucanía. La Corte de Apelaciones de Temuco, junto con los tribunales de primera instancia, articula una respuesta institucional orientada al acceso oportuno y transparente a la justicia.
          </Typography>
          <Typography variant="body1" sx={{ mt: 2.5, fontSize: { xs: "1rem", md: "1.08rem" }, lineHeight: 1.9, color: "text.secondary" }}>
            Esta sección reúne antecedentes prácticos de ubicación, horarios, datos institucionales y contactos de referencia, manteniendo una presentación clara, sobria y coherente con la identidad visual del sitio.
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, height: "100%" }}>
              <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                Datos de atención
              </Typography>
              <Box className="responsive-scroll-shell">
                <Typography className="responsive-scroll-shell__hint">
                  Deslice horizontalmente para revisar la tabla completa.
                </Typography>
                <Box className="responsive-scroll-shell__viewport">
                  <Box className="responsive-scroll-shell__content">
                    <table className="table-information">
                      <thead>
                        <tr>
                          <th>Horario de turno presencial</th>
                          <th>Dirección</th>
                          <th>Datos</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Lunes a Viernes: 08:00 a 14:00</td>
                          <td>Manuel Bulnes 0355, Temuco</td>
                          <td>RUT: 60.311.000-5</td>
                        </tr>
                        <tr>
                          <td>Sábado: 09:00 a 12:00</td>
                          <td>Temuco, Región de La Araucanía</td>
                          <td>Cuenta corriente: 62.900.103.641</td>
                        </tr>
                      </tbody>
                    </table>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, height: "100%" }}>
              <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                Contacto institucional
              </Typography>
              <Box className="responsive-scroll-shell">
                <Typography className="responsive-scroll-shell__hint">
                  Deslice horizontalmente para revisar la tabla completa.
                </Typography>
                <Box className="responsive-scroll-shell__viewport">
                  <Box className="responsive-scroll-shell__content">
                    <table className="table-information">
                      <thead>
                        <tr>
                          <th>Área</th>
                          <th>Correo electrónico</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Cuenta genérica</td>
                          <td className="mail-hightlight">ca_temuco@pjud.cl</td>
                        </tr>
                        <tr>
                          <td>Presidencia</td>
                          <td className="mail-hightlight">presidencia_catemuco@pjud.cl</td>
                        </tr>
                        <tr>
                          <td>Pleno</td>
                          <td className="mail-hightlight">pleno_ca_temuco@pjud.cl</td>
                        </tr>
                      </tbody>
                    </table>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CardInformation;
