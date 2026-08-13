import { Box, Chip, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import publico from "../../img/publico.png";
import apertura from "../../img/apertura.png";
import corteTemucoImg from "../../img/CorteTemuco.jpg";
import { CardComponent } from "../GridComponents/CardComponent";
import "./home.css";

const highlights = [
  {
    icon: <AccountBalanceOutlinedIcon fontSize="small" />,
    label: "Institución",
    value: "Corte de Apelaciones de Temuco",
  },
  {
    icon: <GavelOutlinedIcon fontSize="small" />,
    label: "Enfoque",
    value: "Acceso claro a información y servicios",
  },
  {
    icon: <FmdGoodOutlinedIcon fontSize="small" />,
    label: "Ubicación",
    value: "Manuel Bulnes 0355, Temuco",
  },
];

export const HomeElements = () => {
  return (
    <>
      <Box
        className="container-first-image"
        sx={{
          background: `
            linear-gradient(180deg, rgba(8, 31, 52, 0.42) 0%, rgba(8, 31, 52, 0.74) 100%),
            url(${corteTemucoImg}) no-repeat center center
          `,
          backgroundSize: "cover",
        }}
      >
        <Container maxWidth="xl" sx={{ height: "100%", display: "flex", alignItems: "center", py: { xs: 2, md: 0 } }}>
          <Paper className="hero-panel">
            <Chip label="Poder Judicial de Chile" className="hero-chip" />
            <Typography variant="h1" className="hero-title">
              Corte de Apelaciones de Temuco
            </Typography>
            <Typography variant="body1" className="hero-text">
              Plataforma institucional diseñada para entregar información útil, acceso ordenado a servicios y soporte a procesos internos con una experiencia clara, formal y confiable.
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} className="hero-highlights">
              {highlights.map((item) => (
                <Box key={item.label} className="hero-highlight" sx={{ width: { xs: "100%", md: "auto" } }}>
                  <Box className="hero-highlight-icon">{item.icon}</Box>
                  <Box>
                    <Typography variant="caption" className="hero-highlight-label">
                      {item.label}
                    </Typography>
                    <Typography variant="body2" className="hero-highlight-value">
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" color="primary.main" sx={{ mb: 1 }}>
            Accesos directos
          </Typography>
          <Typography variant="subtitle1">
            Servicios y accesos frecuentes disponibles desde la plataforma institucional.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
          <Grid item xs={12} sm={6} md="auto" display="flex" justifyContent="center" sx={{ width: { xs: "100%", md: "auto" } }}>
            <CardComponent url="https://buzon.pjud.cl/formulario" title="publico" img={publico} />
          </Grid>
          <Grid item xs={12} sm={6} md="auto" display="flex" justifyContent="center" sx={{ width: { xs: "100%", md: "auto" } }}>
            <CardComponent url="/Apertura-juramentos" title="apertura" img={apertura} />
          </Grid>
        </Grid>
      </Container>

      <Container maxWidth="xl" sx={{ pb: { xs: 6, md: 8 } }}>
        <Grid container spacing={4} alignItems="stretch" justifyContent="center">
          <Grid item xs={12} lg={5}>
            <Paper className="info-panel">
              <Typography variant="overline" className="section-kicker">
                Información institucional
              </Typography>
              <Typography variant="h4" color="primary.main" sx={{ mb: 2 }}>
                Justicia cercana, clara y accesible
              </Typography>
              <Typography variant="body1" className="info-copy">
                El Poder Judicial es uno de los tres pilares del Estado democrático de derecho. Esta plataforma concentra información de la Corte de Apelaciones de Temuco con un enfoque práctico, formal y orientado a facilitar la relación con usuarios y funcionarios.
              </Typography>
              <Typography variant="body1" className="info-copy">
                Aquí se prioriza una navegación sobria, comprensible y estable, manteniendo la identidad institucional y mejorando la claridad visual de cada proceso.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Paper className="map-panel">
              <Typography variant="h5" color="primary.main" sx={{ mb: 2 }}>
                Ubicación
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Corte de Apelaciones de Temuco — Manuel Bulnes 0355, Temuco.
              </Typography>
              <Box className="map-about-information">
                <iframe
                  title="Mapa Corte de Apelaciones de Temuco"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3112.4980591537533!2d-72.5891324875869!3d-38.729331586801294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9614d3c15a4ae635%3A0xa60027e7ca9a9662!2sCorte%20de%20Apelaciones%20de%20Temuco!5e0!3m2!1ses-419!2scl!4v1727174139672!5m2!1ses-419!2scl"
                  style={{ border: 0, width: "100%", height: "100%" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default HomeElements;
