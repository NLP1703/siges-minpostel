import api from './axiosConfig';

export const reservationsApi = {
  getAll: (filters = {}) => api.get('/reservations', { params: filters }),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  valider: (id) => api.put(`/reservations/${id}/valider`),
  refuser: (id, motif_refus) => api.put(`/reservations/${id}/refuser`, { motif_refus }),
  delete: (id) => api.delete(`/reservations/${id}`)
};

