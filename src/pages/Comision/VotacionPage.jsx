import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, CircularProgress, Tooltip, Alert
} from "@mui/material";

import DescriptionIcon from '@mui/icons-material/Description'; 
import UploadFileIcon from '@mui/icons-material/UploadFile';   
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EditIcon from '@mui/icons-material/Edit'; 
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Select from "react-select"; 

import { 
  getPostulantes, getFundamentos, getUnidades, emitirVoto,
  checkEstadoUnidad, generarInformesZip, uploadPostulantesExcel 
} from "../../Services/LibertadCondicionalService";

const VotacionPage = () => {
  const { unidadId } = useParams();
  const navigate = useNavigate();
  
  // Estados de flujo
  const [votacionCompleta, setVotacionCompleta] = useState(false);
  const [generandoInforme, setGenerandoInforme] = useState(false); 
  
  // Estados de datos
  const [unidadNombre, setUnidadNombre] = useState("");
  const [postulantes, setPostulantes] = useState([]);
  const [fundamentos, setFundamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); 
  
  // Estados Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [votoSeleccionado, setVotoSeleccionado] = useState(null); 
  const [fundamentoSeleccionado, setFundamentoSeleccionado] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  
  // Referencia para el input file oculto
  const fileInputRef = useRef(null);

  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const mostrarAdmin = roles.includes("archivero") || roles.includes("juez");

  const loadData = async () => {
    setLoading(true);
    try {
      const [unidadesData, postulantesData, fundamentosData] = await Promise.all([
        getUnidades(),
        getPostulantes(unidadId),
        getFundamentos()
      ]);

      const currentUnidad = unidadesData.find(u => u.id === parseInt(unidadId));
      setUnidadNombre(currentUnidad ? currentUnidad.nombre : "Unidad Desconocida");
      
      setPostulantes(postulantesData);
      setFundamentos(fundamentosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
        if(unidadId) {
            const completa = await checkEstadoUnidad(unidadId);
            setVotacionCompleta(completa);
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
      if (unidadId) {
          loadData();
          checkStatus();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadId]);

  const handleBack = () => navigate("/comision-libertad-condicional");
  
  const handleGoToAdmin = () => {
      if (unidadId) {
          navigate(`/admin/votaciones/${unidadId}`);
      }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = null; 

    try {
      setLoading(true);
      await uploadPostulantesExcel(file, unidadId); 
      
      alert("Postulantes cargados correctamente");
      loadData(); 
      checkStatus(); 
    } catch (error) {
      console.error(error);
      setErrorMsg("Error al subir el archivo Excel. Verifique el formato.");
      setTimeout(() => setErrorMsg(""), 5000); 
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarInformes = async () => {
      setGenerandoInforme(true);
      try {
          const blob = await generarInformesZip(unidadId);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Informes_Unidad_${unidadId}.zip`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (error) {
          alert("Error generando informes. Verifique que todos hayan votado.");
      } finally {
          setGenerandoInforme(false);
      }
  };

  const handleOpenVote = (postulante) => {
    setSelectedPostulante(postulante);
    setVotoSeleccionado(null);
    setFundamentoSeleccionado(null);
    setObservaciones("");
    setOpenModal(true);
  };

  const handleSubmitVote = async () => {
     if (!votoSeleccionado || !fundamentoSeleccionado) return;
     try {
       await emitirVoto({
         postulante_id: selectedPostulante.id,
         voto: votoSeleccionado,
         fundamento_id: fundamentoSeleccionado.value,
         observaciones: observaciones
       });
       setOpenModal(false);
       const newData = await getPostulantes(unidadId);
       setPostulantes(newData);
       checkStatus(); 
     } catch (error) {
       alert("Error al guardar el voto");
     }
  };
  
  const parseRol = (rolStr) => {
    if (!rolStr) return { num: 0, year: 0 };
    const parts = rolStr.split('-'); 
    return { num: parseInt(parts[0] || 0), year: parseInt(parts[1] || 0) };
  };

  const sortedPostulantes = [...postulantes]
    .filter(p => p.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) || p.rol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
        const rolA = parseRol(a.rol);
        const rolB = parseRol(b.rol);
        if (rolA.year !== rolB.year) return rolA.year - rolB.year;
        return rolA.num - rolB.num;
    });

  const opcionesFundamentos = fundamentos.filter(f => {
      if (!votoSeleccionado) return false;
      const tipoLimpio = f.tipo_voto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
      return votoSeleccionado === 'si' ? tipoLimpio === 'aprobacion' : tipoLimpio === 'rechazo';
  }).map(f => ({ value: f.id, label: f.texto }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '80vh' }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
                Volver
            </Button>
            <Typography variant="h4" color="primary" fontWeight="bold">
                {unidadNombre}
            </Typography>
        </Box>
        
        <Box display="flex" gap={2}>
            {mostrarAdmin && (
                <Button 
                    variant="contained" color="warning" startIcon={<AdminPanelSettingsIcon />}
                    onClick={handleGoToAdmin}
                >
                    Monitor
                </Button>
            )}
            
            <input 
                type="file" 
                accept=".xlsx, .xls" 
                hidden 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
            />
            <Button 
                variant="outlined" 
                startIcon={<UploadFileIcon />} 
                onClick={() => fileInputRef.current.click()}
            >
                Cargar Postulantes
            </Button>

            <Button 
              variant="contained" 
              color="primary" 
              startIcon={generandoInforme ? <CircularProgress size={20} color="inherit"/> : <DescriptionIcon />}
              disabled={!votacionCompleta || generandoInforme} 
              onClick={handleGenerarInformes}
            >
              {generandoInforme ? "Generando..." : "Resoluciones"}
            </Button>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField fullWidth label="Buscar por Nombre o Rol..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </Paper>

      {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
        <TableContainer component={Paper}>
            <Table>
                <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
                    <TableRow>
                        <TableCell><strong>Rol</strong></TableCell>
                        <TableCell><strong>Nombre Postulante</strong></TableCell>
                        <TableCell align="center"><strong>Mi Voto</strong></TableCell>
                        <TableCell align="right"><strong>Acción</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedPostulantes.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell>{p.rol}</TableCell>
                            <TableCell>{p.nombre_completo}</TableCell>
                            <TableCell align="center">
                                <Chip 
                                  label={p.mi_voto_realizado ? 'VOTADO' : 'PENDIENTE'} 
                                  color={p.mi_voto_realizado ? 'success' : 'warning'} 
                                  size="small"
                                />
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title={p.mi_voto_realizado ? "Editar voto" : "Emitir voto"}>
                                    <IconButton color={p.mi_voto_realizado ? "warning" : "primary"} onClick={() => handleOpenVote(p)}>
                                        {p.mi_voto_realizado ? <EditIcon /> : <HowToVoteIcon />}
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {sortedPostulantes.length === 0 && (
                        <TableRow><TableCell colSpan={4} align="center">No hay postulantes cargados. Use el botón Cargar Postulantes.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      )}

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#081f34', color: 'white' }}>
            {selectedPostulante?.nombre_completo}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
             <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                <Button variant={votoSeleccionado === 'si' ? "contained" : "outlined"} color="success" onClick={() => { setVotoSeleccionado('si'); setFundamentoSeleccionado(null); }}>SÍ</Button>
                <Button variant={votoSeleccionado === 'no' ? "contained" : "outlined"} color="error" onClick={() => { setVotoSeleccionado('no'); setFundamentoSeleccionado(null); }}>NO</Button>
            </Box>
            {votoSeleccionado && (
                <>
                <Select options={opcionesFundamentos} value={fundamentoSeleccionado} onChange={setFundamentoSeleccionado} placeholder="Fundamento..." />
                <TextField fullWidth label="Observaciones" multiline rows={3} sx={{ mt: 3 }} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
                </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
            <Button onClick={handleSubmitVote} variant="contained" disabled={!votoSeleccionado || !fundamentoSeleccionado}>Guardar</Button>
          </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VotacionPage;