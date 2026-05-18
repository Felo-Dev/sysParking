export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleString('es-CO');
}

export function getDuration(entrada, salida) {
  const end = salida ? new Date(salida) : new Date();
  const diff = end - new Date(entrada);
  if (diff < 0) return '0h 0m';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function getDurationMinutes(entrada, salida) {
  const end = salida ? new Date(salida) : new Date();
  const diff = end - new Date(entrada);
  return Math.max(0, Math.ceil(diff / 60000));
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString('es-CO');
}
