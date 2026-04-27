import api from './axiosConfig';

export const usersApi = {
  getAll: (filters = {}) => api.get('/users', { params: filters }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  updatePassword: (id, newPassword) => api.put(`/users/${id}/password`, { newPassword }),
  delete: (id) => api.delete(`/users/${id}`)
};

