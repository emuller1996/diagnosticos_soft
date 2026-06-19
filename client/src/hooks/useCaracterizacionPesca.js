import { useState, useEffect, useCallback } from 'react';
import { caracterizacionPescaService } from '../services/caracterizacionPescaService';
import { offlineStore } from '../db/offlineDb';

export const useCaracterizacionPesca = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = async () => {
    const count = await offlineStore.getQueueCount();
    setPendingCount(count);
  };

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
    updatePendingCount();
  }, [fetchCaracterizaciones]);

  const createCaracterizacion = async (payload) => {
    try {
      if (!navigator.onLine) {
        await offlineStore.addToQueue('CREATE', payload, '/caracterizacion-pesca');
        await updatePendingCount();
        return { ...payload, isPending: true };
      }

      const newRecord = await caracterizacionPescaService.create(payload);
      await fetchCaracterizaciones();
      return newRecord;
    } catch (err) {
      if (!navigator.onLine || !err.response) {
        await offlineStore.addToQueue('CREATE', payload, '/caracterizacion-pesca');
        await updatePendingCount();
        return { ...payload, isPending: true };
      }
      throw new Error(err.message || 'Error creating caracterizacion');
    }
  };

  const updateCaracterizacion = async (id, payload) => {
    try {
      if (!navigator.onLine) {
        await offlineStore.addToQueue('UPDATE', { id, ...payload }, `/caracterizacion-pesca/${id}`);
        await updatePendingCount();
        return { ...payload, id, isPending: true };
      }

      const updatedRecord = await caracterizacionPescaService.update(id, payload);
      await fetchCaracterizaciones();
      return updatedRecord;
    } catch (err) {
      if (!navigator.onLine || !err.response) {
        await offlineStore.addToQueue('UPDATE', { id, ...payload }, `/caracterizacion-pesca/${id}`);
        await updatePendingCount();
        return { ...payload, id, isPending: true };
      }
      throw new Error(err.message || 'Error updating caracterizacion');
    }
  };

  return {
    data,
    loading,
    error,
    pendingCount,
    updatePendingCount,
    fetchCaracterizaciones,
    createCaracterizacion,
    updateCaracterizacion
  };
};