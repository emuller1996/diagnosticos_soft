import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';
import { authService, isTokenExpired, getTokenExpirationMs } from '../services/authService';
import { syncService } from '../services/syncService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return null;
    if (isTokenExpired(stored)) {
      authService.logout();
      return null;
    }
    return stored;
  });
  const [loading, setLoading] = useState(true);
  const expiryTimerRef = useRef(null);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      } else {
        logout();
      }
    }
    setLoading(false);
  }, [token, logout]);

  useEffect(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (!token) return;

    const expMs = getTokenExpirationMs(token);
    if (expMs === null) {
      logout();
      return;
    }
    const remaining = expMs - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    expiryTimerRef.current = setTimeout(logout, remaining);
    return () => clearTimeout(expiryTimerRef.current);
  }, [token, logout]);

  useEffect(() => {
    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => apiClient.interceptors.response.eject(interceptorId);
  }, [logout]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    // Apenas hay sesión, enviar las fichas guardadas offline (ya atribuibles).
    syncService.syncIfPending();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
