import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import PropTypes from "prop-types";

export const PageLoader = ({ message = "Cargando...", minHeight = 240 }) => (
  <Box
    sx={{
      minHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 2,
      p: 3,
      borderRadius: 4,
      backgroundColor: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(8,31,52,0.08)",
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

PageLoader.propTypes = {
  message: PropTypes.string,
  minHeight: PropTypes.number,
};

export const PageErrorState = ({ message, onRetry, minHeight = 220 }) => (
  <Box
    sx={{
      minHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Box sx={{ width: "100%", maxWidth: 720 }}>
      <Alert
        severity="error"
        variant="filled"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null
        }
      >
        {message}
      </Alert>
    </Box>
  </Box>
);

PageErrorState.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  minHeight: PropTypes.number,
};

export const EmptyState = ({ message, minHeight = 180 }) => (
  <Box
    sx={{
      minHeight,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Alert severity="info" sx={{ width: "100%", maxWidth: 720, backgroundColor: "rgba(255,255,255,0.88)", color: "text.primary" }}>
      {message}
    </Alert>
  </Box>
);

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  minHeight: PropTypes.number,
};
