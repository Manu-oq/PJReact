import { Alert, Box, Container, Grid, Snackbar, Stack, Typography } from "@mui/material";
import { CertificationCreateForm } from "../features/certificaciones/components/CertificationCreateForm";
import { CertificationCasesList } from "../features/certificaciones/components/CertificationCasesList";
import { CertificationDetailPanel } from "../features/certificaciones/components/CertificationDetailPanel";
import { useCertificaciones } from "../features/certificaciones/hooks/useCertificaciones";
import { PageErrorState, PageLoader } from "../components/feedback/PageState";

const CertificacionesPage = () => {
  const {
    types,
    cases,
    selectedCaseId,
    selectedCase,
    selectedExtraction,
    loadingInitial,
    loadingCases,
    loadingDetail,
    creatingCase,
    savingOverrides,
    validatingCase,
    generatingDocument,
    downloadingDocument,
    pageError,
    feedback,
    closeFeedback,
    reloadPage,
    selectCase,
    createCase,
    saveOverrides,
    validateCase,
    generateDocument,
    downloadDocument,
  } = useCertificaciones();

  if (loadingInitial) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, minHeight: "80vh" }}>
        <PageLoader message="Cargando módulo de certificaciones..." minHeight={320} />
      </Container>
    );
  }

  if (pageError) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, minHeight: "80vh" }}>
        <PageErrorState message={pageError} onRetry={reloadPage} minHeight={320} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, minHeight: "80vh" }}>
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
        <Box>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            Certificaciones y resúmenes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Cree casos, revise extracción, corrija campos mínimos y genere documentos a partir de los PDFs cargados.
          </Typography>
        </Box>

        <CertificationCreateForm types={types} creating={creatingCase} onSubmit={createCase} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" color="primary.main" fontWeight="bold">
                  Casos recientes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seleccione un caso para inspeccionar su estado, preview y validaciones.
                </Typography>
              </Box>

              <CertificationCasesList
                cases={cases}
                selectedCaseId={selectedCaseId}
                loading={loadingCases}
                onSelectCase={selectCase}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
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

export default CertificacionesPage;
