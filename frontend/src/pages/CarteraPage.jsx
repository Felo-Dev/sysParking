import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  CreditCard,
  DollarSign,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const statusConfig = {
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  pagado: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagado' },
  vencido: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vencido' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CarteraPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pendientes');
  const [generating, setGenerating] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'pendientes' ? '/cartera/pendientes' : '/cartera';
      const res = await api.get(endpoint);
      setPayments(res.data.data || []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/cartera/generar-mensualidades');
      loadData();
    } catch (e) {
      /* ignore */
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id) => {
    setPayingId(id);
    try {
      await api.put(`/cartera/${id}/pagar`);
      loadData();
    } catch (e) {
      /* ignore */
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartera / Mora</h1>
          <p className="text-gray-500 mt-1">Seguimiento de pagos de clientes mensuales</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Generar Mensualidades
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {['pendientes', 'todos'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'pendientes' ? 'Pendientes' : 'Todos'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading message="Cargando cartera..." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          message="No hay pagos registrados"
          description="Genera las mensualidades usando el botón superior"
        />
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => {
            const status = statusConfig[payment.estado] || statusConfig.pendiente;
            const monthName = MONTHS[Number(payment.mes) - 1] || payment.mes;
            return (
              <div key={payment.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {payment.cliente?.nombre || 'Cliente'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {monthName} {payment.anio} — {formatCurrency(payment.monto)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
                      {payment.estado === 'pagado' ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : payment.estado === 'vencido' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {status.label}
                    </span>
                    {(payment.estado === 'pendiente' || payment.estado === 'vencido') && (
                      <button
                        onClick={() => handlePay(payment.id)}
                        disabled={payingId === payment.id}
                        className="btn-primary"
                      >
                        {payingId === payment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <DollarSign className="w-4 h-4" />
                        )}
                        Pagar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
