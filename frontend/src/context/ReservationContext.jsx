import React, { createContext, useState, useCallback } from 'react';
import { reservationsApi } from '../api/reservationsApi';

export const ReservationContext = createContext();

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchReservations = useCallback(async (customFilters = {}) => {
    const merged = { ...filters, ...customFilters };
    setLoading(true);
    setError(null);
    try {
      const res = await reservationsApi.getAll(merged);
      setReservations(res.data.data.data || []);
      setPagination({
        total: res.data.data.total || 0,
        page: res.data.data.page || 1,
        limit: res.data.data.limit || 10,
        totalPages: res.data.data.totalPages || 0
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createReservation = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationsApi.create(data);
      setReservations(prev => [res.data.reservation, ...prev]);
      return { success: true, reservation: res.data.reservation };
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de la création';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id) => {
    setLoading(true);
    try {
      await reservationsApi.delete(id);
      setReservations(prev => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur lors de l\'annulation';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const value = {
    reservations,
    pagination,
    loading,
    error,
    filters,
    fetchReservations,
    createReservation,
    cancelReservation,
    updateFilters
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

