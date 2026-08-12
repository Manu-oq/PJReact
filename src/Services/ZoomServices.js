import axios from "axios";
import { addVersionToUrl } from "./AddVersionToURL";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const isZoomLinkIntegrationEnabled = import.meta.env.VITE_ENABLE_ZOOM_LINK === "true";

const ZOOM_LINK_PAUSED_ERROR =
  "La integración de Zoom está temporalmente pausada hasta que el backend vuelva a publicar /zoom-link.";

export const getZoomLink = async (salaId) => {
  if (!isZoomLinkIntegrationEnabled) {
    throw new Error(ZOOM_LINK_PAUSED_ERROR);
  }

  try {
    const url = addVersionToUrl(`${API_BASE_URL}/zoom-link`);
    const response = await axios.get(url, {
      params: { sala_id: salaId },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });
    return response.data.zoom_link || null;
  } catch (error) {
    console.log(error);
    throw new Error("Error al cargar el enlace de Zoom");
  }
};

export const updateZoomLink = async (zoomLink, salaId) => {
  if (!isZoomLinkIntegrationEnabled) {
    throw new Error(ZOOM_LINK_PAUSED_ERROR);
  }

  try {
    const url = addVersionToUrl(`${API_BASE_URL}/zoom-link`);
    await axios.post(
      url,
      { zoom_link: zoomLink, sala_id: salaId },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log(error);
    throw new Error("Error al guardar el enlace de Zoom");
  }
};
