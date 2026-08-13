import pjud from "../../../img/pjud_blanco.png";
import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { Icons, Reference } from "./subcomponents";
import Grid from "@mui/material/Grid2";
import "./footer.css";

export const Footer = () => {
  return (
    <Box
      component="footer"
      className="footer"
      sx={{
        mt: 4,
        color: "#eef4fb",
        background: "linear-gradient(180deg, #081f34 0%, #0c2944 100%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 5 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
          <Grid xs={12} md={4}>
            <Stack spacing={2.5} sx={{ textAlign: { xs: "center", md: "left" }, alignItems: { xs: "center", md: "stretch" } }}>
              <Link href="https://www.pjud.cl/" target="_blank" rel="noopener" sx={{ display: "inline-flex", width: "fit-content" }}>
                <img
                  src={pjud}
                  alt="Poder Judicial"
                  id="id-img-Logo-Pjud"
                  className="logo-pjud"
                />
              </Link>
              <Box>
                <Typography variant="overline" className="footer-kicker">
                  Corte de Apelaciones de Temuco
                </Typography>
                <Typography variant="body1" className="footer-copy">
                  Plataforma institucional orientada a información pública, gestión interna y soporte a procesos de libertad condicional.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "center", md: "flex-start" }} flexWrap="wrap" useFlexGap>
                <Icons title="Facebook" url="https://www.facebook.com/PoderJudicialdeChile" />
                <Icons title="Twitter" url="https://twitter.com/pjudicialchile" />
                <Icons title="Instagram" url="https://www.instagram.com/pjudicialchile/" />
                <Icons title="YouTube" url="https://www.youtube.com/user/pjudicialchile" />
              </Stack>
            </Stack>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Typography variant="h6" className="titles" sx={{ fontWeight: "bold", mb: 2, textAlign: { xs: "center", sm: "left" } }}>
              Enlaces de interés
            </Typography>

            <ul className="list-footer">
              <li><Reference text="Chile Atiende" direction="https://www.chileatiende.gob.cl/" /></li>
              <li><Reference text="Portal de Transparencia del Estado" direction="http://www.portaltransparencia.cl/PortalPdT/" /></li>
              <li><Reference text="Oficina Judicial Virtual" direction="https://ojv.pjud.cl/kpitec-ojv-web/views/login.html" /></li>
              <li><Reference text="Trámite Fácil" direction="https://ojv.pjud.cl/kpitec-ojv-web/tramite_facil" /></li>
              <li><Reference text="Trabaja con nosotros" direction="https://postulaciones.pjud.cl/postulacionessrh/servlet/com.postulaciones.login" /></li>
            </ul>
          </Grid>

          <Grid xs={12} sm={6} md={4}>
            <Typography variant="h6" className="titles" sx={{ fontWeight: "bold", mb: 2, textAlign: { xs: "center", sm: "left" } }}>
              Contacto
            </Typography>

            <ul className="list-footer">
              <li>
                <Typography className="footer-label">Teléfono</Typography>
                <Typography>(45) 2685200</Typography>
              </li>
              <li>
                <Typography className="footer-label">Correo institucional</Typography>
                <Reference text="ca_temuco@pjud.cl" direction="mailto:ca_temuco@pjud.cl" />
              </li>
            </ul>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

        <Typography variant="body2" sx={{ color: "rgba(238,244,251,0.72)", textAlign: { xs: "center", md: "left" } }}>
          © Poder Judicial de Chile — Corte de Apelaciones de Temuco.
        </Typography>
      </Container>
    </Box>
  );
};
