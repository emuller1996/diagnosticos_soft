import apiClient from './apiClient';

const RESOURCE = '/projects';

export const projectService = {
  async list(params = {}) {
    const response = await apiClient.get(RESOURCE, { params });
    return response.data;
  },

  async getById(id) {
    const response = await apiClient.get(`${RESOURCE}/${id}`);
    return response.data;
  },

  async create(projectData) {
    const response = await apiClient.post(RESOURCE, projectData);
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

  async getStats() {
    const response = await apiClient.get(`${RESOURCE}/stats`);
    return response.data;
  },
};
