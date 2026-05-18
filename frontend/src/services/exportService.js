const API_URL = '/api';

export const exportService = {
  facturasCSV: () => `${API_URL}/exportar/facturas`,
  clientesCSV: () => `${API_URL}/exportar/clientes`,
  vehiculosCSV: () => `${API_URL}/exportar/vehiculos`,
};
