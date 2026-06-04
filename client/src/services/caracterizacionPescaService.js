import apiClient from './apiClient';

const ENDPOINT = '/caracterizacion-pesca';

export const caracterizacionPescaService = {
  async getAll() {
    const response = await apiClient.get(ENDPOINT);
    return response.data;
  },

  async create(data) {
    const response = await apiClient.post(ENDPOINT, data);
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(`${ENDPOINT}/${id}`, data);
    return response.data;
  }
};