import api from './axiosConfig';

export const sallesApi = {
  getAll: (filters = {}) => api.get('/salles', { params: filters }),
  getById: (id) => api.get(`/salles/${id}`),
  getDisponibilites: (id, date) => api.get(`/salles/${id}/disponibilites`, { params: { date } }),
  create: (data) => api.post('/salles', data),
  update: (id, data) => api.put(`/salles/${id}`, data),
  delete: (id) => api.delete(`/salles/${id}`)
};

