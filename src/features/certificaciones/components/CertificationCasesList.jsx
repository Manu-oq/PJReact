import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { EmptyState, PageLoader } from "../../../components/feedback/PageState";

const getStatusColor = (status) => {
  switch (status) {
    case "generated":
      return "success";
    case "validated":
      return "primary";
    case "failed":
      return "error";
    case "needs_review":
      return "warning";
    default:
      return "default";
  }
};

const statusLabels = {
  created: "Creado",
  uploaded: "Cargado",
  extracted: "Extraído",
  validated: "Validado",
  generated: "Generado",
  failed: "Fallido",
  needs_review: "Requiere revisión",
};

const getStatusLabel = (status) => statusLabels[status] || "Sin estado";

export const CertificationCasesList = ({
  cases,
  selectedCaseId = null,
  loading = false,
  onSelectCase,
}) => {
  if (loading && cases.length === 0) {
    return <PageLoader minHeight={220} message="Cargando casos recientes..." />;
  }

  if (cases.length === 0) {
    return <EmptyState message="No hay casos registrados todavía." minHeight={220} />;
  }

  return (
    <Box
      sx={{
        maxHeight: { xs: "none", lg: 720 },
        overflowY: { xs: "visible", lg: "auto" },
        pr: { xs: 0, lg: 0.75 },
      }}
    >
      <Stack spacing={2}>
        {cases.map((certificationCase) => {
          const isSelected = certificationCase.id === selectedCaseId;

          return (
            <Card
              key={certificationCase.id}
              sx={{
                borderRadius: 3,
                border: isSelected ? "1px solid rgba(17,63,106,0.44)" : "1px solid rgba(8,31,52,0.08)",
                boxShadow: isSelected ? 4 : 1,
                overflow: "hidden",
              }}
            >
              <CardActionArea onClick={() => onSelectCase(certificationCase.id)}>
                <CardContent sx={{ p: 2.25 }}>
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between" gap={1.5} flexWrap="wrap">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AssignmentOutlinedIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">
                          Caso #{certificationCase.id}
                        </Typography>
                      </Stack>
                      <Chip
                        label={getStatusLabel(certificationCase.status)}
                        color={getStatusColor(certificationCase.status)}
                        size="small"
                        variant={isSelected ? "filled" : "outlined"}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      {certificationCase.type?.name || "Tipo no disponible"}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

CertificationCasesList.propTypes = {
  cases: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedCaseId: PropTypes.number,
  loading: PropTypes.bool,
  onSelectCase: PropTypes.func.isRequired,
};
