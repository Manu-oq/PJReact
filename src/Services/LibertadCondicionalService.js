import { apiClient } from "../lib/apiClient";
import { addVersionToUrl } from "./AddVersionToURL";

export const getUnidades = async () => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/unidades"));
  return response.data;
};

export const getPostulantes = async (unidadId = null) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/postulantes"), {
    params: { unidad_id: unidadId },
  });
  return response.data;
};

export const getFundamentos = async () => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/fundamentos"));
  return response.data;
};

export const uploadPostulantesExcel = async (file, unidadId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("unidad_id", unidadId);

  const response = await apiClient.post(
    addVersionToUrl("/libertad-condicional/postulantes/importar"),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const emitirVoto = async (votoData) => {
  const response = await apiClient.post(addVersionToUrl("/libertad-condicional/votar"), votoData);
  return response.data;
};

export const exportarResultados = async () => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/resultados/exportar"), {
    responseType: "blob",
  });
  return response.data;
};

export const getResumenAdmin = async () => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/admin/resumen"));
  return response.data;
};

export const checkEstadoUnidad = async (unidadId) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/unidad/estado"), {
    params: { unidad_id: unidadId },
  });
  return response.data.completa;
};

export const prepararGeneracionInformes = async (unidadId) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/informes/preparar"), {
    params: { unidad_id: unidadId },
  });
  return response.data;
};

export const procesarLoteInformes = async (unidadId, ids) => {
  const response = await apiClient.post(
    addVersionToUrl("/libertad-condicional/informes/procesar-lote"),
    { unidad_id: unidadId, ids },
    { timeout: 120000 }
  );
  return response.data;
};

export const descargarZipInformes = async (unidadId) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/informes/descargar"), {
    params: { unidad_id: unidadId },
    responseType: "blob",
    timeout: 30000,
  });
  return response.data;
};

export const deletePostulantes = async (ids) => {
  const response = await apiClient.post(addVersionToUrl("/libertad-condicional/postulantes/delete"), { ids });
  return response.data;
};

export const cerrarCicloHistorico = async ({ unidad_id, anio, semestre }) => {
  const response = await apiClient.post(addVersionToUrl("/libertad-condicional/historico/cerrar-ciclo"), {
    unidad_id,
    anio,
    semestre,
  });

  return response.data;
};

export const getCiclosHistoricos = async (unidadId) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/historico/ciclos"), {
    params: { unidad_id: unidadId },
  });

  return response.data;
};

export const getPostulantesHistoricos = async (cicloId) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/historico/postulantes"), {
    params: { ciclo_id: cicloId },
  });

  return response.data;
};

export const prepararInformesHistoricos = async (cicloId, ids = null) => {
  const payload = Array.isArray(ids) && ids.length > 0 ? { ciclo_id: cicloId, ids } : { ciclo_id: cicloId };
  const response = await apiClient.post(addVersionToUrl("/libertad-condicional/historico/informes/preparar"), payload);
  return response.data;
};

export const procesarLoteInformesHistoricos = async (cicloId, ids) => {
  const response = await apiClient.post(
    addVersionToUrl("/libertad-condicional/historico/informes/procesar-lote"),
    { ciclo_id: cicloId, ids },
    { timeout: 120000 }
  );
  return response.data;
};

export const descargarZipInformesHistoricos = async (cicloId) => {
  const response = await apiClient.get(addVersionToUrl("/libertad-condicional/historico/informes/descargar"), {
    params: { ciclo_id: cicloId },
    responseType: "blob",
    timeout: 30000,
  });
  return response.data;
};
