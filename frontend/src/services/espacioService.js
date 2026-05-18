import api from '../api/client';

export const espacioService = {
  getAll: () => api.get('/espacios').then(r => r.data.data || []),
  getMapa: () => api.get('/espacios/mapa').then(r => r.data.data || []),
  disponibles: () => api.get('/espacios/disponibles').then(r => r.data.data || []),
  create: (data) => api.post('/espacios', data).then(r => r.data),
  update: (id, data) => api.put(`/espacios/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/espacios/${id}`).then(r => r.data),
};
