import { Alert, Box, Button, Container, Snackbar, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { CertificationCasesList } from "../features/certificaciones/components/CertificationCasesList";
import { CertificationDetailPanel } from "../features/certificaciones/components/CertificationDetailPanel";
import { useCertificaciones } from "../features/certificaciones/hooks/useCertificaciones";
import { PageErrorState, PageLoader } from "../components/feedback/PageState";
import { CERTIFICACIONES_ROUTE } from "../features/certificaciones/utils/constants";

const CertificacionesCasesPage = () => {
  const navigate = useNavigate();
  const {
    cases,
    selectedCaseId,
    selectedCase,
    selectedExtraction,
    loadingInitial,
    loadingCases,
    loadingDetail,
    casePendingValidation,
    savingOverrides,
    validatingCase,
    generatingDocument,
    downloadingDocument,
    pageError,
    feedback,
    closeFeedback,
    reloadPage,
    selectCase,
    saveOverrides,
    validateCase,
    generateDocument,
    downloadDocument,
  } = useCertificaciones({ autoSelectFirstCase: false });

  if (loadingInitial) {
    return (
      <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, minHeight: "80vh" }}>
        <PageLoader message="Cargando casos recientes..." minHeight={320} />
      </Container>
    );
  }

  if (pageError) {
    return (
      <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, minHeight: "80vh" }}>
        <PageErrorState message={pageError} onRetry={reloadPage} minHeight={320} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, minHeight: "80vh" }}>
      <Snackbar
        open={Boolean(feedback.message)}
        autoHideDuration={4500}
        onClose={closeFeedback}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeFeedback} severity={feedback.type} sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>

      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} gap={2} flexWrap="wrap">
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Casos recientes
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(CERTIFICACIONES_ROUTE)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Volver a nuevo caso
          </Button>
        </Box>

        {!selectedCaseId ? (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Seleccione un caso del histórico para revisar su detalle y continuar con las acciones disponibles.
            </Typography>

            <CertificationCasesList
              cases={cases}
              selectedCaseId={selectedCaseId}
              loading={loadingCases}
              onSelectCase={selectCase}
            />
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Box display="flex" justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} gap={2} flexWrap="wrap">
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                Detalle del caso
              </Typography>

              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => selectCase(null)}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Volver a la lista
              </Button>
            </Box>

            <CertificationDetailPanel
              selectedCase={selectedCase}
              selectedExtraction={selectedExtraction}
              loading={loadingDetail}
              casePendingValidation={casePendingValidation}
              validating={validatingCase}
              generating={generatingDocument}
              downloading={downloadingDocument}
              savingOverrides={savingOverrides}
              onValidate={validateCase}
              onGenerate={generateDocument}
              onDownload={downloadDocument}
              onSaveOverrides={saveOverrides}
            />
          </Stack>
        )}
      </Stack>
    </Container>
  );
};

export default CertificacionesCasesPage;
