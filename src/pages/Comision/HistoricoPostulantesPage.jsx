import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionIcon from "@mui/icons-material/Description";
import { EmptyState, PageErrorState, PageLoader } from "../../components/feedback/PageState";
import { ResponsiveTableSection } from "../../components/ResponsiveTableSection";
import { getApiErrorMessage } from "../../lib/apiClient";
import {
  descargarZipInformesHistoricos,
  getCiclosHistoricos,
  getPostulantesHistoricos,
  prepararInformesHistoricos,
  procesarLoteInformesHistoricos,
} from "../../Services/LibertadCondicionalService";
import {
  buildChunks,
  formatSemestre,
  sortPostulantesHistoricos,
} from "../../features/comision/utils/comisionSelectors.jsx";
import { COMISION_REPORT_CHUNK_SIZE, MAYORIA_NECESARIA_COMISION, TOTAL_JUECES_COMISION } from "../../features/comision/utils/constants";

const formatJuezVotacion = (juez) => {
  if (!juez) return null;

  if (typeof juez === "string") {
    return juez;
  }

  const nombre = juez.nombre || juez.name || juez.juez;
  if (!nombre) return null;

  if (juez.voto === "si") {
    return `${nombre} (CONCEDE)`;
  }

  if (juez.voto === "no") {
    return `${nombre} (DENIEGA)`;
  }

  return nombre;
};

const HistoricoPostulantesPage = () => {
  const { unidadId, cicloId } = useParams();
  const navigate = useNavigate();
  const unidadIdNumerico = Number.parseInt(unidadId, 10);
  const cicloIdNumerico = Number.parseInt(cicloId, 10);
  const unidadIdValido = Number.isInteger(unidadIdNumerico) && unidadIdNumerico > 0;
  const cicloIdValido = Number.isInteger(cicloIdNumerico) && cicloIdNumerico > 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [ciclo, setCiclo] = useState(null);
  const [postulantes, setPostulantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ type: "success", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const closeFeedback = () => setFeedback({ type: "success", message: "" });

  const loadHistorico = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      if (!unidadIdValido || !cicloIdValido) {
        throw new Error("El ciclo histórico seleccionado no es válido.");
      }

      const [ciclosData, postulantesData] = await Promise.all([
        getCiclosHistoricos(unidadIdNumerico),
        getPostulantesHistoricos(cicloIdNumerico),
      ]);

      const currentCiclo = Array.isArray(ciclosData) ? ciclosData.find((item) => item.id === cicloIdNumerico) : null;
      setCiclo(currentCiclo || null);
      setPostulantes(Array.isArray(postulantesData) ? postulantesData : []);
      setSelectedIds([]);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "No se pudieron cargar las postulaciones históricas."));
      setPostulantes([]);
    } finally {
      setLoading(false);
    }
  }, [cicloIdNumerico, cicloIdValido, unidadIdNumerico, unidadIdValido]);

  useEffect(() => {
    loadHistorico();
  }, [loadHistorico]);

  const sortedPostulantes = useMemo(() => sortPostulantesHistoricos(postulantes, searchTerm), [postulantes, searchTerm]);

  const isSelected = (id) => selectedIds.includes(id);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelectedIds(sortedPostulantes.map((postulante) => postulante.id));
      return;
    }

    setSelectedIds([]);
  };

  const handleClickCheckbox = (_, id) => {
    setSelectedIds((previous) => (
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    ));
  };

  const runHistoricalReports = async (ids = null) => {
    try {
      setGenerandoInforme(true);
      setProgreso(0);

      if (!cicloIdValido) {
        throw new Error("El ciclo histórico seleccionado no es válido.");
      }

      if (ids && ids.length === 0) {
        setFeedback({ type: "error", message: "Seleccione al menos un postulante histórico." });
        return;
      }

      const { ids: preparedIds } = await prepararInformesHistoricos(cicloIdNumerico, ids);
      if (!preparedIds || preparedIds.length === 0) {
        setFeedback({ type: "info", message: "No hay postulantes históricos disponibles para generar informes." });
        return;
      }

      const chunks = buildChunks(preparedIds, COMISION_REPORT_CHUNK_SIZE);
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        await procesarLoteInformesHistoricos(cicloIdNumerico, chunk);
        const porcentaje = Math.round((((index + 1) * chunk.length) / preparedIds.length) * 100);
        setProgreso(porcentaje > 100 ? 100 : porcentaje);
      }

      const blob = await descargarZipInformesHistoricos(cicloIdNumerico);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const unidadNombreSafe = (ciclo?.unidad_nombre || "Unidad").replace(/\s+/g, "_");
      link.href = url;
      link.setAttribute("download", `Resoluciones_Historico_${unidadNombreSafe}_${ciclo?.anio || ""}_S${ciclo?.semestre || ""}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setFeedback({ type: "success", message: "Informes históricos generados correctamente." });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error al generar informes históricos.") });
    } finally {
      setGenerandoInforme(false);
      setProgreso(0);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, minHeight: "80vh" }}>
      <Snackbar open={Boolean(feedback.message)} autoHideDuration={4000} onClose={closeFeedback} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} mb={3} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} flexWrap="wrap">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/admin/votaciones/${unidadIdNumerico}/historico`)}>
            Volver
          </Button>
          <Box>
            <Typography variant="h4" color="primary" fontWeight="bold">
              Histórico {ciclo?.unidad_nombre || ""} — {ciclo ? `${ciclo.anio} / ${formatSemestre(ciclo.semestre)}` : ""}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Revise postulaciones archivadas y regenere informes por ciclo.
            </Typography>
          </Box>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DescriptionIcon />}
            disabled={generandoInforme || loading}
            onClick={() => runHistoricalReports(selectedIds)}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            Generar informes seleccionados
          </Button>
          <Button
            variant="contained"
            startIcon={<DescriptionIcon />}
            disabled={generandoInforme || loading}
            onClick={() => runHistoricalReports()}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            Generar informes de todo el ciclo
          </Button>
        </Box>
      </Box>

      {generandoInforme ? (
        <Box sx={{ width: "100%", mb: 3 }}>
          <Typography variant="body2" color="textSecondary" align="right" mb={1}>
            Progreso: {progreso}%
          </Typography>
          <LinearProgress variant="determinate" value={progreso} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
      ) : null}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField fullWidth label="Buscar por Rol, Nombre o RUN..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
      </Paper>

      {loading ? <PageLoader message="Cargando postulaciones históricas..." /> : null}
      {!loading && pageError ? <PageErrorState message={pageError} onRetry={loadHistorico} /> : null}
      {!loading && !pageError && sortedPostulantes.length === 0 ? <EmptyState message="No hay postulaciones históricas en este ciclo." /> : null}

      {!loading && !pageError && sortedPostulantes.length > 0 ? (
        <ResponsiveTableSection minWidth={1040}>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead sx={{ backgroundColor: "#081f34" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      sx={{ color: "white", "&.Mui-checked": { color: "white" } }}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < sortedPostulantes.length}
                      checked={sortedPostulantes.length > 0 && selectedIds.length === sortedPostulantes.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "white", whiteSpace: "nowrap" }}>Rol</TableCell>
                  <TableCell sx={{ color: "white", minWidth: 220 }}>Nombre</TableCell>
                  <TableCell sx={{ color: "white", whiteSpace: "nowrap" }}>RUN</TableCell>
                  <TableCell align="center" sx={{ color: "white", whiteSpace: "nowrap" }}>Estado</TableCell>
                  <TableCell align="center" sx={{ color: "white", whiteSpace: "nowrap" }}>Votos</TableCell>
                  <TableCell align="center" sx={{ color: "white", whiteSpace: "nowrap" }}>Sí</TableCell>
                  <TableCell align="center" sx={{ color: "white", whiteSpace: "nowrap" }}>No</TableCell>
                  <TableCell sx={{ color: "white", minWidth: 280 }}>Jueces que votaron</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedPostulantes.map((postulante) => (
                  <TableRow key={postulante.id} hover selected={isSelected(postulante.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected(postulante.id)} onChange={(event) => handleClickCheckbox(event, postulante.id)} />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{postulante.rol}</TableCell>
                    <TableCell>{postulante.nombre_completo}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{postulante.run}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={(postulante.total_votos || 0) >= TOTAL_JUECES_COMISION ? "COMPLETADO" : "PENDIENTE"}
                        color={(postulante.total_votos || 0) >= TOTAL_JUECES_COMISION ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`${postulante.total_votos || 0} de ${TOTAL_JUECES_COMISION} votos`}>
                        <Box sx={{ minWidth: 90 }}>
                          <Typography variant="body2" fontWeight="bold">{postulante.total_votos || 0}</Typography>
                          <LinearProgress variant="determinate" value={((postulante.total_votos || 0) / TOTAL_JUECES_COMISION) * 100} sx={{ mt: 1, height: 6, borderRadius: 5 }} />
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Typography color={postulante.votos_si >= MAYORIA_NECESARIA_COMISION ? "success.main" : "inherit"} fontWeight="bold">
                        {postulante.votos_si || 0}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography color={postulante.votos_no >= MAYORIA_NECESARIA_COMISION ? "error.main" : "inherit"} fontWeight="bold">
                        {postulante.votos_no || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {Array.isArray(postulante.jueces_votaron) && postulante.jueces_votaron.length > 0
                        ? postulante.jueces_votaron.map(formatJuezVotacion).filter(Boolean).join(", ")
                        : "Sin jueces registrados"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ResponsiveTableSection>
      ) : null}
    </Container>
  );
};

export default HistoricoPostulantesPage;
