import api from '../api/client';

export const clienteService = {
  getAll: () => api.get('/clientes').then(r => r.data.data || []),
  getById: (id) => api.get(`/clientes/${id}`).then(r => r.data.data),
  getByPlaca: (placa) => api.get(`/clientes/placa/${placa}`).then(r => r.data.data),
  create: (data) => api.post('/clientes', data).then(r => r.data),
  update: (id, data) => api.put(`/clientes/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/clientes/${id}`).then(r => r.data),
};
