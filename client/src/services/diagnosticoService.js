import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/diagnosticos';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const diagnosticoService = {
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

  async create(diagnosticoData) {
    const response = await axios.post(API_BASE_URL, diagnosticoData, {
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

  async inactivate(id) {
    const response = await axios.patch(`${API_BASE_URL}/${id}/inactivate`, {}, {
      headers: getAuthHeader(),
    });
    return response.data;
  }
};