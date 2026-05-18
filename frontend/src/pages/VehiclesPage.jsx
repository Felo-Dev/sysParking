import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  Car,
  Plus,
  Search,
  X,
  Timer,
  Loader2,
  LogIn,
  LogOut,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { VEHICLE_TYPES, getVehicleType } from '../utils/vehicleTypes';
import notify from '../utils/notiflix';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const esClienteMensual = (placa) =>
    clientes.some((c) => c.placa?.toUpperCase() === placa?.toUpperCase());
  const [search, setSearch] = useState('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [exitModal, setExitModal] = useState(null);
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('1');
  const [cascos, setCascos] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState('dentro');

  const isToday = (d) => {
    if (!d) return false;
    const date = new Date(d);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const loadData = useCallback(async () => {
    try {
      const [vRes, tRes, cRes] = await Promise.all([
        api.get('/vehiculo'),
        api.get('/tarifas'),
        api.get('/clientes'),
      ]);
      setVehicles(vRes.data.data || []);
      setTarifas(tRes.data.data || []);
      const clientes = cRes.data.data || [];
      setClientes(clientes);
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('es-CO') : null;

  const getDuration = (entrada, salida) => {
    const end = salida ? new Date(salida) : new Date();
    const diff = end - new Date(entrada);
    if (diff < 0) return '0h 0m';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const getDurationMinutes = (entrada, salida) => {
    const end = salida ? new Date(salida) : new Date();
    const diff = end - new Date(entrada);
    return Math.max(0, Math.ceil(diff / 60000));
  };

  const getTarifa = (tipoVehiculo) => {
    return tarifas.find((t) => String(t.tipo_vehiculo) === String(tipoVehiculo));
  };

  const calcEstimate = (vehicle) => {
    const mins = getDurationMinutes(vehicle.hora_entrada, null);
    const tarifa = getTarifa(vehicle.tipo);
    if (!tarifa) return null;
    const horas = Math.ceil(mins / 60);
    return {
      minutos: mins,
      horas: horas,
      valorHora: Number(tarifa.tarifa_valor),
      total: horas * Number(tarifa.tarifa_valor),
    };
  };

  const handleEntry = async () => {
    if (!placa) return;
    setSubmitting(true);
    try {
      const res = await api.post('/vehiculo', {
        placa: placa.toUpperCase(),
        tipo,
        cascos: Number(cascos) || 0,
      });
      setEntryModalOpen(false);
      setPlaca('');
      loadData();
      if (res.data.data?.id) {
        notify.success(`Entrada registrada para ${placa.toUpperCase()}`);
      }
    } catch (e) {
      notify.failure(e.response?.data?.message || 'Error al registrar entrada');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = async () => {
    if (!exitModal) return;
    setSubmitting(true);
    try {
      const res = await api.post('/vehiculo', {
        placa: exitModal.placa,
        tipo: exitModal.tipo,
      });

      const vehicle = res.data.data;

      if (!vehicle?.hora_salida) {
        notify.warning(
          vehicle?.id
            ? `El vehículo ${exitModal.placa} ya había salido. Se registró una nueva entrada.`
            : 'No se pudo procesar la salida'
        );
        setExitModal(null);
        loadData();
        return;
      }

      const fac = await api.post('/facturas/generar', {
        gestion_vehiculo_id: vehicle.id,
      });
      setExitModal(null);
      loadData();
      if (fac.data.data) {
        if (fac.data.message === 'cliente_mensual') {
          notify.success(`Salida registrada\nPlaca: ${exitModal.placa}\nCliente mensual: ${fac.data.data.cliente}`);
        } else {
          const total = Number(fac.data.data.total).toLocaleString('es-CO', {
            minimumFractionDigits: 2,
          });
          notify.success(`Salida registrada\nFactura #${String(fac.data.data.id).padStart(6, '0')}\nTotal: $${total}`);
        }
      }
    } catch (e) {
      const msg = e.response?.data?.message;
      notify.failure(msg || 'Error al registrar salida');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vehicles.filter((v) =>
    v.placa.toLowerCase().includes(search.toLowerCase())
  );

  const dentro = filtered.filter((v) => !v.hora_salida);
  const salidosHoy = filtered.filter((v) => v.hora_salida && isToday(v.hora_salida));
  const todos = filtered;

  const tabs = [
    { id: 'dentro', label: 'Dentro', count: dentro.length, color: 'text-emerald-600', activeBg: 'bg-emerald-100', activeBorder: 'border-emerald-500' },
    { id: 'hoy', label: 'Salidos Hoy', count: salidosHoy.length, color: 'text-blue-600', activeBg: 'bg-blue-100', activeBorder: 'border-blue-500' },
    { id: 'todos', label: 'Todos', count: todos.length, color: 'text-gray-600', activeBg: 'bg-gray-100', activeBorder: 'border-gray-500' },
  ];

  const visibleVehicles = view === 'dentro' ? dentro : view === 'hoy' ? salidosHoy : todos;

  if (loading) return <Loading message="Cargando vehículos..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-500 mt-1">Registro de entrada y salida de vehículos</p>
        </div>
        <button
          onClick={() => { setPlaca(''); setTipo('1'); setCascos(0); setEntryModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Registrar Entrada
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
        {search && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            {filtered.length} resultados
          </span>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === tab.id
                ? `${tab.activeBg} ${tab.color} shadow-sm`
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              view === tab.id ? tab.activeBg : 'bg-gray-200'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {visibleVehicles.length === 0 ? (
        <EmptyState icon={Car} message={`No hay vehículos ${view === 'dentro' ? 'dentro' : view === 'hoy' ? 'que hayan salido hoy' : 'registrados'}`} description="Registra la entrada de un vehículo" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleVehicles.map((item) => {
            const dentro = !item.hora_salida;
            const vt = getVehicleType(item.tipo);
            const Icon = vt.icon;
            const estimate = dentro ? calcEstimate(item) : null;
            return (
              <div
                key={item.id}
                className={`card p-5 border-l-4 transition-shadow ${
                  dentro
                    ? 'border-l-emerald-500 hover:shadow-md'
                    : 'border-l-gray-200 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      dentro ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${dentro ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{item.placa}</h3>
                      <span className="text-xs text-gray-400">{vt.label}</span>
                    </div>
                  </div>
                  <span className={`badge ${
                    dentro
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {dentro ? 'DENTRO' : 'FUERA'}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <LogIn className="w-3.5 h-3.5 text-gray-400" />
                    Entrada: {formatDate(item.hora_entrada)}
                  </div>
                  {!dentro && (
                    <div className="flex items-center gap-2">
                      <LogOut className="w-3.5 h-3.5 text-gray-400" />
                      Salida: {formatDate(item.hora_salida)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <Timer className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {getDuration(item.hora_entrada, item.hora_salida) || 'En curso'}
                    </span>
                  </div>
                  {Number(item.cascos) > 0 && (
                    <div className="flex items-center gap-2 text-amber-600 font-medium text-xs">
                      <span>🪖 {item.cascos} casco{item.cascos > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {estimate && (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      Est. ${estimate.total.toLocaleString('es-CO')}
                    </div>
                  )}
                </div>

                {dentro && (
                  <button
                    onClick={() => setExitModal(item)}
                    className="btn-primary w-full mt-4 bg-amber-600 hover:bg-amber-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Dar Salida
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {entryModalOpen && (
        <div className="modal-overlay" onClick={() => setEntryModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Registrar Entrada</h2>
              <button
                onClick={() => setEntryModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                <input
                  className="input-field uppercase"
                  placeholder="ABC123"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de vehículo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VEHICLE_TYPES.map((vt) => {
                    const Icon = vt.icon;
                    return (
                      <button
                        key={vt.id}
                        onClick={() => setTipo(vt.id)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-colors ${
                          tipo === vt.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{vt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cascos <span className="text-gray-400 font-normal">($500 c/u)</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCascos(Math.max(0, cascos - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-gray-900 w-8 text-center">{cascos}</span>
                  <button
                    type="button"
                    onClick={() => setCascos(cascos + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEntryModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleEntry}
                disabled={submitting || !placa}
                className="btn-primary flex-1"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Registrar Entrada'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {exitModal && (
        <div className="modal-overlay" onClick={() => !submitting && setExitModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Confirmar Salida</h2>
              <button
                onClick={() => !submitting && setExitModal(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const vt = getVehicleType(exitModal.tipo);
              const Icon = vt.icon;
              const estimate = calcEstimate(exitModal);
              const esMensual = esClienteMensual(exitModal.placa);
              return (
                <div className="space-y-4">
                  {esMensual && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-blue-700">
                      <span>🪖</span>
                      <span className="text-sm font-medium">Cliente mensual — sin cobro por esta salida</span>
                    </div>
                  )}
                  <div className={`${esMensual ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'} border rounded-xl p-4 space-y-3`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Placa</span>
                      <span className="font-bold text-lg text-gray-900">{exitModal.placa}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tipo</span>
                      <span className="flex items-center gap-2 font-medium">
                        <Icon className="w-4 h-4" />
                        {vt.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Entrada</span>
                      <span className="font-medium">{formatDate(exitModal.hora_entrada)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Tiempo estacionado</span>
                      <span className="font-medium">{getDuration(exitModal.hora_entrada, null)}</span>
                    </div>
                    {esMensual ? (
                      <div className="pt-3 border-t border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Tipo</span>
                          <span className="font-medium text-blue-700">Cliente mensual</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">Cobro por esta salida</span>
                          <span className="font-medium text-blue-700">$0 (facturación mensual)</span>
                        </div>
                      </div>
                    ) : estimate ? (
                      <>
                        <div className="pt-3 border-t border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Tarifa por hora</span>
                            <span className="font-medium">
                              ${estimate.valorHora.toLocaleString('es-CO')}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Horas a cobrar</span>
                            <span className="font-medium">{estimate.horas}h (mín. 1)</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Estacionamiento</span>
                            <span className="font-medium">
                              ${estimate.total.toLocaleString('es-CO')}
                            </span>
                          </div>
                          {Number(exitModal.cascos) > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Cascos ({exitModal.cascos} × $500)</span>
                              <span className="font-medium">
                                ${(Number(exitModal.cascos) * 500).toLocaleString('es-CO')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t-2 border-amber-300">
                          <span className="text-base font-bold text-gray-900">Total a pagar</span>
                          <span className="text-xl font-bold text-amber-700">
                            ${(estimate.total + Number(exitModal.cascos || 0) * 500).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 pt-3 border-t border-amber-200 text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">No hay tarifa configurada para {vt.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setExitModal(null)}
                      disabled={submitting}
                      className="btn-secondary flex-1"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleExit}
                      disabled={submitting || (!estimate && !esMensual)}
                      className={`btn-primary flex-1 ${esMensual ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {esMensual ? 'Registrar Salida' : 'Confirmar Salida y Cobrar'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
