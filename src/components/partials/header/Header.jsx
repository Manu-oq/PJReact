import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import pjud from "../../../img/pjud_blanco.png";
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PropTypes from "prop-types";
import "./header.css";

const activeLinkStyles = ({ isActive }) => ({
  color: "#ffffff",
  background: isActive ? "rgba(255,255,255,0.16)" : "transparent",
  border: isActive ? "1px solid rgba(255,255,255,0.18)" : "1px solid transparent",
});

export const Header = ({ navLinks }) => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, userName } = useUser();

  const visibleNavLinks = useMemo(
    () => navLinks.filter((item) => !item.requiresAuth || isAuthenticated),
    [isAuthenticated, navLinks]
  );

  const toggleDrawer = () => {
    setOpen((previous) => !previous);
  };

  return (
    <AppBar
      position="sticky"
      className="container-nav"
      color="primary"
      sx={{
        top: 0,
        px: { xs: 1.5, md: 2.5 },
        py: 1.25,
        background: "linear-gradient(135deg, rgba(8,31,52,0.94) 0%, rgba(17,63,106,0.92) 100%)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Toolbar className="toolbar" disableGutters>
        <Box className="logo">
          <Link to="/" aria-label="Inicio" className="navbar-brand">
            <img id="header-logo" src={pjud} alt="Poder Judicial" className="logo-img" />
          </Link>
        </Box>

        <Stack direction="row" spacing={1.25} alignItems="center" className="desktop-actions">
          {userName ? (
            <Chip
              label={`Bienvenido, ${userName}`}
              className="welcome-chip"
              sx={{
                color: "#fff",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.12)",
                maxWidth: 240,
                "& .MuiChip-label": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
              }}
            />
          ) : null}

          <Box component="nav" className="navigator">
            <ul className="nav-list">
              {visibleNavLinks.map((item) => (
                <li key={item.title} className="nav-item">
                  {item.isExternal || item.external ? (
                    <a href={item.path} target="_blank" rel="noopener noreferrer" className="nav-link nav-link-external">
                      {item.title}
                    </a>
                  ) : (
                    <NavLink className="nav-link" style={activeLinkStyles} to={item.path}>
                      {item.title}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </Box>
        </Stack>

        <IconButton edge="end" color="inherit" aria-label="Abrir menú" onClick={toggleDrawer} id="menu-button">
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={open}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              width: { xs: "min(88vw, 320px)", sm: 310 },
              p: 2,
              background: "linear-gradient(180deg, #081f34 0%, #113f6a 100%)",
              color: "#eef4fb",
            },
          }}
        >
          <Box sx={{ p: 1.5, pb: 2 }}>
            <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", letterSpacing: "0.08em" }}>
              Corte de Apelaciones de Temuco
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              Navegación
            </Typography>
            {userName ? (
              <Chip
                label={`Bienvenido, ${userName}`}
                sx={{
                  mt: 1.5,
                  color: "#fff",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  width: "100%",
                  justifyContent: "flex-start",
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            ) : null}
          </Box>

          <List sx={{ pt: 0 }}>
            {visibleNavLinks.map((item) => (
              <ListItem key={item.title} disablePadding sx={{ mb: 0.5 }}>
                {item.isExternal || item.external ? (
                  <ListItemButton component="a" href={item.path} target="_blank" rel="noopener noreferrer" onClick={toggleDrawer} className="drawer-link">
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                ) : (
                  <ListItemButton component={NavLink} to={item.path} onClick={toggleDrawer} className="drawer-link">
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                )}
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      isExternal: PropTypes.bool,
      external: PropTypes.bool,
      requiresAuth: PropTypes.bool,
    })
  ).isRequired,
};
