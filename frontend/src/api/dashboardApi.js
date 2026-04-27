import api from './axiosConfig';

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

