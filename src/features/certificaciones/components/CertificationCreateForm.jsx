import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const initialFormState = {
  type_code: "",
  title: "",
  primera_instancia: null,
  segunda_instancia: null,
};

export const CertificationCreateForm = ({ types, creating = false, onSubmit }) => {
  const [formValues, setFormValues] = useState(initialFormState);
  const [localError, setLocalError] = useState("");

  const selectedType = useMemo(
    () => types.find((item) => item.code === formValues.type_code) || null,
    [formValues.type_code, types]
  );

  const handleChange = (field) => (event) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleFileChange = (field) => (event) => {
    const file = event.target.files?.[0] || null;

    setFormValues((previous) => ({
      ...previous,
      [field]: file,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!formValues.type_code) {
      setLocalError("Debe seleccionar un tipo de documento.");
      return;
    }

    if (!formValues.primera_instancia && !formValues.segunda_instancia) {
      setLocalError("Debe adjuntar al menos un archivo PDF.");
      return;
    }

    try {
      await onSubmit({
        type_code: formValues.type_code,
        title: formValues.title.trim() || null,
        primera_instancia: formValues.primera_instancia,
        segunda_instancia: formValues.segunda_instancia,
      });

      setFormValues(initialFormState);
    } catch {
      // El feedback de error se centraliza en el hook.
    }
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              Nuevo caso
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cree un caso de certificación o resumen y adjunte uno o dos documentos PDF para procesarlo.
            </Typography>
          </Box>

          {types.length === 0 ? (
            <Alert severity="info">
              No hay tipos de certificación disponibles en este momento. Reintente la carga o verifique su acceso.
            </Alert>
          ) : null}

          {localError ? <Alert severity="warning">{localError}</Alert> : null}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Tipo de documento"
                value={formValues.type_code}
                onChange={handleChange("type_code")}
                SelectProps={{ native: true }}
                disabled={creating}
                inputProps={{ "aria-label": "Tipo de documento" }}
              >
                <option value="">Seleccione un tipo</option>
                {types.map((type) => (
                  <option key={type.code} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título opcional"
                value={formValues.title}
                onChange={handleChange("title")}
                disabled={creating}
                inputProps={{ maxLength: 255 }}
              />
            </Grid>

            <Grid item xs={12}>
              {selectedType ? (
                <Alert severity="info" sx={{ alignItems: "flex-start" }}>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedType.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedType.description || "Sin descripción adicional."}
                  </Typography>
                  {selectedType.required_documents.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                      {selectedType.required_documents.map((item) => (
                        <Chip key={item} size="small" color="primary" variant="outlined" label={item} />
                      ))}
                    </Stack>
                  ) : null}
                </Alert>
              ) : null}
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                disabled={creating}
                sx={{ minHeight: 56, justifyContent: "flex-start" }}
              >
                {formValues.primera_instancia ? "Primera instancia cargada" : "Adjuntar primera instancia (PDF)"}
                <input
                  hidden
                  type="file"
                  accept="application/pdf,.pdf"
                  aria-label="Primera instancia PDF"
                  onChange={handleFileChange("primera_instancia")}
                />
              </Button>
              {formValues.primera_instancia ? (
                <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
                  {formValues.primera_instancia.name}
                </Typography>
              ) : null}
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                disabled={creating}
                sx={{ minHeight: 56, justifyContent: "flex-start" }}
              >
                {formValues.segunda_instancia ? "Segunda instancia cargada" : "Adjuntar segunda instancia (PDF)"}
                <input
                  hidden
                  type="file"
                  accept="application/pdf,.pdf"
                  aria-label="Segunda instancia PDF"
                  onChange={handleFileChange("segunda_instancia")}
                />
              </Button>
              {formValues.segunda_instancia ? (
                <Typography variant="caption" display="block" sx={{ mt: 0.75 }}>
                  {formValues.segunda_instancia.name}
                </Typography>
              ) : null}
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" disabled={creating || types.length === 0}>
              {creating ? "Creando..." : "Crear caso"}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

CertificationCreateForm.propTypes = {
  types: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      required_documents: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  creating: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};
