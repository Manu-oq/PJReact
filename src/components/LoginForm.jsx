import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

import axios from "axios";
import { useUser } from "../components/context/UserContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [errorMessage, setErrorMessage] = useState("");


  const validateForm = (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = "El nombre de usuario es requerido";
    }
    if (!values.password) {
      errors.password = "La contraseña es requerida";
    }
    return errors;
  };

  const handleSubmit = async (values, actions) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const csrfUrl = "http://localhost:8000/sanctum/csrf-cookie"; 
      
      await axios.get(csrfUrl, { withCredentials: true });

      // 2. Realizar el login
      const loginUrl = `${API_BASE_URL}/login`; 
      
      const response = await axios.post(loginUrl, values, {
        withCredentials: true, 
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.token) {
        login(
          response.data.token,
          response.data.user.name,
          response.data.user.roles,
          response.data.user.permissions
        );

        // Configurar el token para futuras peticiones
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;

        navigate("/");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      if (error.response) {
        if (error.response.status === 419) {
             setErrorMessage("Error de seguridad (419). La página ha expirado, recárgala.");
        } else {
             setErrorMessage(error.response.data.message || "Credenciales incorrectas");
        }
      } else {
        setErrorMessage("Error de conexión con el servidor");
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            mb: { xs: 2, sm: 3, md: 4 },
          }}
        >
          Iniciar Sesión
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage("")}
            sx={{ mb: { xs: 1, sm: 2, md: 3 } }}
          >
            {errorMessage}
          </Alert>
        )}

        <Formik
          initialValues={{ name: "", password: "" }} // Esto está bien
          validate={validateForm}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 2, md: 3 } }}>
                
                {/* CORRECCIÓN 2: El input debe tener name="name" para coincidir con initialValues y Backend */}
                <Field
                  as={TextField}
                  name="name" 
                  label="Nombre de usuario" 
                  variant="outlined"
                  fullWidth
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  sx={{ mb: { xs: 1, sm: 2 } }}
                />

                <Field
                  as={TextField}
                  name="password"
                  type="password"
                  label="Contraseña"
                  variant="outlined"
                  fullWidth
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{ mb: { xs: 1, sm: 2 } }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  sx={{
                    mt: { xs: 1, sm: 2, md: 3 },
                    py: { xs: 1, sm: 1.5, md: 2 },
                  }}
                >
                  {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default LoginForm;