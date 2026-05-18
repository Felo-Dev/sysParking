import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import {
  ParkingCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  Car,
  Square,
  Wrench,
  Loader2,
  Grid3x3,
} from 'lucide-react';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const STATUS_CONFIG = {
  libre: {
    label: 'Libre',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    text: 'text-emerald-700',
    icon: Square,
  },
  ocupado: {
    label: 'Ocupado',
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-700',
    icon: Car,
  },
  reservado: {
    label: 'Reservado',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    text: 'text-amber-700',
    icon: ParkingCircle,
  },
  mantenimiento: {
    label: 'Mantenimiento',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-500',
    icon: Wrench,
  },
};

export default function EspaciosPage() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ codigo: '', estado: 'libre' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadSections = useCallback(async () => {
    try {
      const res = await api.get('/espacios/mapa');
      setSections(res.data.data || {});
    } catch (e) { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSections(); }, [loadSections]);

  const resetForm = () => {
    setForm({ codigo: '', estado: 'libre' });
    setEditing(null);
  };

  const openEdit = (space) => {
    setForm({ codigo: space.codigo, estado: space.estado });
    setEditing(space);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.codigo) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/espacios/${editing.id}`, form);
      } else {
        await api.post('/espacios', form);
      }
      setModalOpen(false);
      resetForm();
      loadSections();
    } catch (e) { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/espacios/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadSections();
    } catch (e) { /* ignore */ }
  };

  const espacios = Object.values(sections).flat() || [];
  const total = espacios.length;
  const occupied = espacios.filter((e) => e.estado === 'ocupado').length;
  const free = espacios.filter((e) => e.estado === 'libre').length;
  const maintenance = espacios.filter((e) => e.estado === 'mantenimiento').length;
  const reserved = espacios.filter((e) => e.estado === 'reservado').length;
  const sectionKeys = Object.keys(sections).sort();

  if (loading) return <Loading message="Cargando mapa de espacios..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Espacios</h1>
          <p className="text-gray-500 mt-1">Gestión de espacios del parqueadero</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Nuevo Espacio
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Square className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{free}</p>
            <p className="text-xs text-gray-500">Libres</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Car className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{occupied}</p>
            <p className="text-xs text-gray-500">Ocupados</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <ParkingCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{reserved}</p>
            <p className="text-xs text-gray-500">Reservados</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{maintenance}</p>
            <p className="text-xs text-gray-500">Mantenimiento</p>
          </div>
        </div>
      </div>

      {sectionKeys.length === 0 ? (
        <EmptyState icon={Grid3x3} message="No hay espacios configurados" description="Agrega espacios para ver el mapa" />
      ) : (
        <div className="space-y-6">
          {sectionKeys.map((section) => {
            const spaces = sections[section] || [];
            return (
              <div key={section} className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ParkingCircle className="w-5 h-5 text-primary-600" />
                  <h2 className="text-lg font-bold text-gray-900">Sección {section}</h2>
                  <span className="badge bg-gray-100 text-gray-600 ml-auto">{spaces.length} espacios</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {spaces.map((space) => {
                    const cfg = STATUS_CONFIG[space.estado] || STATUS_CONFIG.libre;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={space.id}
                        className={`${cfg.bg} ${cfg.border} ${cfg.text} border-2 rounded-xl p-3 flex flex-col items-center gap-1.5 transition-shadow hover:shadow-md cursor-pointer relative group`}
                        onClick={() => openEdit(space)}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">{space.codigo}</span>
                        <span className="text-[10px] font-medium opacity-80">{cfg.label}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(space); }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editing ? 'Editar Espacio' : 'Nuevo Espacio'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código
                </label>
                <input
                  className="input-field uppercase"
                  placeholder="A1"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                />
                <p className="text-xs text-gray-400 mt-1">Ej: A1, B2, C3</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  className="input-field"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  <option value="libre">Libre</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="reservado">Reservado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>

              {form.estado !== 'libre' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  {(() => {
                    const cfg = STATUS_CONFIG[form.estado];
                    const Icon = cfg.icon;
                    return (
                      <>
                        <Icon className={`w-5 h-5 ${cfg.text}`} />
                        <span className={`text-sm font-medium ${cfg.text}`}>{cfg.label}</span>
                      </>
                    );
                  })()}
                </div>
              )}
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
                disabled={saving || !form.codigo}
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

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Eliminar Espacio</h2>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de eliminar el espacio <strong>{deleteTarget.codigo}</strong>?
            </p>
            <p className="text-sm text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-primary flex-1 bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
