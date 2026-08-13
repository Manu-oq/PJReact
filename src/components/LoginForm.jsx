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
import Chip from "@mui/material/Chip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { getCsrfCookie, loginAPI } from "../Services/AuthService";
import { useUser } from "../components/context/UserContext";
import { getApiErrorMessage } from "../lib/apiClient";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "El correo electrónico es requerido";
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

      if (!data?.token || !data?.user) {
        setErrorMessage("La respuesta de autenticación no tiene el formato esperado.");
        return;
      }

      login(data.token, data.user);
      navigate("/", { replace: true });
    } catch (error) {
      if (error.response?.status === 419) {
        setErrorMessage("La sesión ha expirado. Por favor recarga la página.");
      } else if ([401, 422].includes(error.response?.status)) {
        setErrorMessage(error.response?.data?.message || "Credenciales incorrectas");
      } else if (error.response?.status === 429) {
        setErrorMessage("Demasiados intentos. Espere un momento antes de volver a intentarlo.");
      } else {
        setErrorMessage(getApiErrorMessage(error, "Error de conexión. Verifique su internet o intente más tarde."));
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100dvh - 140px)",
        py: { xs: 4, md: 6 },
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 980,
          overflow: "hidden",
          borderRadius: 5,
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" } }}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              background: "linear-gradient(180deg, rgba(8,31,52,0.98) 0%, rgba(17,63,106,0.96) 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: { xs: 200, md: "100%" },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  width: { xs: 72, sm: 88 },
                  height: { xs: 72, sm: 88 },
                  mx: "auto",
                  mb: 2,
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 38, color: "#fff" }} />
              </Box>
              <Chip label="Acceso institucional" sx={{ mb: 2, color: "#fff", backgroundColor: "rgba(255,255,255,0.12)" }} />
              <Typography variant="h4" sx={{ color: "#fff", fontSize: { xs: "1.65rem", sm: "2rem" } }}>
                Ingreso a la plataforma
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                mb: { xs: 2, sm: 3, md: 4 },
              }}
            >
              Iniciar sesión
            </Typography>

            {errorMessage ? (
              <Alert severity="error" onClose={() => setErrorMessage("")} sx={{ mb: { xs: 1, sm: 2, md: 3 } }}>
                {errorMessage}
              </Alert>
            ) : null}

            <Formik initialValues={{ email: "", password: "" }} validate={validateForm} onSubmit={handleSubmit}>
              {({ isSubmitting, errors, touched }) => (
                <Form>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2, md: 2.5 } }}>
                    <Field
                      as={TextField}
                      name="email"
                      type="email"
                      label="Correo electrónico"
                      variant="outlined"
                      fullWidth
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
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
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      fullWidth
                      size="large"
                      sx={{
                        mt: { xs: 1, sm: 2 },
                        py: 1.6,
                        alignSelf: "stretch",
                      }}
                    >
                      {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm;
