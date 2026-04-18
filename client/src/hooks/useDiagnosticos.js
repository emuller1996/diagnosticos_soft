import { useState, useEffect, useCallback } from 'react';
import { diagnosticoService } from '../services/diagnosticoService';

export const useDiagnosticos = () => {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDiagnosticos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await diagnosticoService.list({
        search,
      });
      // Adjust based on backend response: if backend returns an array directly or an object { diagnosticos: [] }
      setDiagnosticos(Array.isArray(data) ? data : data.diagnosticos || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching diagnosticos');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDiagnosticos();
  }, [fetchDiagnosticos]);

  const createDiagnostico = async (data) => {
    const newDiagnostico = await diagnosticoService.create(data);
    await fetchDiagnosticos();
    return newDiagnostico;
  };

  const updateDiagnostico = async (id, data) => {
    const updatedDiagnostico = await diagnosticoService.update(id, data);
    await fetchDiagnosticos();
    return updatedDiagnostico;
  };

  const deleteDiagnostico = async (id) => {
    await diagnosticoService.delete(id);
    await fetchDiagnosticos();
  };

  const inactivateDiagnostico = async (id) => {
    await diagnosticoService.inactivate(id);
    await fetchDiagnosticos();
  };

  return {
    diagnosticos,
    loading,
    error,
    search,
    setSearch,
    fetchDiagnosticos,
    createDiagnostico,
    updateDiagnostico,
    deleteDiagnostico,
    inactivateDiagnostico
  };
};