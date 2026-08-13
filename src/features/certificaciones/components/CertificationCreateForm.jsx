import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  CERTIFICATION_MAX_UPLOAD_SIZE_BYTES,
  CERTIFICATION_UPLOAD_FIELDS,
  CERTIFICATION_UPLOAD_REFERENCE_FIELDS,
} from "../contracts";

const createInitialUploadState = () => ({
  file: null,
  uploadId: "",
  uploadedName: "",
  status: "idle",
  error: "",
});

const createInitialFormState = () => ({
  certification_type_id: "",
  title: "",
  primera_instancia: createInitialUploadState(),
  segunda_instancia: createInitialUploadState(),
});

const fieldLabels = {
  [CERTIFICATION_UPLOAD_FIELDS.PRIMERA_INSTANCIA]: "eBook primera instancia",
  [CERTIFICATION_UPLOAD_FIELDS.SEGUNDA_INSTANCIA]: "eBook segunda instancia",
};

const maxUploadSizeMb = Math.round(CERTIFICATION_MAX_UPLOAD_SIZE_BYTES / (1024 * 1024));

const isPdfFile = (file) => {
  if (!file) {
    return false;
  }

  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
};

const getUploadButtonLabel = (fieldState, field) => {
  const label = fieldLabels[field];

  if (fieldState.status === "uploading") {
    return `Subiendo ${label}`;
  }

  if (fieldState.status === "uploaded") {
    return `${label} cargado`;
  }

  if (fieldState.status === "error") {
    return `Reintentar ${label}`;
  }

  return `Adjuntar ${label}`;
};

const getUploadStatusColor = (fieldState) => {
  if (fieldState.error) {
    return "error.main";
  }

  if (fieldState.status === "uploaded") {
    return "success.main";
  }

  return "text.secondary";
};

const getUploadStatusMessage = (fieldState) => {
  if (fieldState.error) {
    return fieldState.error;
  }

  if (fieldState.status === "uploading") {
    return "Subiendo archivo al servidor...";
  }

  if (fieldState.status === "uploaded") {
    return "Archivo cargado correctamente.";
  }

  return "";
};

export const CertificationCreateForm = ({
  types,
  creating = false,
  onUploadFile,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState(createInitialFormState);
  const [localError, setLocalError] = useState("");
  const uploadRequestIdsRef = useRef({
    [CERTIFICATION_UPLOAD_FIELDS.PRIMERA_INSTANCIA]: 0,
    [CERTIFICATION_UPLOAD_FIELDS.SEGUNDA_INSTANCIA]: 0,
  });

  const selectedType = useMemo(
    () => types.find((item) => String(item.id) === formValues.certification_type_id) || null,
    [formValues.certification_type_id, types]
  );
  const hasUploadedFiles =
    Boolean(formValues.primera_instancia.uploadId) ||
    Boolean(formValues.segunda_instancia.uploadId);
  const hasUploadingFiles =
    formValues.primera_instancia.status === "uploading" ||
    formValues.segunda_instancia.status === "uploading";
  const canSubmit =
    Boolean(formValues.certification_type_id) &&
    hasUploadedFiles &&
    !creating &&
    !hasUploadingFiles &&
    types.length > 0;

  const handleChange = (field) => (event) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleFileChange = (field) => async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file) {
      return;
    }

    setLocalError("");

    if (!isPdfFile(file)) {
      setFormValues((previous) => ({
        ...previous,
        [field]: {
          ...createInitialUploadState(),
          file,
          uploadedName: file.name,
          status: "error",
          error: "Solo se permiten archivos PDF.",
        },
      }));
      return;
    }

    if (file.size > CERTIFICATION_MAX_UPLOAD_SIZE_BYTES) {
      setFormValues((previous) => ({
        ...previous,
        [field]: {
          ...createInitialUploadState(),
          file,
          uploadedName: file.name,
          status: "error",
          error: `El archivo excede el máximo permitido de ${maxUploadSizeMb} MB.`,
        },
      }));
      return;
    }

    const currentRequestId = uploadRequestIdsRef.current[field] + 1;
    uploadRequestIdsRef.current[field] = currentRequestId;

    setFormValues((previous) => ({
      ...previous,
      [field]: {
        file,
        uploadId: "",
        uploadedName: file.name,
        status: "uploading",
        error: "",
      },
    }));

    try {
      const uploadedFile = await onUploadFile(field, file);

      if (uploadRequestIdsRef.current[field] !== currentRequestId) {
        return;
      }

      setFormValues((previous) => ({
        ...previous,
        [field]: {
          file,
          uploadId: uploadedFile.upload_id,
          uploadedName: uploadedFile.original_name || file.name,
          status: "uploaded",
          error: "",
        },
      }));
    } catch (error) {
      if (uploadRequestIdsRef.current[field] !== currentRequestId) {
        return;
      }

      const uploadMessage =
        error?.response?.data?.message ||
        error?.message ||
        "No se pudo subir el archivo seleccionado.";

      setFormValues((previous) => ({
        ...previous,
        [field]: {
          ...createInitialUploadState(),
          file,
          uploadedName: file.name,
          status: "error",
          error: uploadMessage,
        },
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!formValues.certification_type_id) {
      setLocalError("Debe seleccionar un tipo de documento.");
      return;
    }

    if (hasUploadingFiles) {
      setLocalError("Espere a que termine la carga de los eBooks antes de crear el caso.");
      return;
    }

    if (!hasUploadedFiles) {
      setLocalError("Debe adjuntar al menos un archivo PDF.");
      return;
    }

    try {
      await onSubmit({
        certification_type_id: selectedType?.id ?? Number(formValues.certification_type_id),
        title: formValues.title.trim() || null,
        [CERTIFICATION_UPLOAD_REFERENCE_FIELDS.PRIMERA_INSTANCIA]:
          formValues.primera_instancia.uploadId || null,
        [CERTIFICATION_UPLOAD_REFERENCE_FIELDS.SEGUNDA_INSTANCIA]:
          formValues.segunda_instancia.uploadId || null,
      });

      setFormValues(createInitialFormState());
    } catch {
      // El feedback de error se centraliza en el hook.
    }
  };

  const renderUploadField = (field) => {
    const fieldState = formValues[field];
    const statusMessage = getUploadStatusMessage(fieldState);

    return (
      <>
        <Button
          fullWidth
          component="label"
          variant="outlined"
          color={fieldState.status === "uploaded" ? "success" : "primary"}
          startIcon={
            fieldState.status === "uploaded" ? <CheckCircleOutlineIcon /> : <UploadFileIcon />
          }
          disabled={creating || fieldState.status === "uploading"}
          sx={{ minHeight: 56, justifyContent: "flex-start", textAlign: "left" }}
        >
          {getUploadButtonLabel(fieldState, field)}
          <input
            hidden
            type="file"
            accept="application/pdf,.pdf"
            aria-label={`${fieldLabels[field]} PDF`}
            onChange={handleFileChange(field)}
          />
        </Button>

        {fieldState.uploadedName ? (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
            {fieldState.status === "uploading" ? <CircularProgress size={14} /> : null}
            <Typography
              variant="caption"
              display="block"
              color={getUploadStatusColor(fieldState)}
              sx={{ wordBreak: "break-word" }}
            >
              {fieldState.uploadedName}
              {statusMessage ? ` · ${statusMessage}` : ""}
            </Typography>
          </Stack>
        ) : null}
      </>
    );
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              Nuevo caso
            </Typography>
          </Box>

          {localError ? (
            <Typography variant="body2" color="error.main">
              {localError}
            </Typography>
          ) : null}

          <Typography variant="body2" color="text.secondary">
            Cada eBook se sube apenas lo selecciona. Tamaño máximo por archivo: {maxUploadSizeMb} MB.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} lg={6}>
              <TextField
                select
                fullWidth
                label="Tipo de documento"
                value={formValues.certification_type_id}
                onChange={handleChange("certification_type_id")}
                disabled={creating || types.length === 0}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                inputProps={{ "aria-label": "Tipo de documento" }}
              >
                <option value="" aria-label="Sin selección" />
                {types.map((type) => (
                  <option key={type.id ?? type.code} value={String(type.id ?? "")}>
                    {type.name}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} lg={6}>
              <TextField
                fullWidth
                label="Título opcional"
                value={formValues.title}
                onChange={handleChange("title")}
                disabled={creating}
                inputProps={{ maxLength: 255 }}
              />
            </Grid>

            <Grid item xs={12} lg={6}>
              {renderUploadField(CERTIFICATION_UPLOAD_FIELDS.PRIMERA_INSTANCIA)}
            </Grid>

            <Grid item xs={12} lg={6}>
              {renderUploadField(CERTIFICATION_UPLOAD_FIELDS.SEGUNDA_INSTANCIA)}
            </Grid>
          </Grid>

          <Box display="flex" justifyContent={{ xs: "stretch", sm: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={!canSubmit} sx={{ width: { xs: "100%", sm: "auto" } }}>
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
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      required_documents: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  creating: PropTypes.bool,
  onUploadFile: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
