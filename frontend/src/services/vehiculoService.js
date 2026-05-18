import api from '../api/client';

export const vehiculoService = {
  getAll: () => api.get('/vehiculo').then(r => r.data.data || []),
  getById: (id) => api.get(`/vehiculo/${id}`).then(r => r.data.data),
  registerEntry: (placa, tipo, cascos = 0) =>
    api.post('/vehiculo', { placa: placa.toUpperCase(), tipo, cascos: Number(cascos) }).then(r => r.data),
  processExit: (placa, tipo) =>
    api.post('/vehiculo', { placa: placa.toUpperCase(), tipo }).then(r => r.data),
};
