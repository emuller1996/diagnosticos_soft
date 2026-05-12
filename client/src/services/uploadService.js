import apiClient from './apiClient';

const uploadAsset = async (diagnosticoId, fieldName, file) => {
  const formData = new FormData();
  formData.append(fieldName, file);
  const response = await apiClient.post(
    `/diagnosticos/${diagnosticoId}/${fieldName}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

const uploadAnexoFoto = async (diagnosticoId, file, observaciones = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('observaciones', observaciones || '');
  const response = await apiClient.post(
    `/diagnosticos/${diagnosticoId}/anexo-foto`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

const deleteAnexoFoto = async (diagnosticoId, fotoIndex) => {
  const response = await apiClient.delete(
    `/diagnosticos/${diagnosticoId}/anexo-foto/${fotoIndex}`
  );
  return response.data;
};

export const uploadService = {
  uploadCroquis: (diagnosticoId, file) => uploadAsset(diagnosticoId, 'croquis', file),
  uploadHuella: (diagnosticoId, file) => uploadAsset(diagnosticoId, 'huella', file),
  uploadAnexoFoto,
  deleteAnexoFoto,
};
