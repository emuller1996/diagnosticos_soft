import apiClient from './apiClient';

const RESOURCE = '/diagnosticos';

export const diagnosticoService = {
  async list(params = {}) {
    const response = await apiClient.get(RESOURCE, { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`${RESOURCE}/${id}`);
    return response.data;
  },

  async create(diagnosticoData) {
    const response = await apiClient.post(RESOURCE, diagnosticoData);
    return response.data;
  },

  async update(id, updateData) {
    const response = await apiClient.put(`${RESOURCE}/${id}`, updateData);
    return response.data;
  },

  async delete(id) {
    const response = await apiClient.delete(`${RESOURCE}/${id}`);
    return response.data;
  },

  async inactivate(id) {
    const response = await apiClient.patch(`${RESOURCE}/${id}/inactivate`, {});
    return response.data;
  },
};
