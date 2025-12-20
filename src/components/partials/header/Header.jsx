import { useState } from "react";
import { useUser } from "../../context/UserContext";
import pjud from "../../../img/pjud_blanco.png";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Drawer from "@mui/material/Drawer";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import PropTypes from "prop-types"; 
import "./header.css";

export const Header = ({ navLinks }) => {
  const [open, setOpen] = useState(false);
  const { userName } = useUser();

  const handleDrawer = () => {
    setOpen(!open);
  };

  return (
    <AppBar position="static" className="container-nav" color="primary">
      <Toolbar className="toolbar">
        <Box className="logo">
          <Link to="/" aria-label="Inicio" className="navbar-brand">
            <img id="header-logo" src={pjud} alt="Logo" className="logo-img" />
          </Link>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawer}
          id="menu-button"
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={open}
          onClose={handleDrawer}
          PaperProps={{
            sx: {
              backgroundColor: "#036",
              color: "#eee",
              height: "100%",
            },
          }}
        >
          <List>
            {navLinks.map((item) => (
              <ListItem button key={item.title} onClick={handleDrawer}>
                <Link className="nav-link" to={item.path}>
                  <ListItemText primary={item.title} />
                </Link>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="nav" className="navigator">
          {userName ? `Bienvenido, ${userName}!` : ""}
        </Box>
        <Box component="nav" className="navigator">
          <ul className="nav-list">
            {navLinks.map((item) => (
              <li key={item.title} className="nav-item">
                {item.isExternal || item.external ? (
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                  >
                    {item.title}
                  </a>
                ) : (
                  <Link className="nav-link" to={item.path}>
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Box>
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
    })
  ).isRequired,
};