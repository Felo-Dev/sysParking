import api from '../api/client';

export const carteraService = {
  getAll: () => api.get('/cartera').then(r => r.data.data || []),
  getPendientes: () => api.get('/cartera/pendientes').then(r => r.data.data || []),
  pagar: (id) => api.put(`/cartera/${id}/pagar`).then(r => r.data),
  historialCliente: (clienteId) =>
    api.get(`/cartera/cliente/${clienteId}`).then(r => r.data.data || []),
  generarMensualidades: () =>
    api.post('/cartera/generar-mensualidades').then(r => r.data),
};
