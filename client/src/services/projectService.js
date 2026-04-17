import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/projects';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const projectService = {
  async list(params = {}) {
    const response = await axios.get(API_BASE_URL, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getById(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async create(projectData) {
    const response = await axios.post(API_BASE_URL, projectData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async update(id, updateData) {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updateData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async delete(id) {
    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getStats() {
    // I need to add the stats endpoint to the routes if not already there, 
    // but looking at my previous work I forgot to add the route specifically for stats.
    // I will call /api/projects/stats. I'll need to add this route to projectRoutes.js first.
    const response = await axios.get(`${API_BASE_URL}/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  }
};