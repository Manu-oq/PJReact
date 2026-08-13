import PropTypes from "prop-types";
import { Box, Stack, Typography } from "@mui/material";

export const ResponsiveTableSection = ({
  children,
  minWidth = 720,
  hint = "Deslice horizontalmente para revisar la tabla completa.",
}) => {
  return (
    <Stack spacing={1} className="responsive-scroll-shell">
      <Typography className="responsive-scroll-shell__hint">
        {hint}
      </Typography>
      <Box className="responsive-scroll-shell__viewport">
        <Box className="responsive-scroll-shell__content" sx={{ minWidth }}>
          {children}
        </Box>
      </Box>
    </Stack>
  );
};

ResponsiveTableSection.propTypes = {
  children: PropTypes.node.isRequired,
  minWidth: PropTypes.number,
  hint: PropTypes.string,
};
