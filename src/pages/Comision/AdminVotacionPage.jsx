import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, TextField, Button,
  Dialog, DialogContent, IconButton, Grid, Card, CardContent
} from "@mui/material";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { getResumenAdmin, getUnidades } from "../../Services/LibertadCondicionalService";

const AdminVotacionPage = () => {
  const { unidadId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [nombreUnidad, setNombreUnidad] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const selectedItemRef = useRef(null);

  const TOTAL_JUECES = 5;
  const MAYORIA_NECESARIA = 3;

  const DEFAULT_STATUS = { 
      texto: "", 
      color: "transparent", 
      bg: "#ffffff", 
      icono: null 
  };

  const loadData = async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) setLoading(true);

      const [resumen, unidades] = await Promise.all([
          getResumenAdmin(),
          nombreUnidad ? Promise.resolve([]) : getUnidades()
      ]);
      
      if (!nombreUnidad && unidades.length > 0) {
          const u = unidades.find(x => x.id === parseInt(unidadId));
          if(u) setNombreUnidad(u.nombre);
      }

      const filteredByUnit = resumen.filter(r => r.unidad_id === parseInt(unidadId));
      setData(filteredByUnit);
      
      if (selectedItemRef.current) {
        const updatedItem = filteredByUnit.find(r => r.id === selectedItemRef.current.id);
        if (updatedItem) {
            setSelectedItem(updatedItem);
            selectedItemRef.current = updatedItem;
        }
      }
    } catch (error) {
      console.error("Error cargando resumen");
    } finally {
      if (!isBackgroundUpdate) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
        loadData(true);
    }, 2000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadId]); 

  const handleBack = () => {
      navigate(`/comision-libertad-condicional/unidad/${unidadId}`);
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

  const getResultadoStatus = (item) => {
    if (!item) return DEFAULT_STATUS;

    if (item.votos_si >= MAYORIA_NECESARIA) {
        return { 
            texto: "LIBERTAD CONCEDIDA", 
            color: "#2e7d32", 
            bg: "#e8f5e9",
            icono: <CheckCircleIcon sx={{ fontSize: 100, color: '#2e7d32' }} />
        };
    } 
    if (item.votos_no >= MAYORIA_NECESARIA) {
        return { 
            texto: "LIBERTAD DENEGADA", 
            color: "#c62828", 
            bg: "#ffebee",
            icono: <CancelIcon sx={{ fontSize: 100, color: '#c62828' }} />
        };
    }
    return { 
        texto: "EN VOTACIÓN", 
        color: "#0288d1", 
        bg: "#e1f5fe",
        icono: <HowToVoteIcon sx={{ fontSize: 100, color: '#0288d1' }} />
    };
  };

  const parseRol = (rolStr) => {
    if (!rolStr) return { num: 0, year: 0 };
    const parts = rolStr.split('-'); 
    return { num: parseInt(parts[0] || 0), year: parseInt(parts[1] || 0) };
  };

  const filteredData = data.filter(item => 
    item.rol.toLowerCase().includes(filtro.toLowerCase()) || 
    item.nombre_completo.toLowerCase().includes(filtro.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
      const rolA = parseRol(a.rol);
      const rolB = parseRol(b.rol);
      if (rolA.year !== rolB.year) return rolA.year - rolB.year;
      return rolA.num - rolB.num;
  });

  const statusDisplay = getResultadoStatus(selectedItem) || DEFAULT_STATUS;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Volver a Votación ({nombreUnidad})
      </Button>

      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        Monitor Sala: {nombreUnidad}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
         <TextField 
            fullWidth 
            label="Buscar Causa en Monitor" 
            variant="outlined" 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Escriba Rol o Nombre..."
         />
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#081f34" }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Rol</TableCell>
              <TableCell sx={{ color: 'white' }}>Postulante</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Conteo (Sí / No)</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Estado Actual</TableCell>
              <TableCell align="center" sx={{ color: 'white' }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => {
              const resuelto = row.votos_si >= MAYORIA_NECESARIA || row.votos_no >= MAYORIA_NECESARIA;
              
              return (
                <TableRow 
                    key={row.id} 
                    onClick={() => handleRowClick(row)}
                    hover
                    sx={{ 
                        cursor: 'pointer', 
                        backgroundColor: resuelto ? '#f9fbe7' : 'inherit',
                        transition: 'background-color 0.3s'
                    }}
                >
                  <TableCell><strong>{row.rol}</strong></TableCell>
                  <TableCell>{row.nombre_completo}</TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">
                        <span style={{color: 'green'}}>{row.votos_si}</span> 
                        {' - '} 
                        <span style={{color: 'red'}}>{row.votos_no}</span>
                    </Typography>
                    <LinearProgress 
                        variant="determinate" 
                        value={(row.total_votos / TOTAL_JUECES) * 100} 
                        sx={{ mt: 1, height: 6, borderRadius: 5 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                     {row.votos_si >= MAYORIA_NECESARIA ? (
                         <Chip label="APROBADA" color="success" size="small" />
                     ) : row.votos_no >= MAYORIA_NECESARIA ? (
                         <Chip label="RECHAZADA" color="error" size="small" />
                     ) : (
                         <Chip label="VOTANDO..." color="info" size="small" variant="outlined" />
                     )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary">
                        <ZoomInIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedData.length === 0 && !loading && (
                <TableRow><TableCell colSpan={5} align="center">No hay datos en esta unidad</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- MODAL GIGANTE --- */}
      <Dialog 
        open={openDetail} 
        onClose={handleCloseDetail} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
            sx: { 
                minHeight: '80vh', 
                borderRadius: 4,
                borderTop: `15px solid ${statusDisplay?.color || 'transparent'}`
            }
        }}
      >
        {selectedItem && (
            <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'absolute', right: 20, top: 20, zIndex: 10 }}>
                    <IconButton onClick={handleCloseDetail} size="large">
                        <CloseIcon fontSize="large" />
                    </IconButton>
                </Box>

                <Grid container sx={{ flex: 1 }}>
                    <Grid item xs={12} md={4} sx={{ p: 5, backgroundColor: '#f8f9fa', borderRight: '1px solid #ddd' }}>
                        <Typography variant="overline" display="block" gutterBottom sx={{ fontSize: '1.2rem', color: '#666' }}>
                            Rol de la Causa
                        </Typography>
                        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#081f34' }}>
                            {selectedItem.rol}
                        </Typography>
                        
                        <Box sx={{ my: 5 }} />

                        <Typography variant="overline" display="block" gutterBottom sx={{ fontSize: '1.2rem', color: '#666' }}>
                            Postulante
                        </Typography>
                        <Typography variant="h3" sx={{ color: '#081f34', lineHeight: 1.2 }}>
                            {selectedItem.nombre_completo}
                        </Typography>

                        <Box sx={{ mt: 10 }}>
                            <Typography variant="h6">Jueces que han votado:</Typography>
                            <ul>
                                {selectedItem.jueces_votaron.map((juez, idx) => (
                                    <li key={idx}><Typography variant="body1">{juez}</Typography></li>
                                ))}
                            </ul>
                            {selectedItem.total_votos === 0 && <Typography variant="body1" color="textSecondary">Esperando primer voto...</Typography>}
                        </Box>
                    </Grid>

                    {/* COLUMNA DERECHA */}
                    <Grid item xs={12} md={8} sx={{ 
                        p: 5, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        backgroundColor: statusDisplay?.bg || '#fff',
                        textAlign: 'center'
                    }}>
                        <Box sx={{ mb: 4 }}>
                            {statusDisplay?.icono}
                        </Box>
                        
                        <Typography variant="h1" sx={{ fontWeight: '900', color: statusDisplay?.color, letterSpacing: 2 }}>
                            {statusDisplay?.texto}
                        </Typography>
                        
                        
                        {/* TABLERO DE PUNTAJE */}
                        <Box sx={{ mt: 8, display: 'flex', gap: 10 }}>
                            <Card elevation={4} sx={{ minWidth: 200, borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" color="success.main">A FAVOR (SÍ)</Typography>
                                    <Typography variant="h2" fontWeight="bold">{selectedItem.votos_si}</Typography>
                                </CardContent>
                            </Card>
                            
                            <Card elevation={4} sx={{ minWidth: 200, borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" color="error.main">EN CONTRA (NO)</Typography>
                                    <Typography variant="h2" fontWeight="bold">{selectedItem.votos_no}</Typography>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{ mt: 5 }}>
                             <Chip 
                                label={selectedItem.total_votos === 5 && (selectedItem.votos_si === 5 || selectedItem.votos_no === 5) ? "DECISIÓN UNÁNIME" : `${selectedItem.total_votos} de ${TOTAL_JUECES} Votos Emitidos`}
                                sx={{ fontSize: '1.2rem', p: 2 }}
                             />
                        </Box>

                    </Grid>
                </Grid>
            </DialogContent>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminVotacionPage;