import api from '../api/client';

export const facturaService = {
  getAll: () => api.get('/facturas').then(r => r.data.data?.data || []),
  getById: (id) => api.get(`/facturas/${id}`).then(r => r.data.data),
  generar: (gestionVehiculoId) =>
    api.post('/facturas/generar', { gestion_vehiculo_id: gestionVehiculoId }).then(r => r.data),
  pagar: (id) => api.put(`/facturas/${id}/pagar`).then(r => r.data),
  anular: (id) => api.put(`/facturas/${id}/anular`).then(r => r.data),
  ticket: (id) => api.get(`/facturas/${id}/ticket`).then(r => r.data.data),
  resumenHoy: () => api.get('/facturas/resumen/hoy').then(r => r.data.data),
};
