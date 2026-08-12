import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import zoomIcon from "../../img/zoomIcon.svg";
import { getZoomLink, isZoomLinkIntegrationEnabled, updateZoomLink } from "../../Services/ZoomServices";
import DialogZoom from "./DialogZoom";
import { useUser } from "../context/UserContext";

export default function ZoomLink({ salaId }) {
  const [zoomLink, setZoomLink] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { hasRole } = useUser();

  const theme = useTheme();
  const zoomIntegrationEnabled = isZoomLinkIntegrationEnabled;

  useEffect(() => {
    if (!zoomIntegrationEnabled) {
      setHasFetched(true);
      setLoading(false);
      return;
    }

    if (isEditing || hasFetched) return;

    const fetchZoomLink = async () => {
      try {
        setLoading(true);

        const localStorageKey = `zoom-link-${salaId}`;
        let link;

        // Solo los ingenieros deben poder editar el enlace
        if (!hasRole("ingeniero")) {
          const cachedLink = localStorage.getItem(localStorageKey);
          if (cachedLink) {
            setZoomLink(cachedLink);
          }
          link = await getZoomLink(salaId);
          setZoomLink(link || "");
        } else {
          // Los ingenieros pueden ver y editar el enlace
          link = await getZoomLink(salaId);
          setZoomLink(link || "");
          if (!link) {
            setIsEditing(true);
          }
        }

        // Guardar en caché el enlace para los roles no ingenieros
        const cachedLink = localStorage.getItem(localStorageKey);
        if (!cachedLink || cachedLink !== link) {
          localStorage.setItem(localStorageKey, link || "");
        }
      } catch (error) {
        console.error("Error al obtener el enlace de Zoom:", error);
      } finally {
        setLoading(false);
        setHasFetched(true);
      }
    };

    fetchZoomLink();
  }, [hasFetched, isEditing, salaId, zoomIntegrationEnabled]);

  const handleSaveLink = async () => {
    if (!zoomIntegrationEnabled) {
      return;
    }

    try {
      setLoading(true);
      await updateZoomLink(zoomLink, salaId);
      alert("Enlace de Zoom actualizado correctamente.");
      setIsEditing(false);
    } catch (error) {
      alert("Hubo un error al guardar el enlace.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDialogClose = (accept) => {
    setOpenDialog(false);
    if (accept) {
      window.open(zoomLink, "_blank");
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    setOpenDialog(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      {!zoomIntegrationEnabled ? (
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          La integración de Zoom está temporalmente pausada.
        </Typography>
      ) : isEditing ? (
        <>
          <TextField
            label="Ingresar enlace de Zoom"
            fullWidth
            value={zoomLink}
            onChange={(e) => setZoomLink(e.target.value)}
            placeholder="https://zoom.us/..."
            sx={{ mb: 2 }}
            aria-label="Ingresar enlace de Zoom"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveLink}
            aria-label="Guardar enlace de Zoom"
          >
            {loading ? "Guardando..." : "Guardar enlace"}
          </Button>
        </>
      ) : zoomLink ? (
        <Paper
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
            background: "#2673EF",
            color: "#ffff",
            gap: 2,
          }}
        >
          <Avatar
            src={zoomIcon}
            alt="Zoom Icon"
            sx={{
              width: 30,
              height: 30,
              bgcolor: theme.palette.background.default,
            }}
          />
          <Typography
            variant="body1"
            sx={{
              flexGrow: 1,
              color: "#ffffff",
            }}
          >
            <a
              href={zoomLink}
              onClick={handleLinkClick}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Ingresar vía Zoom
            </a>
          </Typography>

          {hasRole("ingeniero") && (
            <Button
              variant="contained"
              sx={{
                backgroundColor: theme.palette.button.main,
                color: theme.palette.text.main,
                "&:hover": {
                  backgroundColor: theme.palette.button.dark,
                },
              }}
              onClick={handleEditClick}
              aria-label="Editar enlace de Zoom"
            >
              Editar
            </Button>
          )}
        </Paper>
      ) : (
        <Typography variant="body1" sx={{ color: "#FF0000" }}>
          No está disponible el enlace a Zoom.
        </Typography>
      )}

      <DialogZoom
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={(link) => window.open(link, "_blank")}
        zoomLink={zoomLink}
      />
    </Box>
  );
}
