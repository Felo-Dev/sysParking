import { useState, useEffect, useCallback } from 'react';
import { tarifaService } from '../services/tarifaService';
import notify from '../utils/notiflix';
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { VEHICLE_TYPES, getVehicleType } from '../utils/vehicleTypes';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function RatesPage() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ tipo_vehiculo: '1', tarifa_valor: '', tarifa_hora_pago: '1' });
  const [saving, setSaving] = useState(false);

  const loadRates = useCallback(async () => {
    try {
      const data = await tarifaService.getAll();
      setRates(data || []);
    } catch (e) {
      notify.failure('Error al cargar tarifas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  const resetForm = () => {
    setForm({ tipo_vehiculo: '1', tarifa_valor: '', tarifa_hora_pago: '1' });
    setEditing(null);
  };

  const openEdit = (rate) => {
    setForm({
      tipo_vehiculo: rate.tipo_vehiculo,
      tarifa_valor: rate.tarifa_valor,
      tarifa_hora_pago: rate.tarifa_hora_pago,
    });
    setEditing(rate);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.tarifa_valor) return;
    setSaving(true);
    try {
      if (editing) {
        await tarifaService.update(editing.id, form);
        notify.success('Tarifa actualizada correctamente');
      } else {
        await tarifaService.create(form);
        notify.success('Tarifa creada correctamente');
      }
      setModalOpen(false);
      resetForm();
      loadRates();
    } catch (e) {
      notify.failure(e.response?.data?.message || 'Error al guardar tarifa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    notify.confirm(
      'Eliminar Tarifa',
      '¿Estás seguro de eliminar esta tarifa? Esta acción no se puede deshacer.',
      'Eliminar',
      'Cancelar',
      async () => {
        try {
          await tarifaService.delete(id);
          notify.success('Tarifa eliminada');
          loadRates();
        } catch (e) {
          notify.failure('Error al eliminar tarifa');
        }
      }
    );
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  if (loading) return <Loading message="Cargando tarifas..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarifas</h1>
          <p className="text-gray-500 mt-1">Configuración de tarifas por hora</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nueva Tarifa
        </button>
      </div>

      {rates.length === 0 ? (
        <EmptyState icon={DollarSign} message="No hay tarifas configuradas" description="Agrega una tarifa para comenzar" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rates.map((rate) => (
            <div key={rate.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getVehicleType(rate.tipo_vehiculo).color}`}>
                    {(() => {
                      const vt = getVehicleType(rate.tipo_vehiculo);
                      const Icon = vt.icon;
                      return <Icon className={`w-5 h-5 ${vt.iconColor}`} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getVehicleType(rate.tipo_vehiculo).label}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Cada {rate.tarifa_hora_pago} hora{rate.tarifa_hora_pago !== '1' ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(rate)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rate.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(rate.tarifa_valor)}
                </p>
                <p className="text-sm text-gray-500 mt-1">por hora</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar Tarifa' : 'Nueva Tarifa'}
              </h2>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de vehículo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VEHICLE_TYPES.map((vt) => {
                    const Icon = vt.icon;
                    return (
                      <button
                        key={vt.id}
                        onClick={() => setForm({ ...form, tipo_vehiculo: vt.id })}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-colors ${
                          form.tipo_vehiculo === vt.id
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
                  Valor por hora ($)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="5000"
                  value={form.tarifa_valor}
                  onChange={(e) => setForm({ ...form, tarifa_valor: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cobrar cada (horas)
                </label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="1"
                  min="1"
                  value={form.tarifa_hora_pago}
                  onChange={(e) => setForm({ ...form, tarifa_hora_pago: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.tarifa_valor}
                className="btn-primary flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editing ? (
                  'Actualizar'
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
