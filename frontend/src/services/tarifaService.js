import api from '../api/client';

export const tarifaService = {
  getAll: () => api.get('/tarifas').then(r => r.data.data || []),
  getById: (id) => api.get(`/tarifas/${id}`).then(r => r.data.data),
  create: (data) => api.post('/tarifas', data).then(r => r.data),
  update: (id, data) => api.put(`/tarifas/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/tarifas/${id}`).then(r => r.data),
};
