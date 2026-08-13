import { Alert, Box, Button, Container, Grid, Snackbar, Stack, Typography } from "@mui/material";
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
  } = useCertificaciones();

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

        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <CertificationCasesList
              cases={cases}
              selectedCaseId={selectedCaseId}
              loading={loadingCases}
              onSelectCase={selectCase}
            />
          </Grid>

          <Grid item xs={12} lg={8}>
            <CertificationDetailPanel
              selectedCase={selectedCase}
              selectedExtraction={selectedExtraction}
              loading={loadingDetail}
              validating={validatingCase}
              generating={generatingDocument}
              downloading={downloadingDocument}
              savingOverrides={savingOverrides}
              onValidate={validateCase}
              onGenerate={generateDocument}
              onDownload={downloadDocument}
              onSaveOverrides={saveOverrides}
            />
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};

export default CertificacionesCasesPage;
