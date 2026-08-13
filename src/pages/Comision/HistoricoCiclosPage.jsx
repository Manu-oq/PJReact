import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { EmptyState, PageErrorState, PageLoader } from "../../components/feedback/PageState";
import { getApiErrorMessage } from "../../lib/apiClient";
import { getCiclosHistoricos, getUnidades } from "../../Services/LibertadCondicionalService";
import { formatFecha, formatSemestre } from "../../features/comision/utils/comisionSelectors.jsx";

const HistoricoCiclosPage = () => {
  const { unidadId } = useParams();
  const navigate = useNavigate();
  const unidadIdNumerico = Number.parseInt(unidadId, 10);
  const unidadIdValido = Number.isInteger(unidadIdNumerico) && unidadIdNumerico > 0;

  const [ciclos, setCiclos] = useState([]);
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const closeFeedback = () => setFeedback({ type: "success", message: "" });

  const loadCiclos = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      if (!unidadIdValido) {
        throw new Error("La unidad seleccionada no es válida.");
      }

      const [ciclosData, unidadesData] = await Promise.all([
        getCiclosHistoricos(unidadIdNumerico),
        getUnidades(),
      ]);

      const unidadActual = unidadesData.find((unidad) => unidad.id === unidadIdNumerico);
      setNombreUnidad(unidadActual?.nombre || ciclosData?.[0]?.unidad_nombre || "Unidad desconocida");
      setCiclos(Array.isArray(ciclosData) ? ciclosData : []);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "No se pudo cargar el histórico de postulaciones."));
      setCiclos([]);
    } finally {
      setLoading(false);
    }
  }, [unidadIdNumerico, unidadIdValido]);

  useEffect(() => {
    loadCiclos();
  }, [loadCiclos]);

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, minHeight: "80vh" }}>
      <Snackbar open={Boolean(feedback.message)} autoHideDuration={4000} onClose={closeFeedback} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} mb={3} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} flexWrap="wrap">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/votaciones/${unidadIdNumerico}`)}>
            Volver
          </Button>
          <Box>
            <Typography variant="h4" color="primary" fontWeight="bold">
              Histórico — {nombreUnidad}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Consulte los ciclos archivados y sus postulaciones cerradas.
            </Typography>
          </Box>
        </Box>
      </Box>

      {loading ? <PageLoader message="Cargando ciclos históricos..." /> : null}
      {!loading && pageError ? <PageErrorState message={pageError} onRetry={loadCiclos} /> : null}
      {!loading && !pageError && ciclos.length === 0 ? <EmptyState message="No hay ciclos históricos registrados para esta unidad." /> : null}

      {!loading && !pageError && ciclos.length > 0 ? (
        <Grid container spacing={3}>
          {ciclos.map((ciclo) => (
            <Grid item xs={12} md={6} key={ciclo.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <HistoryIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {ciclo.anio} — {formatSemestre(ciclo.semestre)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {ciclo.postulantes_count} postulantes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cerrado: {formatFecha(ciclo.cerrado_at)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/admin/votaciones/${unidadIdNumerico}/historico/${ciclo.id}`)}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  >
                    Ver
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Container>
  );
};

export default HistoricoCiclosPage;
