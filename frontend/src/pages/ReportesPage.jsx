import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Calendar, TrendingUp, FileText, Car, Search, BarChart3, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

function today() {
  return formatDate(new Date());
}

function thirtyDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return formatDate(d);
}

const summaryCards = [
  { key: 'total_ingresos', label: 'Total Ingresos', icon: TrendingUp, currency: true },
  { key: 'total_facturas', label: 'Total Facturas', icon: FileText },
  { key: 'total_vehiculos', label: 'Total Vehículos', icon: Car },
];

export default function ReportesPage() {
  const [fechaDesde, setFechaDesde] = useState(thirtyDaysAgo);
  const [fechaHasta, setFechaHasta] = useState(today);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [incomeData, setIncomeData] = useState([]);
  const [frequentData, setFrequentData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, incomeRes, frequentRes, weeklyRes] = await Promise.all([
        api.get('/reportes/resumen-diario', { params: { fecha: today() } }),
        api.get('/reportes/ingresos', { params: { fecha_desde: fechaDesde, fecha_hasta: fechaHasta } }),
        api.get('/reportes/frecuentes'),
        api.get('/reportes/ingresos-semana'),
      ]);
      setSummary(summaryRes.data.data || null);
      setIncomeData((incomeRes.data.data || []).map((item) => ({
        ...item,
        ingresos: Number(item.ingresos) || 0,
      })));
      setFrequentData(frequentRes.data.data || []);
      setWeeklyData((weeklyRes.data.data || []).map((item) => ({
        ...item,
        ingresos: Number(item.ingresos) || 0,
      })));
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Loading message="Cargando reportes..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Estadísticas e indicadores del parqueadero</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="input-field"
            />
          </div>
          <button onClick={loadData} className="btn-primary">
            <Search className="w-4 h-4" />
            Consultar
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const rawValue = summary?.[card.key] ?? 0;
            const value = card.currency ? formatCurrency(rawValue) : rawValue;
            return (
              <div key={card.key} className="card p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <card.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Ingresos Diarios</h2>
          </div>
          {incomeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Ingresos']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="ingresos" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={BarChart3} message="Sin datos de ingresos" />
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Ingresos Semanales</h2>
          </div>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="semana"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Ingresos']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={Activity} message="Sin datos semanales" />
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Vehículos Frecuentes</h2>
        </div>
        {frequentData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Placa</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Veces</th>
                </tr>
              </thead>
              <tbody>
                {frequentData.slice(0, 10).map((item, idx) => (
                  <tr key={item.placa || idx} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.placa}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{item.veces}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={Car} message="Sin datos de frecuencia" />
        )}
      </div>
    </div>
  );
}
