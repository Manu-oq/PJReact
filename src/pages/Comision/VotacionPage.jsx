import { useState, useEffect, forwardRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Grid,
  Card,
  CardActionArea,
  Slide,
  Divider,
  AppBar,
  Toolbar,
  Checkbox,
  Alert,
  Snackbar,
} from "@mui/material";

import HowToVoteIcon from "@mui/icons-material/HowToVote";
import EditIcon from "@mui/icons-material/Edit";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

import Select from "react-select";

import { getPostulantes, getFundamentos, getUnidades, emitirVoto, deletePostulantes } from "../../Services/LibertadCondicionalService";
import { EmptyState, PageErrorState, PageLoader } from "../../components/feedback/PageState";
import { getApiErrorMessage } from "../../lib/apiClient";
import { useComisionAccess } from "../../features/comision/hooks/useComisionAccess";
import { buildFundamentoOptions, sortPostulantes } from "../../features/comision/utils/comisionSelectors.jsx";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VotacionPage = () => {
  const { unidadId } = useParams();
  const navigate = useNavigate();
  const unidadIdNumerico = Number.parseInt(unidadId, 10);
  const unidadIdValido = Number.isInteger(unidadIdNumerico) && unidadIdNumerico > 0;
  const { puedeVotar, mostrarAdmin } = useComisionAccess();

  const [unidadNombre, setUnidadNombre] = useState("");
  const [postulantes, setPostulantes] = useState([]);
  const [fundamentos, setFundamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [votoSeleccionado, setVotoSeleccionado] = useState(null);
  const [fundamentosSeleccionados, setFundamentosSeleccionados] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const closeFeedback = () => setFeedback({ type: "success", message: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      if (!unidadIdValido) {
        throw new Error("La unidad seleccionada no es válida.");
      }

      const [unidadesData, postulantesData, fundamentosData] = await Promise.all([
        getUnidades(),
        getPostulantes(unidadIdNumerico),
        getFundamentos(),
      ]);

      const currentUnidad = unidadesData.find((unidad) => unidad.id === unidadIdNumerico);
      setUnidadNombre(currentUnidad ? currentUnidad.nombre : "Unidad Desconocida");
      setPostulantes(Array.isArray(postulantesData) ? postulantesData : []);
      setFundamentos(Array.isArray(fundamentosData) ? fundamentosData : []);
      setSelectedIds([]);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "No se pudieron cargar los datos de votación."));
    } finally {
      setLoading(false);
    }
  }, [unidadIdNumerico, unidadIdValido]);

  useEffect(() => {
    if (unidadId) {
      loadData();
    }
  }, [loadData, unidadId]);

  const sortedPostulantes = useMemo(() => sortPostulantes(postulantes, searchTerm), [postulantes, searchTerm]);

  const fundamentosAprobacion = useMemo(() => buildFundamentoOptions(fundamentos, "si"), [fundamentos]);
  const opcionesFundamentos = useMemo(() => buildFundamentoOptions(fundamentos, votoSeleccionado), [fundamentos, votoSeleccionado]);

  const handleBack = () => navigate("/comision-libertad-condicional");

  const handleGoToAdmin = () => {
    if (unidadIdValido) {
      navigate(`/admin/votaciones/${unidadIdNumerico}`);
    }
  };

  const resetModalState = () => {
    setVotoSeleccionado(null);
    setFundamentosSeleccionados([]);
    setObservaciones("");
    setSelectedPostulante(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(resetModalState, 200);
  };

  const handleOpenVote = (postulante) => {
    if (!puedeVotar) {
      setFeedback({ type: "error", message: "No tiene permisos para emitir votos." });
      return;
    }

    setSelectedPostulante(postulante);
    setVotoSeleccionado(null);
    setFundamentosSeleccionados([]);
    setObservaciones("");
    setOpenModal(true);
  };

  const handleSubmitVote = async () => {
    if (!puedeVotar) {
      setFeedback({ type: "error", message: "No tiene permisos para emitir votos." });
      return;
    }

    if (!votoSeleccionado || fundamentosSeleccionados.length === 0) {
      setFeedback({ type: "error", message: "Debe seleccionar al menos un fundamento para confirmar el voto." });
      return;
    }

    if (observaciones.length > 2000) {
      setFeedback({ type: "error", message: "Las observaciones no pueden superar los 2000 caracteres." });
      return;
    }

    try {
      setSubmittingVote(true);
      const fundamentosIds = fundamentosSeleccionados.map((fundamento) => fundamento.value);
      await emitirVoto({
        postulante_id: selectedPostulante.id,
        voto: votoSeleccionado,
        fundamentos_ids: fundamentosIds,
        observaciones,
      });
      handleCloseModal();
      setFeedback({ type: "success", message: "Voto guardado correctamente." });
      await loadData();
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error al guardar el voto.") });
    } finally {
      setSubmittingVote(false);
    }
  };

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

  const isSelected = (id) => selectedIds.includes(id);

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    if (!window.confirm(`¿Está seguro que desea eliminar ${selectedIds.length} postulante(s)?`)) {
      return;
    }

    try {
      setDeleting(true);
      await deletePostulantes(selectedIds);
      setFeedback({ type: "success", message: "Postulantes eliminados correctamente." });
      await loadData();
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error al eliminar postulantes.") });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, minHeight: "80vh" }}>
      <Snackbar open={Boolean(feedback.message)} autoHideDuration={4000} onClose={closeFeedback} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={1.5}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>Volver</Button>
          <Typography variant="h4" color="primary" fontWeight="bold">{unidadNombre}</Typography>
        </Box>

        <Box display="flex" gap={2} width={{ xs: "100%", md: "auto" }}>
          {mostrarAdmin ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={handleGoToAdmin}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              Monitor Sala
            </Button>
          ) : null}
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <TextField fullWidth label="Buscar por Nombre o Rol..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        {selectedIds.length > 0 ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            disabled={deleting}
            sx={{ minWidth: 220, height: 55 }}
          >
            {deleting ? "Eliminando..." : `Eliminar (${selectedIds.length})`}
          </Button>
        ) : null}
      </Paper>

      {loading ? <PageLoader message="Cargando postulantes y fundamentos..." /> : null}
      {!loading && pageError ? <PageErrorState message={pageError} onRetry={loadData} /> : null}
      {!loading && !pageError && sortedPostulantes.length === 0 ? <EmptyState message="No hay postulantes para esta unidad." /> : null}

      {!loading && !pageError && sortedPostulantes.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
          <Table>
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
                <TableCell sx={{ color: "white" }}><strong>Rol</strong></TableCell>
                <TableCell sx={{ color: "white" }}><strong>Nombre Postulante</strong></TableCell>
                <TableCell align="center" sx={{ color: "white" }}><strong>Mi Voto</strong></TableCell>
                <TableCell align="right" sx={{ color: "white" }}><strong>Acción</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPostulantes.map((postulante) => {
                const isItemSelected = isSelected(postulante.id);
                return (
                  <TableRow key={postulante.id} hover selected={isItemSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} onChange={(event) => handleClickCheckbox(event, postulante.id)} />
                    </TableCell>
                    <TableCell>{postulante.rol}</TableCell>
                    <TableCell>{postulante.nombre_completo}</TableCell>
                    <TableCell align="center">
                      {puedeVotar ? (
                        <Chip
                          label={postulante.mi_voto_realizado ? "VOTADO" : "PENDIENTE"}
                          color={postulante.mi_voto_realizado ? "success" : "warning"}
                          variant={postulante.mi_voto_realizado ? "filled" : "outlined"}
                          size="small"
                        />
                      ) : (
                        <Typography variant="caption" color="textSecondary">No disponible</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {puedeVotar ? (
                        <Tooltip title={postulante.mi_voto_realizado ? "Editar mi voto" : "Emitir voto"}>
                          <IconButton color={postulante.mi_voto_realizado ? "success" : "primary"} onClick={() => handleOpenVote(postulante)} sx={{ border: "1px solid #eee" }}>
                            {postulante.mi_voto_realizado ? <EditIcon /> : <HowToVoteIcon />}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Usted no tiene permisos para votar"><span><IconButton disabled><HowToVoteIcon /></IconButton></span></Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="lg" fullWidth TransitionComponent={Transition} PaperProps={{ sx: { borderRadius: 3, minHeight: "60vh" } }}>
        <AppBar position="static" elevation={0} sx={{ borderBottom: "1px solid #ddd", backgroundColor: "#081f34" }}>
          <Toolbar>
            <IconButton edge="start" onClick={handleCloseModal} sx={{ color: "#FFFFFF" }}><CloseIcon /></IconButton>
            <Typography sx={{ ml: 2, flex: 1, color: "#FFFFFF" }} variant="h6">
              {selectedPostulante?.nombre_completo}
              <Chip label={selectedPostulante?.rol} size="small" sx={{ ml: 1, color: "#FFFFFF", borderColor: "white" }} variant="outlined" />
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", backgroundColor: "#f9f9f9" }}>
          {!votoSeleccionado ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 5 }}>
              <Typography variant="h5" color="textSecondary" mb={4}>¿Cuál es su decisión?</Typography>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={5}>
                  <Card elevation={3} sx={{ border: "2px solid transparent", "&:hover": { transform: "scale(1.05)", borderColor: "#2e7d32" } }}>
                    <CardActionArea onClick={() => { setVotoSeleccionado("si"); setFundamentosSeleccionados(fundamentosAprobacion); }} sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "#e8f5e9" }}>
                      <CheckCircleIcon sx={{ fontSize: 80, color: "#2e7d32", mb: 2 }} />
                      <Typography variant="h4" color="#2e7d32" fontWeight="bold">CONCEDER</Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Card elevation={3} sx={{ border: "2px solid transparent", "&:hover": { transform: "scale(1.05)", borderColor: "#c62828" } }}>
                    <CardActionArea onClick={() => { setVotoSeleccionado("no"); setFundamentosSeleccionados([]); }} sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "#ffebee" }}>
                      <CancelIcon sx={{ fontSize: 80, color: "#c62828", mb: 2 }} />
                      <Typography variant="h4" color="#c62828" fontWeight="bold">DENEGAR</Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          ) : null}

          {votoSeleccionado ? (
            <Box sx={{ p: 4, flex: 1, bgcolor: "white" }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: votoSeleccionado === "si" ? "#2e7d32" : "#c62828" }}>
                  {votoSeleccionado === "si" ? "FUNDAMENTOS PARA CONCEDER" : "FUNDAMENTOS PARA DENEGAR"}
                </Typography>
                <Button onClick={() => { setVotoSeleccionado(null); setFundamentosSeleccionados([]); }} variant="outlined" size="small">Cambiar Decisión</Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {votoSeleccionado === "no" ? (
                <>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">Motivos técnicos (Múltiple):</Typography>
                  <Select isMulti options={opcionesFundamentos} value={fundamentosSeleccionados} onChange={(value) => setFundamentosSeleccionados(value || [])} menuPortalTarget={document.body} styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} />
                </>
              ) : (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>Para conceder, deben mantenerse seleccionados todos los fundamentos de aprobación.</Alert>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">Fundamentos de aprobación:</Typography>
                  <Select isMulti isDisabled options={opcionesFundamentos} value={fundamentosSeleccionados} menuPortalTarget={document.body} styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }} />
                </>
              )}
              <Box mt={4}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">Observaciones adicionales (Opcional):</Typography>
                <TextField fullWidth multiline rows={4} variant="outlined" value={observaciones} onChange={(event) => setObservaciones(event.target.value.slice(0, 2000))} helperText={`${observaciones.length}/2000`} />
              </Box>
            </Box>
          ) : null}
        </DialogContent>
        {votoSeleccionado ? (
          <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
            <Button onClick={handleCloseModal} color="inherit" size="large">Cancelar</Button>
            <Button
              onClick={handleSubmitVote}
              variant="contained"
              color={votoSeleccionado === "si" ? "success" : "error"}
              size="large"
              disabled={submittingVote || fundamentosSeleccionados.length === 0}
              startIcon={<SaveIcon />}
            >
              {submittingVote ? "Guardando..." : "Confirmar Voto"}
            </Button>
          </DialogActions>
        ) : null}
      </Dialog>
    </Container>
  );
};

export default VotacionPage;
