import apiClient from './apiClient';

export const uploadService = {
  async uploadCroquis(diagnosticoId, file) {
    const formData = new FormData();
    formData.append('croquis', file);
    const response = await apiClient.post(
      `/diagnosticos/${diagnosticoId}/croquis`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
