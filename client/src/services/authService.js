import apiClient from './apiClient';

const RESOURCE = '/users';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

export const getTokenExpirationMs = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded.exp !== 'number') return null;
  return decoded.exp * 1000;
};

export const isTokenExpired = (token) => {
  const expMs = getTokenExpirationMs(token);
  if (expMs === null) return true;
  return expMs <= Date.now();
};

export const authService = {
  async login(email, password) {
    const response = await apiClient.post(`${RESOURCE}/login`, { email, password });
    const data = response.data;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async register(userData) {
    const response = await apiClient.post(`${RESOURCE}/register`, userData);
    return response.data;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
