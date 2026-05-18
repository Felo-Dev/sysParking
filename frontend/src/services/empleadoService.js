import api from '../api/client';

export const empleadoService = {
  getAll: () => api.get('/empleados').then(r => r.data.data || []),
  create: (data) => api.post('/empleados', data).then(r => r.data),
  update: (id, data) => api.put(`/empleados/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/empleados/${id}`).then(r => r.data),
};
