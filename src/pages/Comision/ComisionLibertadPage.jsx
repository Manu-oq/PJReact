import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Snackbar,
} from "@mui/material";
import DomainIcon from "@mui/icons-material/Domain";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import InfoIcon from "@mui/icons-material/Info";

import { getUnidades, uploadPostulantesExcel } from "../../Services/LibertadCondicionalService";
import { EmptyState, PageErrorState, PageLoader } from "../../components/feedback/PageState";
import { getApiErrorMessage } from "../../lib/apiClient";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ComisionLibertadPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [openExcelModal, setOpenExcelModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: "success", message: "" });

  const closeFeedback = () => setFeedback({ type: "success", message: "" });

  const loadUnidades = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getUnidades();
      setUnidades(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMsg(getApiErrorMessage(error, "Error cargando unidades penales."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnidades();
  }, []);

  const handleUnidadSelect = (unidadId) => {
    navigate(`/comision-libertad-condicional/unidad/${unidadId}`);
  };

  const handleConfirmExcelModal = () => {
    setOpenExcelModal(false);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = null;

    try {
      setUploading(true);
      const fallbackId = unidades.length > 0 ? unidades[0].id : null;
      await uploadPostulantesExcel(file, fallbackId);
      setFeedback({ type: "success", message: "Importación masiva finalizada correctamente." });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Error al procesar el archivo masivo.") });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: "80vh" }}>
      <Snackbar open={Boolean(feedback.message)} autoHideDuration={4000} onClose={closeFeedback} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          gap: 2,
          flexWrap: "wrap",
          p: 0,
        }}
      >
        <Box>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Gestión de Libertad Condicional
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Seleccione unidad para votar o realice una carga masiva.
          </Typography>
        </Box>

        <Box>
          <input type="file" accept=".xlsx, .xls" hidden ref={fileInputRef} onChange={handleFileUpload} />
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenExcelModal(true)}
            disabled={uploading || loading}
          >
            {uploading ? "Cargando..." : "Cargar Postulantes (Excel)"}
          </Button>
        </Box>
      </Box>

      {loading ? <PageLoader message="Cargando unidades penales..." /> : null}
      {!loading && errorMsg ? <PageErrorState message={errorMsg} onRetry={loadUnidades} /> : null}
      {!loading && !errorMsg && unidades.length === 0 ? <EmptyState message="No hay unidades disponibles para gestionar." /> : null}

      {!loading && !errorMsg && unidades.length > 0 ? (
        <Grid container spacing={3}>
          {unidades.map((unidad) => (
            <Grid item xs={12} sm={6} md={4} key={unidad.id}>
              <Card
                sx={{
                  height: "100%",
                  transition: "transform 0.24s ease, box-shadow 0.24s ease",
                  borderRadius: 4,
                  "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
                }}
              >
                <CardActionArea
                  onClick={() => handleUnidadSelect(unidad.id)}
                  sx={{
                    height: "100%",
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 2,
                    background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(247,250,252,1) 100%)",
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "18px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(43,136,222,0.1)",
                    }}
                  >
                    <DomainIcon sx={{ fontSize: 34, color: "#081f34" }} />
                  </Box>
                  <Typography variant="h6" align="left" fontWeight="bold">
                    {unidad.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acceda a la vista de votación vigente y al monitoreo administrativo de la unidad seleccionada.
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}

      <Dialog open={openExcelModal} onClose={() => setOpenExcelModal(false)} TransitionComponent={Transition} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, backgroundColor: "#f5f5f5" }}>
          <InfoIcon color="primary" /> Instrucciones de Carga Masiva
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            El sistema validará cada fila del archivo. Aquellas que no cumplan con el formato o tengan unidades desconocidas <strong>serán descartadas</strong>.
          </Typography>
          <Box sx={{ bgcolor: "#fff3e0", p: 2, borderRadius: 1, border: "1px solid #ffe0b2", mt: 2, mb: 2 }}>
            <Typography variant="caption" fontWeight="bold">FORMATO OBLIGATORIO DE COLUMNAS:</Typography>
            <ol style={{ margin: "10px 0", paddingLeft: 20, fontSize: "0.9rem" }}>
              <li>Rol (Ej: 123-2024)</li>
              <li>Nombre</li>
              <li>Apellido</li>
              <li>RUN (Ej: 12.345.678-9)</li>
              <li><strong>Unidad</strong> (Debe coincidir con nombres oficiales: Ej. C.C.P. Temuco)</li>
            </ol>
          </Box>
          <Typography variant="body2" color="error" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 0.5 }}>
            <InfoIcon fontSize="small" />
            Las filas con la columna &quot;Unidad&quot; vacía o mal escrita no se cargarán.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenExcelModal(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleConfirmExcelModal} variant="contained" color="primary" startIcon={<UploadFileIcon />}>
            Seleccionar Archivo
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ComisionLibertadPage;
