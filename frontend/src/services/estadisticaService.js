import api from '../api/client';

export const estadisticaService = {
  resumen: () => api.get('/estadistica').then(r => r.data.data),
  ingresosMes: () => api.get('/estadistica/ingresos-mes').then(r => r.data.data || []),
  ocupacion: () => api.get('/estadistica/ocupacion').then(r => r.data.data || []),
};
