import api from '../api/client';

export const reporteService = {
  ingresos: (desde, hasta) =>
    api.get(`/reportes/ingresos?fecha_desde=${desde}&fecha_hasta=${hasta}`).then(r => r.data.data || []),
  frecuentes: () => api.get('/reportes/frecuentes').then(r => r.data.data || []),
  resumenDiario: (fecha) =>
    api.get(`/reportes/resumen-diario?fecha=${fecha}`).then(r => r.data.data),
  ingresosSemana: () => api.get('/reportes/ingresos-semana').then(r => r.data.data || []),
  cuadre: (fecha) =>
    api.get(`/reportes/cuadre?fecha=${fecha}`).then(r => r.data.data),
};
