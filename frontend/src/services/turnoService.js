import api from '../api/client';

export const turnoService = {
  getAll: () => api.get('/turnos').then(r => r.data.data || []),
  create: (empleadoId) =>
    api.post('/turnos', { empleado_id: empleadoId, fecha_inicio: new Date().toISOString() }).then(r => r.data),
  cerrar: (id) =>
    api.put(`/turnos/${id}`, { fecha_fin: new Date().toISOString() }).then(r => r.data),
  activo: () => api.get('/turnos/activo').then(r => r.data.data),
};
