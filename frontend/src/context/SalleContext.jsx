import React, { createContext, useState, useCallback } from 'react';
import { sallesApi } from '../api/sallesApi';

export const SalleContext = createContext();

export function SalleProvider({ children }) {
  const [salles, setSalles] = useState([]);
  const [disponibilites, setDisponibilites] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalles = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sallesApi.getAll(filters);
      setSalles(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des salles');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDisponibilites = useCallback(async (id, date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sallesApi.getDisponibilites(id, date);
      setDisponibilites(res.data.data);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des disponibilités');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    salles,
    disponibilites,
    loading,
    error,
    fetchSalles,
    fetchDisponibilites
  };

  return (
    <SalleContext.Provider value={value}>
      {children}
    </SalleContext.Provider>
  );
}

