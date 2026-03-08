import axios from "axios";
import { addVersionToUrl } from "./AddVersionToURL";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o no válida.");
    }
    return Promise.reject(error);
  }
);

export const getUnidades = async () => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/unidades`);
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    throw error;
  }
};


export const getPostulantes = async (unidadId = null) => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/postulantes`);
    const response = await apiClient.get(url, {
        params: { unidad_id: unidadId } 
    }); 
    return response.data;
  } catch (error) {
    console.error("Error al obtener postulantes:", error);
    throw error;
  }
};

export const getFundamentos = async () => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/fundamentos`);
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener fundamentos:", error);
    throw error;
  }
};

export const uploadPostulantesExcel = async (file, unidadId) => { 
  try {
    const url = addVersionToUrl(`/libertad-condicional/postulantes/importar`);
    const formData = new FormData();
    formData.append('file', file); 
    formData.append('unidad_id', unidadId); 

    const response = await apiClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    throw error;
  }
};

export const emitirVoto = async (votoData) => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/votar`);
    const response = await apiClient.post(url, votoData);
    return response.data;
  } catch (error) {
    console.error("Error al emitir voto:", error);
    throw error;
  }
};
export const exportarResultados = async () => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/resultados/exportar`);
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error("Error al exportar resultados:", error);
    throw error;
  }
};

export const getResumenAdmin = async () => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/admin/resumen`);
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener resumen admin:", error);
    throw error;
  }
};

export const checkEstadoUnidad = async (unidadId) => {
    const url = addVersionToUrl(`/libertad-condicional/unidad/estado`);
    const response = await apiClient.get(url, { params: { unidad_id: unidadId } });
    return response.data.completa; 
};

export const generarInformesZip = async (unidadId) => {
    const url = addVersionToUrl(`/libertad-condicional/informes/generar`);
    const response = await apiClient.get(url, { 
        params: { unidad_id: unidadId },
        responseType: 'blob' 
    });
    return response.data;
};


export const deletePostulantes = async (ids) => {
  try {
    const url = addVersionToUrl(`/libertad-condicional/postulantes/delete`);
    const response = await apiClient.post(url, { ids });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar postulantes:", error);
    throw error;
  }
};