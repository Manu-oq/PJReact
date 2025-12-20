import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Grid, Card, CardActionArea, 
  CircularProgress, Alert
} from "@mui/material";
import DomainIcon from '@mui/icons-material/Domain';

import { getUnidades, getFundamentos } from "../../Services/LibertadCondicionalService";

const ComisionLibertadPage = () => {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const initLoad = async () => {
        setLoading(true);
        try {
            const [dataUnidades] = await Promise.all([
                getUnidades(),
                getFundamentos()
            ]);
            setUnidades(dataUnidades);
        } catch (err) {
            setErrorMsg("Error cargando unidades penales.");
        } finally {
            setLoading(false);
        }
    };
    initLoad();
  }, []);

  const handleUnidadSelect = (unidadId) => {
    navigate(`/comision-libertad-condicional/unidad/${unidadId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '80vh' }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
            <Typography variant="h4" color="primary" fontWeight="bold">
                Selección de Unidad Penal
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
                Seleccione el establecimiento para gestionar las votaciones.
            </Typography>
        </Box>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
      
      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
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
                            onClick={() => handleUnidadSelect(unidad.id)}
                            sx={{ height: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <DomainIcon sx={{ fontSize: 60, color: '#081f34', mb: 2 }} />
                            <Typography variant="h6" align="center" fontWeight="bold">
                                {unidad.nombre}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" mt={1}>
                                Ingresar a Votación
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

export default ComisionLibertadPage;