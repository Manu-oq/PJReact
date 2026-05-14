import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import DescriptionIcon from "@mui/icons-material/Description";
import ArchiveIcon from "@mui/icons-material/Archive";
import HistoryIcon from "@mui/icons-material/History";

import {
  cerrarCicloHistorico,
  descargarZipInformes,
  getResumenAdmin,
  getUnidades,
  prepararGeneracionInformes,
  procesarLoteInformes,
} from "../../Services/LibertadCondicionalService";
import { EmptyState, PageErrorState, PageLoader } from "../../components/feedback/PageState";
import { getApiErrorMessage } from "../../lib/apiClient";
import {
  buildChunks,
  formatSemestre,
  getResultadoStatus,
  sortResumenAdmin,
} from "../../features/comision/utils/comisionSelectors.jsx";
import {
  COMISION_REPORT_CHUNK_SIZE,
  MAYORIA_NECESARIA_COMISION,
  TOTAL_JUECES_COMISION,
} from "../../features/comision/utils/constants";
import { useComisionAccess } from "../../features/comision/hooks/useComisionAccess";

const currentYear = new Date().getFullYear();

const AdminVotacionPage = () => {
  const { unidadId } = useParams();
  const navigate = useNavigate();
  const unidadIdNumerico = Number.parseInt(unidadId, 10);
  const unidadIdValido = Number.isInteger(unidadIdNumerico) && unidadIdNumerico > 0;
  const { puedeGestionarHistorico } = useComisionAccess();

  const [data, setData] = useState([]);
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [generandoInforme, setGenerandoInforme] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [feedback, setFeedback] = useState({ type: "success", message: "" });
  const [openCerrarCiclo, setOpenCerrarCiclo] = useState(false);
  const [cerrandoCiclo, setCerrandoCiclo] = useState(false);
  const [formCiclo, setFormCiclo] = useState({ anio: currentYear, semestre: 1 });
  const selectedItemRef = useRef(null);

  const closeFeedback = () => setFeedback({ type: "success", message: "" });

  const loadData = useCallback(async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) {
        setLoading(true);
        setPageError("");
      }

      const [resumen, unidades] = await Promise.all([
        getResumenAdmin(),
        nombreUnidad ? Promise.resolve([]) : getUnidades(),
      ]);

      if (!nombreUnidad && unidades.length > 0) {
        const unidadActual = unidades.find((unidad) => unidad.id === unidadIdNumerico);
        if (unidadActual) {
          setNombreUnidad(unidadActual.nombre);
        }
      }

      if (!unidadIdValido) {
        throw new Error("La unidad seleccionada no es válida.");
      }

      const filteredByUnit = resumen.filter((item) => item.unidad_id === unidadIdNumerico);
      setData(filteredByUnit);

      if (selectedItemRef.current) {
        const updatedItem = filteredByUnit.find((item) => item.id === selectedItemRef.current.id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
          selectedItemRef.current = updatedItem;
        }
      }
    } catch (error) {
      if (!isBackgroundUpdate) {
        setPageError(getApiErrorMessage(error, "No se pudo cargar el monitor de votaciones."));
      }
    } finally {
      if (!isBackgroundUpdate) {
        setLoading(false);
      }
    }
  }, [nombreUnidad, unidadIdNumerico, unidadIdValido]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleBack = () => navigate(`/comision-libertad-condicional/unidad/${unidadIdNumerico}`);

  const runReportGeneration = async () => {
    setGenerandoInforme(true);
    setProgreso(0);

    try {
      if (!unidadIdValido) {
        throw new Error("La unidad seleccionada no es válida.");
      }

      const { ids } = await prepararGeneracionInformes(unidadIdNumerico);
      if (!ids || ids.length === 0) {
        setFeedback({ type: "info", message: "No hay postulantes con votación completa." });
        return;
      }

      const chunks = buildChunks(ids, COMISION_REPORT_CHUNK_SIZE);
      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        await procesarLoteInformes(unidadIdNumerico, chunk);
        const porcentaje = Math.round((((index + 1) * chunk.length) / ids.length) * 100);
        setProgreso(porcentaje > 100 ? 100 : porcentaje);
      }

      const blob = await descargarZipInformes(unidadIdNumerico);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Resoluciones_${nombreUnidad}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setFeedback({ type: "success", message: "Resoluciones generadas correctamente." });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error en la generación de resoluciones.") });
    } finally {
      setGenerandoInforme(false);
      setProgreso(0);
    }
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    selectedItemRef.current = item;
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedItem(null);
    selectedItemRef.current = null;
  };

  const handleOpenCerrarCiclo = () => {
    setFormCiclo({ anio: currentYear, semestre: 1 });
    setOpenCerrarCiclo(true);
  };

  const handleCerrarCiclo = async () => {
    const anioNumerico = Number.parseInt(formCiclo.anio, 10);
    const semestreNumerico = Number.parseInt(formCiclo.semestre, 10);

    if (!unidadIdValido) {
      setFeedback({ type: "error", message: "La unidad seleccionada no es válida." });
      return;
    }

    if (!Number.isInteger(anioNumerico)) {
      setFeedback({ type: "error", message: "Debe ingresar un año válido." });
      return;
    }

    if (![1, 2].includes(semestreNumerico)) {
      setFeedback({ type: "error", message: "El semestre debe ser 1 o 2." });
      return;
    }

    try {
      setCerrandoCiclo(true);
      await cerrarCicloHistorico({ unidad_id: unidadIdNumerico, anio: anioNumerico, semestre: semestreNumerico });
      setOpenCerrarCiclo(false);
      setFeedback({ type: "success", message: "Ciclo cerrado correctamente." });
      await loadData(false);
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "No se pudo cerrar el ciclo histórico.") });
    } finally {
      setCerrandoCiclo(false);
    }
  };

  const sortedData = useMemo(() => sortResumenAdmin(data, filtro), [data, filtro]);
  const hayVotacionesListas = data.some((item) => item.total_votos >= TOTAL_JUECES_COMISION);
  const statusDisplay = getResultadoStatus(selectedItem);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Snackbar open={Boolean(feedback.message)} autoHideDuration={4000} onClose={closeFeedback} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} mb={3} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>Volver</Button>
          <Typography variant="h4" color="primary" fontWeight="bold">Monitor: {nombreUnidad}</Typography>
        </Box>

        <Box display="flex" gap={2} flexWrap="wrap" width={{ xs: "100%", md: "auto" }}>
          {puedeGestionarHistorico ? (
            <>
              <Button variant="outlined" startIcon={<ArchiveIcon />} onClick={handleOpenCerrarCiclo} disabled={loading || cerrandoCiclo} sx={{ width: { xs: "100%", md: "auto" } }}>
                Cerrar ciclo
              </Button>
              <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => navigate(`/admin/votaciones/${unidadIdNumerico}/historico`)} disabled={loading} sx={{ width: { xs: "100%", md: "auto" } }}>
                Histórico
              </Button>
            </>
          ) : null}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DescriptionIcon />}
            disabled={!hayVotacionesListas || generandoInforme || loading}
            onClick={runReportGeneration}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            {generandoInforme ? "Procesando IA..." : "Descargar Resoluciones (.ZIP)"}
          </Button>
        </Box>
      </Box>

      {generandoInforme ? (
        <Box sx={{ width: "100%", mb: 3 }}>
          <Typography variant="body2" color="textSecondary" align="right" mb={1}>Progreso: {progreso}%</Typography>
          <LinearProgress variant="determinate" value={progreso} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
      ) : null}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField fullWidth label="Buscar Causa..." variant="outlined" value={filtro} onChange={(event) => setFiltro(event.target.value)} />
      </Paper>

      {loading ? <PageLoader message="Cargando monitor de votaciones..." /> : null}
      {!loading && pageError ? <PageErrorState message={pageError} onRetry={() => loadData(false)} /> : null}
      {!loading && !pageError && sortedData.length === 0 ? <EmptyState message="No hay votaciones registradas para esta unidad." /> : null}

      {!loading && !pageError && sortedData.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#2b88de" }}>
              <TableRow>
                <TableCell sx={{ color: "white" }}>Rol</TableCell>
                <TableCell sx={{ color: "white" }}>Postulante</TableCell>
                <TableCell align="center" sx={{ color: "white" }}>Conteo (Sí / No)</TableCell>
                <TableCell align="center" sx={{ color: "white" }}>Estado Actual</TableCell>
                <TableCell align="center" sx={{ color: "white" }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row) => {
                const resuelto = row.votos_si >= MAYORIA_NECESARIA_COMISION || row.votos_no >= MAYORIA_NECESARIA_COMISION;
                return (
                  <TableRow key={row.id} onClick={() => handleRowClick(row)} hover sx={{ cursor: "pointer", backgroundColor: resuelto ? "#f9fbe7" : "inherit" }}>
                    <TableCell><strong>{row.rol}</strong></TableCell>
                    <TableCell>{row.nombre_completo}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold"><span style={{ color: "green" }}>{row.votos_si}</span> - <span style={{ color: "red" }}>{row.votos_no}</span></Typography>
                      <LinearProgress variant="determinate" value={(row.total_votos / TOTAL_JUECES_COMISION) * 100} sx={{ mt: 1, height: 6, borderRadius: 5 }} />
                    </TableCell>
                    <TableCell align="center">
                      {row.votos_si >= MAYORIA_NECESARIA_COMISION ? <Chip label="APROBADA" color="success" size="small" /> : row.votos_no >= MAYORIA_NECESARIA_COMISION ? <Chip label="RECHAZADA" color="error" size="small" /> : <Chip label="VOTANDO..." color="info" size="small" variant="outlined" />}
                    </TableCell>
                    <TableCell align="center"><IconButton color="primary"><ZoomInIcon /></IconButton></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Dialog open={openCerrarCiclo} onClose={() => setOpenCerrarCiclo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cerrar ciclo de votación</DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Año"
              type="number"
              value={formCiclo.anio}
              onChange={(event) => setFormCiclo((previous) => ({ ...previous, anio: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Semestre"
              select
              SelectProps={{ native: true }}
              value={formCiclo.semestre}
              onChange={(event) => setFormCiclo((previous) => ({ ...previous, semestre: event.target.value }))}
              fullWidth
            >
              <option value={1}>1 - {formatSemestre(1)}</option>
              <option value={2}>2 - {formatSemestre(2)}</option>
            </TextField>
            <Alert severity="warning">
              Esta acción moverá las postulaciones vigentes de esta unidad al histórico. Los votos, fundamentos y observaciones se conservarán. Las postulaciones archivadas ya no aparecerán en la votación vigente. Podrás consultar el histórico y regenerar informes posteriormente. Esta acción no elimina datos.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCerrarCiclo(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleCerrarCiclo} variant="contained" disabled={cerrandoCiclo}>
            {cerrandoCiclo ? "Cerrando..." : "Cerrar ciclo"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="lg" fullWidth PaperProps={{ sx: { minHeight: { xs: "auto", md: "80vh" }, borderRadius: 4, borderTop: `15px solid ${statusDisplay.color}`, display: "flex", flexDirection: "column" } }}>
        {selectedItem ? (
          <DialogContent sx={{ p: 0, display: "flex", flex: 1, overflow: "hidden" }}>
            <Box sx={{ position: "absolute", right: 20, top: 20, zIndex: 10 }}><IconButton onClick={handleCloseDetail} size="large"><CloseIcon fontSize="large" /></IconButton></Box>
            <Grid container sx={{ flex: 1 }}>
              <Grid item xs={12} md={4} sx={{ p: { xs: 3, md: 5 }, backgroundColor: "#f8f9fa", borderRight: { xs: "none", md: "1px solid #ddd" }, borderBottom: { xs: "1px solid #ddd", md: "none" } }}>
                <Typography variant="overline" display="block">Rol</Typography>
                <Typography variant="h2" fontWeight="bold" color="#081f34" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>{selectedItem.rol}</Typography>
                <Box sx={{ my: { xs: 3, md: 5 } }} />
                <Typography variant="overline" display="block">Postulante</Typography>
                <Typography variant="h3" color="#081f34" sx={{ fontSize: { xs: "1.8rem", md: "2.4rem" } }}>{selectedItem.nombre_completo}</Typography>
                <Box sx={{ mt: { xs: 4, md: 10 } }}>
                  <Typography variant="h6" gutterBottom sx={{ borderBottom: "1px solid #ddd", pb: 1 }}>Detalle de Jueces:</Typography>
                  <ul style={{ paddingLeft: "20px", marginTop: "15px", listStyleType: "none" }}>
                    {selectedItem.jueces_votaron.map((juezObj, index) => (
                      <li key={`${juezObj.nombre}-${index}`} style={{ marginBottom: "12px" }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {juezObj.nombre} :
                          <span style={{ marginLeft: "8px", fontWeight: "bold", color: juezObj.voto === "si" ? "#2e7d32" : "#c62828" }}>
                            {juezObj.voto === "si" ? "CONCEDO" : "DENIEGA"}
                          </span>
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              </Grid>
              <Grid item xs={12} md={8} sx={{ p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: statusDisplay.bg, textAlign: "center" }}>
                {statusDisplay.icono}
                <Typography variant="h1" sx={{ fontWeight: "900", color: statusDisplay.color, fontSize: { xs: "2.4rem", md: "4rem" } }}>{statusDisplay.texto}</Typography>
                <Box sx={{ mt: { xs: 4, md: 8 }, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, md: 6 }, width: "100%", justifyContent: "center" }}>
                  <Card elevation={4} sx={{ minWidth: { xs: "100%", sm: 200 }, maxWidth: 260 }}><CardContent><Typography color="success.main" fontWeight="bold">SÍ</Typography><Typography variant="h2" fontWeight="bold">{selectedItem.votos_si}</Typography></CardContent></Card>
                  <Card elevation={4} sx={{ minWidth: { xs: "100%", sm: 200 }, maxWidth: 260 }}><CardContent><Typography color="error.main" fontWeight="bold">NO</Typography><Typography variant="h2" fontWeight="bold">{selectedItem.votos_no}</Typography></CardContent></Card>
                </Box>
                <Box sx={{ mt: { xs: 3, md: 5 } }}><Chip label={`${selectedItem.total_votos} de ${TOTAL_JUECES_COMISION} Votos`} sx={{ fontSize: { xs: "0.95rem", md: "1.2rem" }, p: 2 }} /></Box>
              </Grid>
            </Grid>
          </DialogContent>
        ) : null}
      </Dialog>
    </Container>
  );
};

export default AdminVotacionPage;
