import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import { MAYORIA_NECESARIA_COMISION } from "./constants";

export const parseRol = (rolStr) => {
  if (!rolStr) return { num: 0, year: 0 };
  const parts = rolStr.split("-");
  return { num: parseInt(parts[0] || 0, 10), year: parseInt(parts[1] || 0, 10) };
};

export const sortPostulantes = (postulantes = [], searchTerm = "") => {
  return [...postulantes]
    .filter(
      (postulante) =>
        postulante.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        postulante.rol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const rolA = parseRol(a.rol);
      const rolB = parseRol(b.rol);
      if (rolA.year !== rolB.year) return rolA.year - rolB.year;
      return rolA.num - rolB.num;
    });
};

export const sortPostulantesHistoricos = (postulantes = [], searchTerm = "") => {
  return [...postulantes]
    .filter(
      (postulante) =>
        postulante.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        postulante.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (postulante.run || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const rolA = parseRol(a.rol);
      const rolB = parseRol(b.rol);
      if (rolA.year !== rolB.year) return rolA.year - rolB.year;
      return rolA.num - rolB.num;
    });
};

export const buildFundamentoOptions = (fundamentos = [], votoSeleccionado) => {
  return fundamentos
    .filter((fundamento) => {
      if (!votoSeleccionado) return false;
      const tipoLimpio = fundamento.tipo_voto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return votoSeleccionado === "si" ? tipoLimpio === "aprobacion" : tipoLimpio === "rechazo";
    })
    .map((fundamento) => ({ value: fundamento.id, label: fundamento.texto }));
};

export const sortResumenAdmin = (data = [], filtro = "") => {
  return [...data]
    .filter((item) => item.rol.toLowerCase().includes(filtro.toLowerCase()) || item.nombre_completo.toLowerCase().includes(filtro.toLowerCase()))
    .sort((a, b) => {
      const partsA = a.rol.split("-");
      const partsB = b.rol.split("-");
      if (partsA[1] !== partsB[1]) return partsA[1] - partsB[1];
      return partsA[0] - partsB[0];
    });
};

export const getResultadoStatus = (item) => {
  if (!item) return { texto: "", color: "transparent", bg: "#fff", icono: null };
  if (item.votos_si >= MAYORIA_NECESARIA_COMISION) {
    return { texto: "LIBERTAD CONCEDIDA", color: "#2e7d32", bg: "#e8f5e9", icono: <CheckCircleIcon sx={{ fontSize: 100, color: "#2e7d32" }} /> };
  }
  if (item.votos_no >= MAYORIA_NECESARIA_COMISION) {
    return { texto: "LIBERTAD DENEGADA", color: "#c62828", bg: "#ffebee", icono: <CancelIcon sx={{ fontSize: 100, color: "#c62828" }} /> };
  }
  return { texto: "EN VOTACIÓN", color: "#2b88de", bg: "#f0f7ff", icono: <HowToVoteIcon sx={{ fontSize: 100, color: "#2b88de" }} /> };
};

export const buildChunks = (items = [], chunkSize = 5) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

export const formatSemestre = (semestre) => {
  if (semestre === 1) return "Primer semestre";
  if (semestre === 2) return "Segundo semestre";
  return `Semestre ${semestre}`;
};

export const formatFecha = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
