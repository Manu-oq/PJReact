import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Grid, Card, CardActionArea, 
  CircularProgress, Alert, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Slide
} from "@mui/material";
import DomainIcon from '@mui/icons-material/Domain';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoIcon from '@mui/icons-material/Info';

import { getUnidades, uploadPostulantesExcel } from "../../Services/LibertadCondicionalService";

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

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const data = await getUnidades();
        setUnidades(data);
      } catch (err) {
        setErrorMsg("Error cargando unidades penales.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  const handleUnidadSelect = (unidadId) => {
    navigate(`/comision-libertad-condicional/unidad/${unidadId}`);
  };

  // --- LÓGICA DE CARGA DE EXCEL ---
  const handleConfirmExcelModal = () => {
    setOpenExcelModal(false);
    fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    event.target.value = null;

    try {
      setUploading(true);
      const fallbackId = unidades.length > 0 ? unidades[0].id : null;
      
      await uploadPostulantesExcel(file, fallbackId);
      alert("Importación masiva finalizada correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al procesar el archivo masivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '80vh' }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
            <Typography variant="h4" color="primary" fontWeight="bold">
                Gestión de Libertad Condicional
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
                Seleccione unidad para votar o realice una carga masiva.
            </Typography>
        </Box>

        <Box>
            <input type="file" accept=".xlsx, .xls" hidden ref={fileInputRef} onChange={handleFileUpload} />
            <Button 
                variant="contained" 
                color="primary" 
                startIcon={uploading ? <CircularProgress size={20} color="inherit"/> : <UploadFileIcon />} 
                onClick={() => setOpenExcelModal(true)}
                disabled={uploading}
            >
                {uploading ? "Cargando..." : "Cargar Postulantes (Excel)"}
            </Button>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
            {unidades.map((unidad) => (
                <Grid item xs={12} sm={6} md={4} key={unidad.id}>
                    <Card sx={{ height: '100%', transition: 'all 0.2s', '&:hover': { transform: 'scale(1.03)', boxShadow: 6 } }}>
                        <CardActionArea 
                            onClick={() => handleUnidadSelect(unidad.id)}
                            sx={{ height: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <DomainIcon sx={{ fontSize: 50, color: '#081f34', mb: 2 }} />
                            <Typography variant="h6" align="center" fontWeight="bold">
                                {unidad.nombre}
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
      )}

     {/* MODAL INFORMATIVO EXCEL */}
      <Dialog open={openExcelModal} onClose={() => setOpenExcelModal(false)} TransitionComponent={Transition} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#f5f5f5' }}>
              <InfoIcon color="primary" /> Instrucciones de Carga Masiva
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                  El sistema validará cada fila del archivo. Aquellas que no cumplan con el formato o tengan unidades desconocidas <strong>serán descartadas</strong>.
              </Typography>
              <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1, border: '1px solid #ffe0b2', mt: 2, mb: 2 }}>
                  <Typography variant="caption" fontWeight="bold">FORMATO OBLIGATORIO DE COLUMNAS:</Typography>
                  <ol style={{ margin: '10px 0', paddingLeft: 20, fontSize: '0.9rem' }}>
                      <li>Rol (Ej: 123-2024)</li>
                      <li>Nombre</li>
                      <li>Apellido</li>
                      <li>RUN (Ej: 12.345.678-9)</li>
                      <li><strong>Unidad</strong> (Debe coincidir con nombres oficiales: Ej. C.C.P. Temuco)</li>
                  </ol>
              </Box>
              <Typography variant="body2" color="error" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <InfoIcon fontSize="small" /> 
                  Las filas con la columna "Unidad" vacía o mal escrita no se cargarán.
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