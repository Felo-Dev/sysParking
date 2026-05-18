import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  FileText,
  Search,
  Eye,
  DollarSign,
  Printer,
  X,
  Car,
  Clock,
  UserCheck,
} from 'lucide-react';
import notify from '../utils/notiflix';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const statusConfig = {
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  pagado: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagado' },
  anulado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulado' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ticketModal, setTicketModal] = useState(null);
  const [ticketData, setTicketData] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(false);

  const loadInvoices = useCallback(async () => {
    try {
      const res = await api.get('/facturas');
      setInvoices(res.data.data?.data || []);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const handlePagar = async (id) => {
    try {
      await api.put(`/facturas/${id}/pagar`);
      loadInvoices();
    } catch (e) {
      notify.failure(e.response?.data?.message || 'Error al pagar');
    }
  };

  const handleTicket = async (id) => {
    setLoadingTicket(true);
    setTicketModal(id);
    try {
      const res = await api.get(`/facturas/${id}/ticket`);
      setTicketData(res.data.data);
    } catch (e) {
      notify.failure('No se pudo generar el ticket');
      setTicketModal(null);
    } finally {
      setLoadingTicket(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('es-CO') : 'N/A';

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const filtered = invoices.filter(
    (inv) =>
      inv.placa?.toLowerCase().includes(search.toLowerCase()) ||
      String(inv.id).includes(search)
  );

  if (loading) return <Loading message="Cargando facturas..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
          <p className="text-gray-500 mt-1">Gestión de facturas y pagos</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por placa o factura..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} message="No hay facturas" description="Las facturas se generan automáticamente al registrar la salida de un vehículo" />
      ) : (
        <div className="grid gap-4">
          {filtered.map((item) => {
            const status = statusConfig[item.estado] || statusConfig.pendiente;
            return (
              <div key={item.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          Factura #{String(item.id).padStart(6, '0')}
                        </h3>
                        <span className={`badge ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5" />
                          {item.placa}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.tiempo_total || 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-primary-600 whitespace-nowrap">
                      {formatCurrency(item.total)}
                    </p>
                    {item.estado === 'pendiente' && (
                      <button
                        onClick={() => handlePagar(item.id)}
                        className="btn-primary text-sm"
                      >
                        <DollarSign className="w-4 h-4" />
                        Pagar
                      </button>
                    )}
                    <button
                      onClick={() => handleTicket(item.id)}
                      className="btn-secondary text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Ticket
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ticketModal && (
        <div className="modal-overlay" onClick={() => { setTicketModal(null); setTicketData(null); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Ticket de Factura</h2>
              <button
                onClick={() => { setTicketModal(null); setTicketData(null); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingTicket ? (
              <Loading message="Cargando ticket..." />
            ) : ticketData ? (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900">sysParking</h3>
                  <p className="text-sm text-gray-500">Ticket de pago</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Factura #</span>
                    <span className="font-medium">{ticketData.numero_factura || ticketModal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Placa</span>
                    <span className="font-medium">{ticketData.placa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipo</span>
                    <span className="font-medium">{ticketData.tipo_vehiculo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entrada</span>
                    <span className="font-medium">{ticketData.hora_entrada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Salida</span>
                    <span className="font-medium">{ticketData.hora_salida}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tiempo total</span>
                    <span className="font-medium">{ticketData.tiempo_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tarifa por hora</span>
                    <span className="font-medium">{ticketData.tarifa_por_hora}</span>
                  </div>
                  {ticketData.cascos > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cascos ({ticketData.cascos} × $500)</span>
                      <span className="font-medium">{ticketData.cascos_total}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary-600">{ticketData.total}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-400 pt-2">
                  <span>Estado: {ticketData.estado}</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    {ticketData.atendido_por}
                  </span>
                </div>

                <button
                  onClick={() => window.print()}
                  className="btn-primary w-full mt-4"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Ticket
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Sin datos del ticket</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
