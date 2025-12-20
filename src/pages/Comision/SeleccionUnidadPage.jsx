import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Grid, Card, CardActionArea, 
  CircularProgress, Box, Alert
} from "@mui/material";
import DomainIcon from '@mui/icons-material/Domain';
import { getUnidades } from "../../Services/LibertadCondicionalService";

const SeleccionUnidadPage = () => {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const data = await getUnidades();
        setUnidades(data);
      } catch (error) {
        setErrorMsg("Error al cargar unidades penales.");
      } finally {
        setLoading(false);
      }
    };
    fetchUnidades();
  }, []);

  const handleSelect = (id) => {
    // Navegamos a la página de votación específica
    navigate(`/comision-libertad-condicional/unidad/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Selección de Unidad Penal
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" mb={4}>
        Seleccione el establecimiento para gestionar las votaciones.
      </Typography>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {unidades.map((unidad) => (
            <Grid item xs={12} sm={6} md={4} key={unidad.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s', 
                  '&:hover': { transform: 'scale(1.03)', boxShadow: 6 } 
                }}
              >
                <CardActionArea 
                  onClick={() => handleSelect(unidad.id)}
                  sx={{ 
                    height: '100%', p: 3, 
                    display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'center' 
                  }}
                >
                  <DomainIcon sx={{ fontSize: 60, color: '#081f34', mb: 2 }} />
                  <Typography variant="h6" align="center" fontWeight="bold">
                    {unidad.nombre}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SeleccionUnidadPage;