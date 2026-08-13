import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CertificationCreateForm } from "../features/certificaciones/components/CertificationCreateForm";
import { CertificationDetailPanel } from "../features/certificaciones/components/CertificationDetailPanel";
import { useCertificaciones } from "../features/certificaciones/hooks/useCertificaciones";
import { PageErrorState, PageLoader } from "../components/feedback/PageState";
import { CERTIFICACIONES_CASES_ROUTE } from "../features/certificaciones/utils/constants";

const certificationSteps = ["Nuevo caso", "Revisión y corrección"];

const CertificacionesPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const {
    types,
    selectedCase,
    selectedExtraction,
    loadingInitial,
    loadingDetail,
    creatingCase,
    casePendingValidation,
    savingOverrides,
    validatingCase,
    generatingDocument,
    downloadingDocument,
    pageError,
    feedback,
    closeFeedback,
    reloadPage,
    createCase,
    uploadCaseFile,
    saveOverrides,
    validateCase,
    generateDocument,
    downloadDocument,
  } = useCertificaciones({ autoSelectFirstCase: false });

  useEffect(() => {
    if (selectedCase) {
      setCurrentStep(1);
    }
  }, [selectedCase]);

  const handleCreateCase = async (payload) => {
    await createCase(payload);
    setCurrentStep(1);
  };

  if (loadingInitial) {
    return (
      <Container maxWidth="xl" sx={{ mt: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, minHeight: "80vh" }}>
        <PageLoader message="Cargando módulo de certificaciones..." minHeight={320} />
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
            Certificaciones y resúmenes
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
            {currentStep === 1 ? (
              <Button
                variant="contained"
                onClick={() => setCurrentStep(0)}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Crear otro caso
              </Button>
            ) : null}

            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate(CERTIFICACIONES_CASES_ROUTE)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Casos recientes
            </Button>
          </Stack>
        </Box>

        <Stepper activeStep={currentStep} alternativeLabel sx={{ px: { xs: 0, md: 2 } }}>
          {certificationSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {currentStep === 0 ? (
          <CertificationCreateForm
            types={types}
            creating={creatingCase}
            onUploadFile={uploadCaseFile}
            onSubmit={handleCreateCase}
          />
        ) : (
          <Stack spacing={2.5}>
            <Typography variant="h5" color="primary.main" fontWeight="bold">
              Revisión y corrección
            </Typography>

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

export default CertificacionesPage;
