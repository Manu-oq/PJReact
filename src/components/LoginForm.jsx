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
import { getCsrfCookie, loginAPI } from "../Services/AuthService";
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
    setErrorMessage(""); 

    try {

      await getCsrfCookie();

      const data = await loginAPI(values);

      if (data.token) {
        login(
          data.token,
          data.user.name,
          data.user.roles,
          data.user.permissions
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Error en el proceso de login:", error);

      if (error.response) {
        if (error.response.status === 419) {
             setErrorMessage("La sesión ha expirado (Error 419). Por favor recarga la página.");
        } else if (error.response.status === 401 || error.response.status === 422) {
             setErrorMessage(error.response.data.message || "Credenciales incorrectas");
        } else {
             setErrorMessage("Error en el servidor. Intente más tarde.");
        }
      } else {
        setErrorMessage("Error de conexión. Verifique su internet.");
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
          initialValues={{ name: "", password: "" }} 
          validate={validateForm}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1, sm: 2, md: 3 } }}>
                
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