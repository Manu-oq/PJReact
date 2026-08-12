import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
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
            primary={key}
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

const getVisibleResolvedFields = (selectedCase, selectedExtraction) => {
  const fieldLabels = buildFieldLabelMap(selectedCase, selectedExtraction);
  const source = selectedExtraction?.resolved_fields || selectedCase?.resolved_fields || {};

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [fieldLabels[key] || key, value])
  );
};

const getVisibleMissingFields = (selectedCase, selectedExtraction) => {
  const fieldLabels = buildFieldLabelMap(selectedCase, selectedExtraction);
  const source = selectedExtraction?.missing_fields || selectedCase?.missing_fields || {};

  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [fieldLabels[key] || key, value])
  );
};

export const CertificationDetailPanel = ({
  selectedCase = null,
  selectedExtraction = null,
  loading = false,
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

  const visibleResolvedFields = getVisibleResolvedFields(selectedCase, selectedExtraction);
  const visibleMissingFields = getVisibleMissingFields(selectedCase, selectedExtraction);
  const files = selectedExtraction?.files?.length ? selectedExtraction.files : selectedCase.files;
  const warnings = selectedExtraction?.warnings?.length ? selectedExtraction.warnings : selectedCase.warnings;
  const validationErrors =
    Object.keys(selectedCase.validation_errors || {}).length > 0
      ? selectedCase.validation_errors
      : selectedExtraction?.validation_errors || {};
  const preview = selectedExtraction?.document_preview || selectedCase.document_preview || "";
  const actionsDisabled = loading || savingOverrides;

  return (
    <Stack spacing={2}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.5}>
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} flexWrap="wrap">
              <Box>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  Caso #{selectedCase.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCase.type?.name || "Tipo no disponible"}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={selectedCase.status || "sin estado"} color="primary" variant="outlined" />
                <Chip label={selectedCase.has_document ? "Documento disponible" : "Sin documento"} color={selectedCase.has_document ? "success" : "default"} size="small" />
              </Stack>
            </Box>

            <Box display="flex" gap={1.5} flexWrap="wrap">
              <Button variant="contained" startIcon={<RuleIcon />} onClick={onValidate} disabled={actionsDisabled || validating || generating || downloading}>
                {validating ? "Validando..." : "Validar"}
              </Button>
              <Button variant="contained" color="secondary" startIcon={<TaskAltIcon />} onClick={onGenerate} disabled={actionsDisabled || generating || validating || downloading}>
                {generating ? "Generando..." : "Generar Word"}
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownload} disabled={actionsDisabled || !selectedCase.has_document || downloading}>
                {downloading ? "Descargando..." : "Descargar Word"}
              </Button>
            </Box>

            {!selectedCase.has_document ? (
              <Typography variant="caption" color="text.secondary">
                La descarga se habilita cuando el backend haya generado el documento final del caso.
              </Typography>
            ) : null}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight="bold">
                        Resumen del caso
                      </Typography>
                      <Typography variant="body2"><strong>Título:</strong> {selectedCase.title || "Sin título"}</Typography>
                      <Typography variant="body2"><strong>Progreso:</strong> {selectedCase.progress ?? 0}%</Typography>
                      <Typography variant="body2"><strong>Procesado:</strong> {selectedCase.processed_at || "No disponible"}</Typography>
                      <Typography variant="body2"><strong>Validado:</strong> {selectedCase.validated_at || "No disponible"}</Typography>
                      <Typography variant="body2"><strong>Generado:</strong> {selectedCase.generated_at || "No disponible"}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DescriptionIcon color="primary" fontSize="small" />
                        <Typography variant="h6" fontWeight="bold">
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
                            <ListItem key={`${file.id}-${file.original_name}`} disableGutters sx={{ py: 0.5 }}>
                              <ListItemText
                                primary={file.original_name || `Archivo ${file.id}`}
                                secondary={`${file.document_type} · ${file.extraction_status}${file.extraction_method ? ` · ${file.extraction_method}` : ""}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {Object.keys(visibleMissingFields).length > 0 ? (
              <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Campos faltantes
                </Typography>
                {renderRecordEntries(visibleMissingFields)}
              </Alert>
            ) : null}

            {warnings.length > 0 ? (
              <Alert severity="warning">
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Warnings del backend
                </Typography>
                <List dense disablePadding>
                  {warnings.map((warning) => (
                    <ListItem key={warning} disableGutters sx={{ py: 0.25 }}>
                      <ListItemText primary={warning} />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            ) : null}

            {Object.keys(validationErrors).length > 0 ? (
              <Alert severity="error">
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Errores de validación
                </Typography>
                {renderRecordEntries(validationErrors)}
              </Alert>
            ) : null}

            <Divider />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      Campos resueltos
                    </Typography>
                    {renderRecordEntries(visibleResolvedFields)}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                      Evidencia / extracción
                    </Typography>
                    {renderRecordEntries(selectedExtraction?.evidence || {}, "Sin evidencia detallada disponible.")}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider />

            <CertificationFieldsEditor
              selectedCase={selectedCase}
              selectedExtraction={selectedExtraction}
              saving={savingOverrides}
              onSave={onSaveOverrides}
            />

            <Divider />

            <Card variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                  <TextSnippetIcon color="primary" fontSize="small" />
                  <Typography variant="h6" fontWeight="bold">
                    Preview del documento
                  </Typography>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(8,31,52,0.04)",
                    border: "1px solid rgba(8,31,52,0.08)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontFamily: '"Roboto Mono", monospace',
                    fontSize: "0.9rem",
                    lineHeight: 1.55,
                    minHeight: 180,
                    maxHeight: 460,
                    overflow: "auto",
                  }}
                >
                  {preview || "Todavía no hay preview disponible para este caso."}
                </Box>
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
  validating: PropTypes.bool,
  generating: PropTypes.bool,
  downloading: PropTypes.bool,
  savingOverrides: PropTypes.bool,
  onValidate: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onSaveOverrides: PropTypes.func.isRequired,
};
