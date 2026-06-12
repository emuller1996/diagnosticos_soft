import apiClient from './apiClient';

const uploadAsset = async (resource, id, fieldName, file) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  const response = await apiClient.post(
    `/${resource}/${id}/${fieldName}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

const uploadAnexoFoto = async (resource, id, file, observaciones = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('observaciones', observaciones || '');
  const response = await apiClient.post(
    `/${resource}/${id}/anexo-foto`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

const deleteAnexoFoto = async (resource, id, fotoIndex) => {
  const response = await apiClient.delete(
    `/${resource}/${id}/anexo-foto/${fotoIndex}`
  );
  return response.data;
};

export const uploadService = {
  // Diagnosticos
  uploadCroquis: (id, file) => uploadAsset('diagnosticos', id, 'croquis', file),
  uploadHuella: (id, file) => uploadAsset('diagnosticos', id, 'huella', file),
  uploadAnexoFoto: (id, file, obs) => uploadAnexoFoto('diagnosticos', id, file, obs),
  deleteAnexoFoto: (id, index) => deleteAnexoFoto('diagnosticos', id, index),
  
  // Caracterización Pesca
  uploadPescaAnexoFoto: (id, file, obs) => uploadAnexoFoto('caracterizacion-pesca', id, file, obs),
  deletePescaAnexoFoto: (id, index) => deleteAnexoFoto('caracterizacion-pesca', id, index),
};
