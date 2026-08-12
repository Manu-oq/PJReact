import { useEffect, useState, useRef } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { Tooltip, Typography } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import ArticleIcon from "@mui/icons-material/Article";

import { useMediaQuery } from "@mui/material";

import {
  getFiles,
  uploadFile,
  deleteFile,
  updateFile,
  updateFileStatus,
} from "../../Services/FilesServices";
import CheckWarning from "./CheckWarning";
import { useUser } from "../context/UserContext";

export default function FileManager({ salaId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileToUpdate, setFileToUpdate] = useState(null);
  const [selectedName, setSelectedName] = useState("");
  const fileInputRef = useRef(null);
  const updateInputRef = useRef(null);
  const { hasRole } = useUser();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const predefinedNames = [
    "Tabla semanal",
    "Tabla agregada",
    "Acta de instalación",
    "Anuncio de causas",
    "Estado diario",
    "Proyecto Integ. Salas",
  ];

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const localStorageKey = `files-${salaId}`;
      let formattedFiles;

      if (!hasRole("archivero")) {
        const cachedFiles = localStorage.getItem(localStorageKey);

        if (cachedFiles) {
          setFiles(JSON.parse(cachedFiles));
        }

        formattedFiles = await getFiles(salaId);

        const cachedData = cachedFiles ? JSON.parse(cachedFiles) : null;
        if (
          !cachedData ||
          JSON.stringify(cachedData) !== JSON.stringify(formattedFiles)
        ) {
          localStorage.setItem(localStorageKey, JSON.stringify(formattedFiles));
        }
      } else {
        formattedFiles = await getFiles(salaId);
      }

      setFiles(formattedFiles);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (!selectedName) {
      setError("Por favor, selecciona un nombre para el archivo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        const renamedFile = new File([file], `${selectedName}.pdf`, {
          type: file.type,
        });
        await uploadFile(renamedFile, salaId);
      }
      await fetchFiles();
    } catch (error) {
      setError("Error al subir algunos archivos");
    } finally {
      setLoading(false);
      event.target.value = "";
      setSelectedName("");
    }
  };

  const handleDelete = async (file) => {
    try {
      await deleteFile(file.nameSatinize);
      setFiles((prevFiles) =>
        prevFiles.filter((f) => f.nameSatinize !== file.nameSatinize)
      );
    } catch (error) {
      setError("Error al eliminar el archivo: " + error.message);
    }
  };

  const handleUpdateClick = (file) => {
    setFileToUpdate(file);
    updateInputRef.current.click();
  };

  const handleUpdateFileChange = async (event) => {
    const newFile = event.target.files[0];
    if (!newFile) return;
    setLoading(true);

    try {
      const updatedFile = new File([newFile], fileToUpdate.nameSatinize, {
        type: newFile.type,
      });

      await updateFile(updatedFile, salaId);
      await fetchFiles();
    } catch (error) {
      setError("Error al actualizar el archivo: " + error.message);
    } finally {
      setLoading(false);
      setFileToUpdate(null);
    }
  };

  const handleToggleWarning = async (fileName, newStatus) => {
    setLoading(true);
    try {
      const updatedFileName =
        newStatus === "inactivate"
          ? fileName.replace("-inactivate.pdf", "-activate.pdf")
          : fileName.replace("-activate.pdf", "-inactivate.pdf");

      await updateFileStatus(updatedFileName, newStatus);

      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file.nameSatinize === fileName ? { ...file, status: newStatus } : file
        )
      );
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf"
        style={{ display: "none" }}
        ref={fileInputRef}
        disabled={loading}
      />
      <input
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        ref={updateInputRef}
        onChange={handleUpdateFileChange}
        disabled={loading}
      />
      {files.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2}}>
            {files.map((file) => (
              <Box
                key={`${file.nameSatinize}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                {file.status === "activate" ? (
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    Documento prioritario
                  </Typography>
                ) : null}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                  }}
                >
                  
                  <Tooltip title={file.name} placement="top">
                    <Button
                      variant="contained"
                      component="a"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`${API_BASE_URL}/files/view/${file.nameSatinize}`}
                      sx={{
                        flex: 8,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap", // Cambio clave (evita el salto de línea)
                        maxWidth: isSmallScreen ? "180px" : "280px", // Límite responsive
                        padding: "6px 16px",
                        position: "relative",
                        textAlign: "left",
                        pl: 4, // Espacio para el ícono
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                        },
                        fontSize: isSmallScreen ? "0.75rem" : "1rem",
                      }}
                    >
                      {!(hasRole("archivero") && isSmallScreen) && (
                      <ArticleIcon
                        style={{
                          position: "absolute",
                          left: "8px",
                          fontSize: isSmallScreen ? "1rem" : "1rem",
                        }}
                      />
                    )}
                    {file.name}
                    </Button>
                  </Tooltip>

                  {hasRole("archivero") && (
                    <>
                      <Button
                        variant="text"
                        color="info"
                        onClick={() => handleUpdateClick(file)}
                        sx={{ minWidth: "auto", padding: 0 }}
                        aria-label={`Editar archivo ${file.name}`}
                      >
                        <EditIcon sx={{ fontSize: 20 }} />
                      </Button>

                      <Button
                        variant="text"
                        color="error"
                        onClick={() => handleDelete(file)}
                        sx={{ minWidth: "auto", padding: 0 }}
                        aria-label={`Eliminar archivo ${file.name}`}
                      >
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </Button>

                      <CheckWarning
                        fileName={file.nameSatinize}
                        isActive={file.status === "activate"}
                        onToggle={handleToggleWarning}
                      />
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {hasRole("archivero") && (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 4 }}>
          <FormControl size="small" disabled={loading} sx={{ width: "150px" }}>
            <InputLabel sx={{ fontSize: 15 }}>Nombre</InputLabel>
            <Select
              labelId="select-name-label"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              label="Seleccionar Nombre"
              size="small"
            >
              <MenuItem value="">Nombre</MenuItem>
              {predefinedNames.map((name, index) => (
                <MenuItem key={index} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            component="label"
            onClick={() => fileInputRef.current.click()}
            disabled={loading || !selectedName}
            startIcon={
              loading ? (
                <CircularProgress size={15} />
              ) : (
                <UploadIcon size={15} />
              )
            }
            aria-label="Cargar archivo"
          >
            {loading ? "Subiendo..." : "Subir"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
