import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/client';
import {
  Users,
  Car,
  FileText,
  Wallet,
  Clock,
  TrendingUp,
  RefreshCw,
  ParkingCircle,
  AlertTriangle,
  History,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import Loading from '../components/Loading';

const cards = [
  { key: 'clientes', label: 'Clientes', icon: Users, gradient: 'from-blue-400 to-blue-500', iconBg: 'bg-white/20' },
  { key: 'vehiculos_dentro', label: 'Vehículos Dentro', icon: Car, gradient: 'from-emerald-400 to-emerald-500', iconBg: 'bg-white/20' },
  { key: 'vehiculos_hoy', label: 'Ingresaron Hoy', icon: History, gradient: 'from-cyan-400 to-cyan-500', iconBg: 'bg-white/20' },
  { key: 'facturas_hoy', label: 'Facturas Hoy', icon: FileText, gradient: 'from-purple-400 to-purple-500', iconBg: 'bg-white/20' },
  { key: 'facturas_pagadas', label: 'Pagadas', icon: Wallet, gradient: 'from-teal-400 to-teal-500', iconBg: 'bg-white/20' },
  { key: 'facturas_pendientes', label: 'Pendientes', icon: Clock, gradient: 'from-amber-400 to-amber-500', iconBg: 'bg-white/20' },
  { key: 'total_ingresos', label: 'Ingresos Totales', icon: TrendingUp, gradient: 'from-indigo-400 to-indigo-500', iconBg: 'bg-white/20', currency: true },
  { key: 'ingresos_hoy', label: 'Ingresos Hoy', icon: TrendingUp, gradient: 'from-rose-400 to-rose-500', iconBg: 'bg-white/20', currency: true },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getOccupancyColor(pct) {
  if (pct >= 90) return 'from-red-400 to-red-500';
  if (pct >= 70) return 'from-orange-400 to-orange-500';
  if (pct >= 50) return 'from-amber-400 to-amber-500';
  return 'from-emerald-400 to-emerald-500';
}

function getOccupancyTextColor(pct) {
  if (pct >= 90) return 'text-red-600';
  if (pct >= 70) return 'text-amber-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-emerald-600';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, revenueRes, occupancyRes] = await Promise.all([
        api.get('/estadistica'),
        api.get('/estadistica/ingresos-mes'),
        api.get('/estadistica/ocupacion'),
      ]);
      setStats(statsRes.data.data);
      setRevenueData((revenueRes.data.data || []).map((item) => ({
        ...item,
        ingresos: Number(item.ingresos) || 0,
      })));
      setOccupancyData((occupancyRes.data.data || []).map((item) => ({
        ...item,
        ocupacion: Number(item.ocupacion) || 0,
        entradas: Number(item.entradas) || 0,
        salidas: Number(item.salidas) || 0,
      })));
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Loading message="Cargando panel principal..." />;

  const ocupacionPct = stats?.ocupacion_porcentaje ?? 0;
  const lugaresDisponibles = stats?.lugares_disponibles ?? 0;
  const vehiculosDentro = stats?.vehiculos_dentro ?? 0;
  const capacidadTotal = stats?.capacidad_total ?? 50;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.name || 'Usuario'}
          </h1>
          <p className="text-gray-500 mt-1">Resumen del sistema de parqueadero</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadData(); }}
          disabled={refreshing}
          className="btn-secondary"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {ocupacionPct >= 80 && (
        <div className={`flex items-center gap-3 p-4 rounded-xl text-white shadow-lg ${
          ocupacionPct >= 95 ? 'bg-red-500' : 'bg-amber-500'
        }`}>
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-semibold">
              {ocupacionPct >= 95
                ? '¡Parqueadero completamente lleno!'
                : 'Parqueadero casi lleno'}
            </p>
            <p className="text-sm opacity-90">
              {lugaresDisponibles} lugar{lugaresDisponibles !== 1 ? 'es' : ''} disponible{lugaresDisponibles !== 1 ? 's' : ''} de {capacidadTotal}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const rawValue = stats?.[card.key] ?? 0;
          const value = card.currency ? formatCurrency(rawValue) : rawValue;
          return (
            <div
              key={card.key}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg hover:shadow-xl transition-shadow duration-200`}
            >
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute top-3 right-3 opacity-15">
                <card.icon className="w-14 h-14" />
              </div>
              <div className="relative z-10">
                <div className={`inline-flex p-2 rounded-lg ${card.iconBg} mb-3`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-white/90">{card.label}</p>
                <p className="text-2xl font-bold mt-1 text-white drop-shadow-sm">{value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`rounded-xl bg-gradient-to-br ${getOccupancyColor(ocupacionPct)} p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ParkingCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Ocupación del Parqueadero</h2>
          </div>
          <span className="text-sm font-semibold text-white/90">
            {vehiculosDentro} / {capacidadTotal} lugares
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${Math.min(ocupacionPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {ocupacionPct >= 90 ? (
              <AlertTriangle className="w-5 h-5 text-red-200" />
            ) : (
              <Car className="w-5 h-5 opacity-80" />
            )}
            <span className="text-sm font-medium">
              {ocupacionPct >= 90
                ? '¡Casi lleno!'
                : `${lugaresDisponibles} lugares disponibles`}
            </span>
          </div>
          <span className="text-2xl font-bold">{ocupacionPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Mensuales</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="mes"
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
            <p className="text-gray-400 text-center py-12">Sin datos de ingresos</p>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ocupación Diaria (7 días)</h2>
          {occupancyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'entradas' ? 'Entradas' : 'Salidas',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="entradas"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="salidas"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Sin datos de ocupación</p>
          )}
        </div>
      </div>
    </div>
  );
}
