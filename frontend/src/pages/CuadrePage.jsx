import { useState, useEffect, useCallback, useRef } from 'react';
import { reporteService } from '../services/reporteService';
import {
  FileText,
  TrendingUp,
  Car,
  Shield,
  Printer,
  Search,
  Loader2,
  Wallet,
  Users,
  HelpCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatTime(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const statusStyle = {
  pagado: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagado' },
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
  anulado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulado' },
};

export default function CuadrePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fecha, setFecha] = useState(todayStr());
  const [imprimendo, setImprimendo] = useState(false);
  const printRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await reporteService.cuadre(fecha);
      setData(result);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, [fecha]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePrint = () => {
    setImprimendo(true);
    setTimeout(() => {
      window.print();
      setImprimendo(false);
    }, 300);
  };

  if (loading) return <Loading message="Cargando cuadre..." />;

  const v = data?.vehiculos;
  const r = data?.resumen;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cuadre Diario</h1>
          <p className="text-gray-500 mt-1">Reporte de cierre y reconciliación del día</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={loadData} className="btn-secondary">
            <Search className="w-4 h-4" />
            Consultar
          </button>
          {data && (
            <button onClick={handlePrint} className="btn-primary" disabled={imprimendo}>
              {imprimendo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              Imprimir Cuadre
            </button>
          )}
        </div>
      </div>

      {!data ? (
        <EmptyState icon={FileText} message="No hay datos para esta fecha" />
      ) : (
        <div ref={printRef} className="space-y-6" id="cuadre-print">
          <div className="card p-6">
            <div className="text-center mb-6 print:mb-4">
              <h2 className="text-xl font-bold text-gray-900">sysParking</h2>
              <p className="text-gray-500">Cuadre Diario — {new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(r?.total_ingresos)}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Ingresos Cobrados</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(r?.total_pendiente)}</p>
                <p className="text-xs text-amber-600 font-medium mt-1">Pendiente de Cobro</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(r?.total_general)}</p>
                <p className="text-xs text-blue-600 font-medium mt-1">Total General</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <p className="text-2xl font-bold text-purple-700">{r?.facturas_pagadas || 0} / {r?.total_facturas || 0}</p>
                <p className="text-xs text-purple-600 font-medium mt-1">Facturas Pagadas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Facturación
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Pagadas</td>
                      <td className="py-2 text-right font-semibold text-emerald-700">{r?.facturas_pagadas}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Pendientes</td>
                      <td className="py-2 text-right font-semibold text-amber-700">{r?.facturas_pendientes}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Anuladas</td>
                      <td className="py-2 text-right font-semibold text-red-700">{r?.facturas_anuladas}</td>
                    </tr>
                    <tr className="border-t border-gray-200 font-medium">
                      <td className="py-2 text-gray-900">Total</td>
                      <td className="py-2 text-right">{r?.total_facturas}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehículos
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Ingresaron</td>
                      <td className="py-2 text-right font-semibold">{v?.total_ingresados}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Salieron</td>
                      <td className="py-2 text-right font-semibold">{v?.total_salidas}</td>
                    </tr>
                    <tr className="border-b border-green-100">
                      <td className="py-2 text-green-700 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Facturados
                      </td>
                      <td className="py-2 text-right font-semibold text-green-700">{v?.facturados}</td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-2 text-blue-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Mensuales
                      </td>
                      <td className="py-2 text-right font-semibold text-blue-700">{v?.mensuales}</td>
                    </tr>
                    {v?.sin_factura > v?.mensuales && (
                      <tr className="border-b border-amber-100">
                        <td className="py-2 text-amber-700 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Pendientes
                        </td>
                        <td className="py-2 text-right font-semibold text-amber-700">{v?.sin_factura - v?.mensuales}</td>
                      </tr>
                    )}
                    <tr className="border-t border-gray-200 font-medium">
                      <td className="py-2 text-gray-900">Tot. Ingresaron</td>
                      <td className="py-2 text-right">{v?.total_ingresados}</td>
                    </tr>
                  </tbody>
                </table>
                {v?.total_ingresados > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Conciliación:</p>
                    <p className="text-xs text-gray-600">
                      {v?.total_ingresados} vehículos = {v?.facturados} facturados + {v?.mensuales} mensuales
                      {v?.sin_factura > v?.mensuales ? ` + ${v?.sin_factura - v?.mensuales} pendientes` : ''}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Por Tipo
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {v?.por_tipo?.map((t) => (
                      <tr key={t.tipo_id} className="border-b border-gray-50">
                        <td className="py-2 text-gray-500">{t.nombre}</td>
                        <td className="py-2 text-right font-semibold">{t.cantidad}</td>
                      </tr>
                    ))}
                    {(!v?.por_tipo || v.por_tipo.length === 0) && (
                      <tr><td className="py-2 text-gray-400 text-center" colSpan="2">Sin datos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Cascos
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Alquilados hoy</td>
                      <td className="py-2 text-right font-semibold">{data.cascos.total_alquilados}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">Ingresos por cascos</td>
                      <td className="py-2 text-right font-semibold text-emerald-700">{formatCurrency(data.cascos.ingresos_cascos)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {v?.lista_mensuales?.length > 0 && (
            <div className="card p-6 border-l-4 border-l-blue-500">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Clientes Mensuales que Ingresaron Hoy
                <span className="badge bg-blue-100 text-blue-700 text-xs">{v.mensuales}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Placa</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Cliente</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Entrada</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Salida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.lista_mensuales.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/50">
                        <td className="py-2.5 px-3 font-medium">{item.placa}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-medium">{item.cliente}</td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{formatTime(item.hora_entrada)}</td>
                        <td className="py-2.5 px-3 text-gray-500 text-xs">{item.hora_salida ? formatTime(item.hora_salida) : 'Dentro'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Estos vehículos NO generan factura por ser clientes de mensualidad. Su pago se maneja en Cartera.
                </p>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detalle de Facturas del Día
            </h3>
            {data.detalle_facturas?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Placa</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Tipo</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Entrada</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Salida</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Tiempo</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">Cascos</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600">Total</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.detalle_facturas.map((f) => {
                      const st = statusStyle[f.estado] || statusStyle.pendiente;
                      return (
                        <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-mono text-gray-400">{f.numero}</td>
                          <td className="py-2.5 px-3 font-medium">{f.placa}</td>
                          <td className="py-2.5 px-3 text-gray-500">{f.tipo_vehiculo}</td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs">{formatTime(f.hora_entrada)}</td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs">{formatTime(f.hora_salida)}</td>
                          <td className="py-2.5 px-3 text-gray-500">{f.tiempo_total}</td>
                          <td className="py-2.5 px-3 text-right">{f.cascos > 0 ? f.cascos : '-'}</td>
                          <td className="py-2.5 px-3 text-right font-semibold">{formatCurrency(f.total)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`badge ${st.bg} ${st.text}`}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No se generaron facturas en esta fecha</p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cuadre-print, #cuadre-print * { visibility: visible; }
          #cuadre-print { position: absolute; left: 0; top: 0; width: 100%; }
          .card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          button, .btn-primary, .btn-secondary, input[type="date"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
