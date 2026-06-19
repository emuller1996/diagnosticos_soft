import apiClient from './apiClient';

const userService = {
  async getUsers({ page = 1, limit = 10, search = '' }) {
    const response = await apiClient.get('/users', {
      params: {
        page,
        limit,
        search,
      },
    });
    return response.data;
  },
};

export default userService;