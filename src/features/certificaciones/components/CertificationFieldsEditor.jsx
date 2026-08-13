import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const uppercaseTokens = new Set(["rit", "ruc", "rol", "run"]);

const formatFieldKey = (key) =>
  String(key || "")
    .split("_")
    .filter(Boolean)
    .map((token) => {
      const normalizedToken = token.trim();

      if (!normalizedToken) {
        return "";
      }

      if (uppercaseTokens.has(normalizedToken.toLowerCase())) {
        return normalizedToken.toUpperCase();
      }

      return normalizedToken.charAt(0).toUpperCase() + normalizedToken.slice(1).toLowerCase();
    })
    .join(" ");

const buildEditableFields = ({ selectedCase, selectedExtraction }) => {
  const fieldLabels = {
    ...(selectedCase?.field_labels || {}),
    ...(selectedExtraction?.field_labels || {}),
  };

  const fieldKeys = new Set([
    ...Object.keys(selectedCase?.resolved_fields || {}),
    ...Object.keys(selectedExtraction?.resolved_fields || {}),
    ...Object.keys(selectedExtraction?.missing_fields || {}),
    ...Object.keys(selectedExtraction?.manual_overrides || {}),
    ...(selectedCase?.required_fields || []),
  ]);

  return Array.from(fieldKeys).map((key) => ({
    key,
    label: fieldLabels[key] || formatFieldKey(key),
    value:
      selectedExtraction?.manual_overrides?.[key] ??
      selectedExtraction?.resolved_fields?.[key] ??
      selectedCase?.resolved_fields?.[key] ??
      "",
    missing: Object.prototype.hasOwnProperty.call(selectedExtraction?.missing_fields || {}, key),
  }));
};

export const CertificationFieldsEditor = ({
  selectedCase = null,
  selectedExtraction = null,
  saving = false,
  showHeader = true,
  onSave,
}) => {
  const editableFields = useMemo(
    () => buildEditableFields({ selectedCase, selectedExtraction }),
    [selectedCase, selectedExtraction]
  );
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    setFormValues(
      Object.fromEntries(editableFields.map((field) => [field.key, field.value ?? ""]))
    );
  }, [editableFields]);

  if (editableFields.length === 0) {
    return null;
  }

  const handleChange = (fieldKey) => (event) => {
    const nextValue = event.target.value;

    setFormValues((previous) => ({
      ...previous,
      [fieldKey]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(
      Object.entries(formValues).map(([key, value]) => [key, value.trim() === "" ? null : value.trim()])
    );

    await onSave(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {showHeader ? (
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Corrección básica de campos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajuste manualmente los valores detectados y guarde los overrides mínimos del caso.
            </Typography>
          </Box>
        ) : null}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              lg: "repeat(2, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, md: 2 },
            width: "100%",
            px: { xs: 0.5, sm: 0 },
            alignItems: "start",
          }}
        >
          {editableFields.map((field) => (
            <Box key={field.key} sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                label={field.label}
                value={formValues[field.key] ?? ""}
                onChange={handleChange(field.key)}
                color={field.missing ? "warning" : "primary"}
                helperText={field.missing ? "Campo actualmente faltante." : " "}
                size="small"
                sx={{
                  width: "100%",
                  "& .MuiFormHelperText-root": {
                    mx: 0,
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent={{ xs: "stretch", sm: "flex-end" }}>
          <Button type="submit" variant="outlined" startIcon={<SaveIcon />} disabled={saving} sx={{ width: { xs: "100%", sm: "auto" } }}>
            {saving ? "Guardando..." : "Guardar correcciones"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

CertificationFieldsEditor.propTypes = {
  selectedCase: PropTypes.object,
  selectedExtraction: PropTypes.object,
  saving: PropTypes.bool,
  showHeader: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
};
