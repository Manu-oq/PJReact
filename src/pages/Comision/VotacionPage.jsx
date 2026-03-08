import { useState, useEffect, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, IconButton,
  Dialog, DialogContent, DialogActions, Chip, CircularProgress, 
  Tooltip, Grid, Card, CardActionArea, Slide, Divider, AppBar, Toolbar, Checkbox
} from "@mui/material";

import DescriptionIcon from '@mui/icons-material/Description'; 
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EditIcon from '@mui/icons-material/Edit'; 
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

import Select from "react-select"; 

import { 
  getPostulantes, getFundamentos, getUnidades, emitirVoto,
  generarInformesZip, deletePostulantes 
} from "../../Services/LibertadCondicionalService";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VotacionPage = () => {
  const { unidadId } = useParams();
  const navigate = useNavigate();
  const [generandoInforme, setGenerandoInforme] = useState(false); 
  const [unidadNombre, setUnidadNombre] = useState("");
  const [postulantes, setPostulantes] = useState([]);
  const [fundamentos, setFundamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]); 
  const [deleting, setDeleting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [votoSeleccionado, setVotoSeleccionado] = useState(null); 
  const [fundamentosSeleccionados, setFundamentosSeleccionados] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const isUnidadLista = postulantes.some(p => p.estado_votacion === 'completado');
  const roles = JSON.parse(localStorage.getItem("roles")) || [];
  const mostrarAdmin = roles.includes("archivero") || roles.includes("juez") || roles.includes("ingeniero");
  const userPermissions = JSON.parse(localStorage.getItem("permissions")) || [];
  const puedeVotar = userPermissions.includes('votar_libertad_condicional');

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
      setSelectedIds([]);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (unidadId) {
          loadData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadId]);

  // --- HANDLERS ---
  const handleBack = () => navigate("/comision-libertad-condicional");
  
  const handleGoToAdmin = () => {
      if (unidadId) navigate(`/admin/votaciones/${unidadId}`);
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
          alert("Error generando informes.");
      } finally {
          setGenerandoInforme(false);
      }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = sortedPostulantes.map((n) => n.id);
      setSelectedIds(newSelecteds);
      return;
    }
    setSelectedIds([]);
  };

  const handleClickCheckbox = (event, id) => {
    const selectedIndex = selectedIds.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedIds, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedIds.slice(1));
    } else if (selectedIndex === selectedIds.length - 1) {
      newSelected = newSelected.concat(selectedIds.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedIds.slice(0, selectedIndex),
        selectedIds.slice(selectedIndex + 1),
      );
    }
    setSelectedIds(newSelected);
  };

  const isSelected = (id) => selectedIds.indexOf(id) !== -1;

  const handleDeleteSelected = async () => {
      if (window.confirm(`¿Está seguro que desea eliminar ${selectedIds.length} postulante(s)? Esta acción no se puede deshacer.`)) {
          setDeleting(true);
          try {
              await deletePostulantes(selectedIds);
              alert("Postulantes eliminados correctamente.");
              loadData(); 
          } catch (error) {
              alert("Error al eliminar postulantes.");
          } finally {
              setDeleting(false);
          }
      }
  };

  const handleOpenVote = (postulante) => {
    setSelectedPostulante(postulante);
    setVotoSeleccionado(null);
    setFundamentosSeleccionados([]);
    setObservaciones("");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => { setVotoSeleccionado(null); }, 200);
  };

  const handleSubmitVote = async () => {
     if (!votoSeleccionado || (votoSeleccionado === 'no' && fundamentosSeleccionados.length === 0)) {
         alert("Debe completar los fundamentos para denegar el beneficio.");
         return;
     }

     try {
       const fundamentosIds = votoSeleccionado === 'si' 
          ? [] 
          : fundamentosSeleccionados.map(f => f.value);

       await emitirVoto({
         postulante_id: selectedPostulante.id,
         voto: votoSeleccionado,
         fundamentos_ids: fundamentosIds,
         observaciones: observaciones
       });
       handleCloseModal();
       loadData(); 
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, minHeight: '80vh' }}>
      
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
                    variant="contained" 
                    sx={{ backgroundColor: '#aa1f34', '&:hover': { backgroundColor: '#8a192a' } }} 
                    startIcon={<AdminPanelSettingsIcon />}
                    onClick={handleGoToAdmin}
                >
                    Monitor
                </Button>
            )}

            <Button 
              variant="contained" 
              color="secondary" 
              startIcon={generandoInforme ? <CircularProgress size={20} color="inherit"/> : <DescriptionIcon />}
              disabled={!isUnidadLista || generandoInforme}  
              onClick={handleGenerarInformes}
              sx={{ color: '#081f34' }}
            >
              {generandoInforme ? "Generando..." : "Resoluciones"}
            </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField 
            fullWidth 
            label="Buscar por Nombre o Rol..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
        />
        {selectedIds.length > 0 && (
            <Button 
                variant="contained" 
                color="error" 
                startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                onClick={handleDeleteSelected}
                disabled={deleting}
                sx={{ minWidth: 220, height: 55 }}
            >
                Eliminar Seleccionados ({selectedIds.length})
            </Button>
        )}
      </Paper>

      {loading ? <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Table>
                <TableHead sx={{ backgroundColor: "#081f34" }}>
                    <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                            indeterminate={selectedIds.length > 0 && selectedIds.length < sortedPostulantes.length}
                            checked={sortedPostulantes.length > 0 && selectedIds.length === sortedPostulantes.length}
                            onChange={handleSelectAllClick}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'white' }}><strong>Rol</strong></TableCell>
                        <TableCell sx={{ color: 'white' }}><strong>Nombre Postulante</strong></TableCell>
                        <TableCell align="center" sx={{ color: 'white' }}><strong>Mi Voto</strong></TableCell>
                        <TableCell align="right" sx={{ color: 'white' }}><strong>Acción</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedPostulantes.map((p) => {
                        const isItemSelected = isSelected(p.id);
                        return (
                            <TableRow 
                                key={p.id} 
                                hover 
                                selected={isItemSelected}
                                sx={{ '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: '#ffebee' } }} 
                            >
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={isItemSelected}
                                    onChange={(event) => handleClickCheckbox(event, p.id)}
                                  />
                                </TableCell>
                                <TableCell>{p.rol}</TableCell>
                                <TableCell>{p.nombre_completo}</TableCell>
                                <TableCell align="center">
                                    <Chip 
                                      label={p.mi_voto_realizado ? 'VOTADO' : 'PENDIENTE'} 
                                      color={p.mi_voto_realizado ? 'success' : 'warning'} 
                                      variant={p.mi_voto_realizado ? 'filled' : 'outlined'}
                                      size="small"
                                    />
                                </TableCell>
                               <TableCell align="right">
                                  {puedeVotar ? (
                                    <Tooltip title={p.mi_voto_realizado ? "Editar mi voto" : "Emitir voto"}>
                                      <IconButton 
                                        color={p.mi_voto_realizado ? "success" : "primary"} 
                                        onClick={() => handleOpenVote(p)}
                                        sx={{ border: '1px solid #eee' }}
                                      >
                                        {p.mi_voto_realizado ? <EditIcon /> : <HowToVoteIcon />}
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Usted no tiene permisos para votar">
                                      <span>
                                          <IconButton disabled sx={{ opacity: 0.5 }}>
                                              <HowToVoteIcon />
                                          </IconButton>
                                      </span>
                                    </Tooltip>
                                  )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {sortedPostulantes.length === 0 && (
                        <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No hay postulantes cargados.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      )}

      {/* MODAL DE VOTACIÓN */}
      <Dialog 
        open={openModal} 
        onClose={handleCloseModal} 
        maxWidth="lg" 
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{ sx: { borderRadius: 3, minHeight: '60vh' } }}
      >
          <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #ddd', backgroundColor: '#081f34' }}>
            <Toolbar>
                <IconButton edge="start" onClick={handleCloseModal} sx={{ color: "#FFFFFF" }}>
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1, color:"#FFFFFF" }} variant="h6" component="div">
                    {selectedPostulante?.nombre_completo} <Chip label={selectedPostulante?.rol} size="small" sx={{ ml: 1, color:"#FFFFFF" }} />
                </Typography>
            </Toolbar>
          </AppBar>

          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
             {!votoSeleccionado && (
                 <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 5 }}>
                    <Typography variant="h5" gutterBottom color="textSecondary" mb={4}>
                        ¿Cuál es su decisión para este postulante?
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} sm={5}>
                            <Card elevation={3} sx={{ border: '2px solid transparent', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)', borderColor: '#2e7d32', boxShadow: 10 } }}>
                                <CardActionArea onClick={() => setVotoSeleccionado('si')} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#e8f5e9' }}>
                                    <CheckCircleIcon sx={{ fontSize: 80, color: '#2e7d32', mb: 2 }} />
                                    <Typography variant="h4" color="#2e7d32" fontWeight="bold">CONCEDER</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Card elevation={3} sx={{ border: '2px solid transparent', transition: 'all 0.3s', '&:hover': { transform: 'scale(1.05)', borderColor: '#c62828', boxShadow: 10 } }}>
                                <CardActionArea onClick={() => setVotoSeleccionado('no')} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#ffebee' }}>
                                    <CancelIcon sx={{ fontSize: 80, color: '#c62828', mb: 2 }} />
                                    <Typography variant="h4" color="#c62828" fontWeight="bold">DENEGAR</Typography>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                 </Box>
             )}

             {votoSeleccionado && (
                <Box sx={{ p: 4, flex: 1, bgcolor: 'white' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: votoSeleccionado === 'si' ? '#2e7d32' : '#c62828' }}>
                            {votoSeleccionado === 'si' ? "CONFIRMAR CONCESIÓN" : "FUNDAMENTOS PARA DENEGAR"}
                        </Typography>
                        <Button onClick={() => { setVotoSeleccionado(null); setFundamentosSeleccionados([]); }} variant="outlined" size="small">
                            Cambiar Decisión
                        </Button>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />

                    {votoSeleccionado === 'no' ? (
                        <>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                Seleccione los motivos técnicos (Múltiple):
                            </Typography>
                            <Select
                                isMulti
                                name="fundamentos"
                                options={opcionesFundamentos}
                                value={fundamentosSeleccionados}
                                onChange={setFundamentosSeleccionados}
                                placeholder="Buscar o seleccionar fundamentos..."
                                className="basic-multi-select"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                maxMenuHeight={300} 
                                styles={{
                                    control: (base) => ({ ...base, padding: 5, borderColor: '#ccc', minHeight: 50 }),
                                    multiValue: (base) => ({ ...base, backgroundColor: '#ffebee' }),
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                        </>
                    ) : (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Al conceder el beneficio, se considerará que el postulante cumple con <strong>todos los requisitos legales</strong> (Conducta, Tiempo mínimo e Informe psicosocial favorable).
                        </Alert>
                    )}

                    <Box mt={4}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Observaciones adicionales (Opcional):
                        </Typography>
                        <TextField
                            fullWidth
                            placeholder="Escriba aquí cualquier detalle adicional relevante..."
                            multiline
                            rows={4}
                            variant="outlined"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            sx={{ bgcolor: '#fff' }}
                        />
                    </Box>
                </Box>
             )}
          </DialogContent>
          
          {votoSeleccionado && (
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
                <Button onClick={handleCloseModal} color="inherit" size="large">
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmitVote} 
                    variant="contained" 
                    color={votoSeleccionado === 'si' ? "success" : "error"}
                    size="large"
                    disabled={votoSeleccionado === 'no' && fundamentosSeleccionados.length === 0}
                    startIcon={<SaveIcon />}
                >
                    Confirmar Voto
                </Button>
            </DialogActions>
          )}
      </Dialog>
    </Container>
  );
};

export default VotacionPage;