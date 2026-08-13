import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import RuleIcon from "@mui/icons-material/Rule";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { EmptyState, PageLoader } from "../../../components/feedback/PageState";
import { CertificationFieldsEditor } from "./CertificationFieldsEditor";

const documentTypeLabels = {
  primera_instancia: "Primera instancia",
  segunda_instancia: "Segunda instancia",
};

const uppercaseTokens = new Set(["rit", "ruc", "rol", "run"]);

const formatFieldLabel = (value) =>
  String(value || "")
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

const renderRecordEntries = (record = {}, emptyText = "Sin información registrada.") => {
  const entries = Object.entries(record || {});

  if (entries.length === 0) {
    return <Typography variant="body2" color="text.secondary">{emptyText}</Typography>;
  }

  return (
    <List dense disablePadding>
      {entries.map(([key, value]) => (
        <ListItem key={key} disableGutters sx={{ py: 0.5 }}>
          <ListItemText
            primary={formatFieldLabel(key)}
            secondary={
              value && typeof value === "object"
                ? JSON.stringify(value, null, 2)
                : value ?? "Sin valor"
            }
            primaryTypographyProps={{ variant: "subtitle2" }}
            secondaryTypographyProps={{ sx: { whiteSpace: "pre-wrap", wordBreak: "break-word" } }}
          />
        </ListItem>
      ))}
    </List>
  );
};

const buildFieldLabelMap = (selectedCase, selectedExtraction) => ({
  ...(selectedCase?.field_labels || {}),
  ...(selectedExtraction?.field_labels || {}),
});

const getVisibleMissingFields = (selectedCase, selectedExtraction) => {
  const fieldLabels = buildFieldLabelMap(selectedCase, selectedExtraction);
  const source = selectedExtraction?.missing_fields || selectedCase?.missing_fields || {};

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [fieldLabels[key] || formatFieldLabel(key), value])
  );
};

const getDocumentTypeLabel = (documentType) =>
  documentTypeLabels[documentType] || documentType || "Documento";

export const CertificationDetailPanel = ({
  selectedCase = null,
  selectedExtraction = null,
  loading = false,
  casePendingValidation = false,
  validating = false,
  generating = false,
  downloading = false,
  savingOverrides = false,
  onValidate,
  onGenerate,
  onDownload,
  onSaveOverrides,
}) => {
  if (loading && !selectedCase) {
    return <PageLoader minHeight={260} message="Cargando detalle del caso..." />;
  }

  if (!selectedCase) {
    return <EmptyState message="Seleccione un caso para ver su detalle, validaciones y preview." minHeight={260} />;
  }

  const visibleMissingFields = getVisibleMissingFields(selectedCase, selectedExtraction);
  const files = selectedExtraction?.files?.length ? selectedExtraction.files : selectedCase.files;
  const validationErrors =
    Object.keys(selectedCase.validation_errors || {}).length > 0
      ? selectedCase.validation_errors
      : selectedExtraction?.validation_errors || {};
  const preview = selectedExtraction?.document_preview || selectedCase.document_preview || "";
  const progressValue = Number(selectedCase.progress) || 0;
  const actionsDisabled = loading || savingOverrides || casePendingValidation;

  return (
    <Stack spacing={2}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={3}>
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                border: "1px solid rgba(8,31,52,0.08)",
                background:
                  "linear-gradient(135deg, rgba(8,31,52,0.05) 0%, rgba(8,31,52,0.01) 100%)",
              }}
            >
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} flexWrap="wrap">
                  <Stack spacing={0.5}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                      Detalle del documento
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold">
                      {selectedCase.type?.name || "Tipo no disponible"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revise los datos del caso antes de validar, generar o descargar el documento final.
                    </Typography>
                  </Stack>

                  <Chip
                    label={selectedCase.has_document ? "Documento disponible" : "Sin documento"}
                    color={selectedCase.has_document ? "success" : "default"}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" },
                    gap: 1.25,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<RuleIcon />}
                    onClick={onValidate}
                    disabled={actionsDisabled || validating || generating || downloading}
                    sx={{ minHeight: 44 }}
                  >
                    {validating ? "Validando..." : "Validar"}
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<TaskAltIcon />}
                    onClick={onGenerate}
                    disabled={actionsDisabled || generating || validating || downloading}
                    sx={{ minHeight: 44 }}
                  >
                    {generating ? "Generando..." : "Generar Word"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={onDownload}
                    disabled={actionsDisabled || !selectedCase.has_document || downloading}
                    sx={{ minHeight: 44 }}
                  >
                    {downloading ? "Descargando..." : "Descargar Word"}
                  </Button>
                </Box>
              </Stack>
            </Box>

            {!selectedCase.has_document || casePendingValidation ? (
              <Stack spacing={1}>
                {!selectedCase.has_document ? (
                  <Typography variant="caption" color="text.secondary">
                    La descarga se habilita cuando se haya generado el documento final del caso.
                  </Typography>
                ) : null}

                {casePendingValidation ? (
                  <Typography variant="caption" color="text.secondary">
                    El caso todavía se está procesando. La validación se habilitará cuando termine la extracción inicial.
                  </Typography>
                ) : null}
              </Stack>
            ) : null}

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5} flexWrap="wrap">
                    <Typography variant="h6" fontWeight="bold">
                      Resumen del caso
                    </Typography>

                    <Chip
                      label={`${progressValue}% completado`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Stack spacing={1.25}>
                    <Typography variant="body2">
                      <strong>Título:</strong> {selectedCase.title || "Sin título"}
                    </Typography>

                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso del caso
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {progressValue}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        sx={{ height: 8, borderRadius: 999 }}
                      />
                    </Box>
                  </Stack>

                  <Box>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                      <DescriptionIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Archivos asociados
                      </Typography>
                    </Box>

                    {files.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No hay archivos asociados.
                      </Typography>
                    ) : (
                      <List dense disablePadding>
                        {files.map((file) => (
                          <ListItem
                            key={`${file.id}-${file.original_name}`}
                            disableGutters
                            sx={{
                              py: 0.6,
                              px: 1,
                              borderRadius: 2,
                              "&:not(:last-child)": { mb: 0.5 },
                              backgroundColor: "rgba(8,31,52,0.025)",
                            }}
                          >
                            <ListItemText
                              primary={file.original_name || `Archivo ${file.id}`}
                              secondary={getDocumentTypeLabel(file.document_type)}
                              primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {Object.keys(visibleMissingFields).length > 0 ? (
              <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ borderRadius: 2.5 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Campos faltantes
                </Typography>
                {renderRecordEntries(visibleMissingFields)}
              </Alert>
            ) : null}

            {Object.keys(validationErrors).length > 0 ? (
              <Alert severity="error" sx={{ borderRadius: 2.5 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Errores de validación
                </Typography>
                {renderRecordEntries(validationErrors)}
              </Alert>
            ) : null}

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={1.75}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Campos del caso
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revise y edite los valores detectados antes de guardar las correcciones.
                    </Typography>
                  </Box>

                  <CertificationFieldsEditor
                    selectedCase={selectedCase}
                    selectedExtraction={selectedExtraction}
                    saving={savingOverrides}
                    showHeader={false}
                    onSave={onSaveOverrides}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextSnippetIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight="bold">
                      Preview del documento
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Vista previa del contenido que se usará para generar el documento final.
                  </Typography>

                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: { xs: 1.5, md: 2 },
                      borderRadius: 2.5,
                      backgroundColor: "rgba(8,31,52,0.03)",
                      border: "1px solid rgba(8,31,52,0.08)",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      fontFamily: '"Roboto Mono", monospace',
                      fontSize: { xs: "0.8rem", md: "0.88rem" },
                      lineHeight: 1.6,
                      minHeight: 160,
                      maxHeight: 320,
                      overflow: "auto",
                    }}
                  >
                    {preview || "Todavía no hay preview disponible para este caso."}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

CertificationDetailPanel.propTypes = {
  selectedCase: PropTypes.object,
  selectedExtraction: PropTypes.object,
  loading: PropTypes.bool,
  casePendingValidation: PropTypes.bool,
  validating: PropTypes.bool,
  generating: PropTypes.bool,
  downloading: PropTypes.bool,
  savingOverrides: PropTypes.bool,
  onValidate: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onSaveOverrides: PropTypes.func.isRequired,
};
