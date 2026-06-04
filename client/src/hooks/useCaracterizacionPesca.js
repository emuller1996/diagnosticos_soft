import { useState, useEffect, useCallback } from 'react';
import { caracterizacionPescaService } from '../services/caracterizacionPescaService';

export const useCaracterizacionPesca = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCaracterizaciones = useCallback(async () => {
    setLoading(true);
    try {
      const result = await caracterizacionPescaService.getAll();
      // Handling both potential formats: directly an array or wrapped in an object
      setData(Array.isArray(result) ? result : (result.caracterizaciones || []));
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching caracterizaciones de pesca');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaracterizaciones();
  }, [fetchCaracterizaciones]);

  const createCaracterizacion = async (payload) => {
    try {
      const newRecord = await caracterizacionPescaService.create(payload);
      await fetchCaracterizaciones();
      return newRecord;
    } catch (err) {
      throw new Error(err.message || 'Error creating caracterizacion');
    }
  };

  const updateCaracterizacion = async (id, payload) => {
    try {
      const updatedRecord = await caracterizacionPescaService.update(id, payload);
      await fetchCaracterizaciones();
      return updatedRecord;
    } catch (err) {
      throw new Error(err.message || 'Error updating caracterizacion');
    }
  };

  return {
    data,
    loading,
    error,
    fetchCaracterizaciones,
    createCaracterizacion,
    updateCaracterizacion
  };
};