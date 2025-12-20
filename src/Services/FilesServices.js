import axios from "axios";
import { addVersionToUrl } from "./AddVersionToURL"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getFiles = async (folder = 0) => {
  try {
    const url = addVersionToUrl(`${API_BASE_URL}/files?folder=${folder}`); 
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    if (Array.isArray(response.data)) {
      return response.data.map((file) => ({
        name: file.name,
        nameSatinize: file.nameSatinize,
        folder: file.folder,
        status: file.status,
      }));
    } else {
      throw new Error("Los datos recibidos no son un array");
    }
  } catch (error) {
    throw new Error("Error al cargar los archivos: " + error.message);
  }
};

export const uploadFile = async (file, sala) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sala", sala);

  const url = addVersionToUrl(`${API_BASE_URL}/files/upload`); 
  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  if (response.status !== 200) {
    throw new Error(`Error al subir ${file.name}`);
  }
};

export const deleteFile = async (fileNameSatinize) => {
  const url = addVersionToUrl(`${API_BASE_URL}/files/delete/${fileNameSatinize}`); 
  const response = await axios.delete(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });
  if (response.status !== 200) {
    throw new Error("Error al eliminar el archivo");
  }
};

export const updateFile = async (file, sala) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sala", sala);

  const url = addVersionToUrl(`${API_BASE_URL}/files/update/${file.name}`);
  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
    withCredentials: true,
  });

  if (response.status !== 200) {
    throw new Error("Error al actualizar el archivo");
  }
};

export const updateFileStatus = async (fileName, status) => {
  try {
    const url = addVersionToUrl(`${API_BASE_URL}/files/update-status/${fileName}`);
    const response = await axios.post(
      url,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.status !== 200) {
      throw new Error("Error al actualizar el estado del archivo");
    }

    return response.data;
  } catch (error) {
    throw new Error("Error al actualizar el estado del archivo: " + error.message);
  
  }
};